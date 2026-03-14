"use client";

import { use, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import companyService from "@/services/companyService";
import questionnaireService, {
  type DimensionDetails,
  type DimensionQuestion,
  type Domain,
  type DomainScore,
} from "@/services/questionnaireService";

type FlatDimension = {
  domainId: string;
  domainTitle: string;
  dimensionId: string;
  dimensionTitle: string;
  index: number;
};

type AnswerValue = boolean | string | string[] | undefined;

type ScoreRecord = {
  dimensionScoreId?: string;
  responses: Record<string, string | boolean | string[]>;
};

const READINESS_INDEX = "genai";
const MIN_REQUIRED_ANSWERS_TO_SUBMIT = 80;
const SCORE_ALREADY_GENERATED_MESSAGE = "score already generated";

const hasAnswer = (value: AnswerValue) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const isScoreAlreadyGeneratedError = (message: string) =>
  message.toLowerCase().includes(SCORE_ALREADY_GENERATED_MESSAGE);

const getQuestionType = (question: DimensionQuestion) => {
  const type = question.type || "text";
  if (
    type === "binary" ||
    type === "checkbox" ||
    type === "list" ||
    type === "text"
  ) {
    return type;
  }
  return "text";
};

const cloneAnswers = (value: Record<string, string | boolean | string[]>) => {
  const next: Record<string, AnswerValue> = {};
  Object.entries(value).forEach(([key, item]) => {
    next[key] = Array.isArray(item) ? [...item] : item;
  });
  return next;
};

export default function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();

  const [companyName, setCompanyName] = useState("Company");
  const [dimensions, setDimensions] = useState<FlatDimension[]>([]);
  const [currentDimIndex, setCurrentDimIndex] = useState(0);
  const [currentDimensionDetails, setCurrentDimensionDetails] =
    useState<DimensionDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [initialAnswers, setInitialAnswers] = useState<
    Record<string, AnswerValue>
  >({});
  const [scoresByDimension, setScoresByDimension] = useState<
    Record<string, ScoreRecord>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentMeta = dimensions[currentDimIndex];
  const currentQuestions = currentDimensionDetails?.questions || [];
  const currentScoreRecord = currentMeta
    ? scoresByDimension[currentMeta.dimensionId]
    : undefined;
  const hasSavedDimension = Boolean(currentScoreRecord?.dimensionScoreId);

  const dimAnsweredCount = useMemo(
    () => currentQuestions.filter((q) => hasAnswer(answers[q.id])).length,
    [currentQuestions, answers],
  );
  const isCurrentDimComplete =
    currentQuestions.length > 0 && dimAnsweredCount === currentQuestions.length;

  const totalQuestionsEstimate = useMemo(
    () => Math.max(currentQuestions.length * Math.max(dimensions.length, 1), 1),
    [currentQuestions.length, dimensions.length],
  );
  const totalAnswered = useMemo(
    () =>
      Object.values(scoresByDimension).reduce((sum, record) => {
        return (
          sum +
          Object.values(record.responses).filter((value) => hasAnswer(value))
            .length
        );
      }, 0),
    [scoresByDimension],
  );
  const overallProgress = Math.min(
    100,
    Math.round((totalAnswered / totalQuestionsEstimate) * 100),
  );

  const effectiveAnsweredCount = useMemo(() => {
    if (!currentMeta) return totalAnswered;

    const currentSavedCount = Object.values(
      scoresByDimension[currentMeta.dimensionId]?.responses || {},
    ).filter((value) => hasAnswer(value)).length;

    return totalAnswered - currentSavedCount + dimAnsweredCount;
  }, [currentMeta, scoresByDimension, totalAnswered, dimAnsweredCount]);

  const canSubmitAssessment =
    isCurrentDimComplete &&
    effectiveAnsweredCount >= MIN_REQUIRED_ANSWERS_TO_SUBMIT;

  const isCurrentDimensionDirty = useMemo(() => {
    if (!hasSavedDimension || currentQuestions.length === 0) return false;

    const toComparable = (source: Record<string, AnswerValue>) => {
      return currentQuestions.reduce<Record<string, string>>(
        (acc, question) => {
          const value = source[question.id];
          const type = getQuestionType(question);

          if (type === "checkbox") {
            const singleValue = Array.isArray(value)
              ? value[0] || ""
              : typeof value === "string"
                ? value.trim()
                : "";
            acc[question.id] = singleValue;
            return acc;
          }

          if (type === "list") {
            const listValue = Array.isArray(value)
              ? value
              : typeof value === "string" && value.trim()
                ? [value.trim()]
                : [];
            acc[question.id] = listValue.slice().sort().join("|");
            return acc;
          }

          if (type === "binary") {
            const boolValue =
              value === true || value === "true" || value === "1";
            acc[question.id] = boolValue ? "true" : "false";
            return acc;
          }

          acc[question.id] = String(value || "").trim();
          return acc;
        },
        {},
      );
    };

    return (
      JSON.stringify(toComparable(answers)) !==
      JSON.stringify(toComparable(initialAnswers))
    );
  }, [hasSavedDimension, currentQuestions, answers, initialAnswers]);

  const buildFlatDimensions = (domains: Domain[]) => {
    let index = 0;
    return domains.flatMap((domain) =>
      domain.dimensions.map((dimension) => {
        const item = {
          domainId: domain.id,
          domainTitle: domain.title,
          dimensionId: dimension.id,
          dimensionTitle: dimension.title,
          index,
        };
        index += 1;
        return item;
      }),
    );
  };

  const buildScoresMap = (scores: DomainScore[]) => {
    const map: Record<string, ScoreRecord> = {};
    scores.forEach((domainScore) => {
      domainScore.dimensionScores.forEach((dim) => {
        const responses: Record<string, string | boolean | string[]> = {};
        dim.responses?.forEach((item) => {
          const questionId = item.question?.id;
          if (!questionId) return;
          const value = item.response;
          const questionType = item.question?.type || "text";

          if (questionType === "checkbox") {
            if (Array.isArray(value)) {
              const first = value
                .map((entry) => String(entry).trim())
                .find(Boolean);
              responses[questionId] = first ? [first] : [];
              return;
            }
            if (typeof value === "string") {
              const first = value
                .split("$")
                .map((entry) => entry.trim())
                .find(Boolean);
              responses[questionId] = first ? [first] : [];
              return;
            }
          }

          if (questionType === "list") {
            if (Array.isArray(value)) {
              responses[questionId] = value.map((entry) =>
                String(entry).trim(),
              );
              return;
            }
            if (typeof value === "string") {
              responses[questionId] = value
                .split("$")
                .map((entry) => entry.trim())
                .filter(Boolean);
              return;
            }
          }

          if (questionType === "binary") {
            if (typeof value === "boolean") {
              responses[questionId] = value;
              return;
            }
            if (typeof value === "string") {
              responses[questionId] = value === "true" || value === "1";
              return;
            }
          }

          if (typeof value === "boolean") {
            responses[questionId] = value;
          } else if (value !== undefined && value !== null) {
            responses[questionId] = String(value);
          }
        });
        map[dim.dimensionId] = {
          dimensionScoreId: dim.id as string | undefined,
          responses,
        };
      });
    });
    return map;
  };

  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [company, domains] = await Promise.all([
          companyService.getCompanyById(id, token, READINESS_INDEX),
          questionnaireService.getDomains(READINESS_INDEX, token),
        ]);

        const scores =
          company?.status === "pending"
            ? []
            : await questionnaireService.viewResponses(
                id,
                READINESS_INDEX,
                token,
              );

        if (company?.name) setCompanyName(company.name);

        const flatDimensions = buildFlatDimensions(domains);
        const scoresMap = buildScoresMap(scores);

        setDimensions(flatDimensions);
        setScoresByDimension(scoresMap);

        const firstIncomplete = flatDimensions.findIndex(
          (item) => !scoresMap[item.dimensionId],
        );
        setCurrentDimIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      } catch (error: unknown) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to load questionnaire.";
        if (isScoreAlreadyGeneratedError(message)) {
          router.replace("/companies");
          return;
        }
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id, token, router]);

  useEffect(() => {
    if (!token || !currentMeta) return;

    const loadCurrentDimension = async () => {
      try {
        setQuestionsLoading(true);
        const detail = await questionnaireService.getDimensionById(
          currentMeta.dimensionId,
          token,
        );
        setCurrentDimensionDetails(detail);
        const saved = cloneAnswers(
          scoresByDimension[currentMeta.dimensionId]?.responses || {},
        );
        setAnswers(saved);
        setInitialAnswers(saved);
      } catch {
        setCurrentDimensionDetails(null);
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadCurrentDimension();
  }, [currentMeta, token, scoresByDimension]);

  const handleAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  }, []);

  const getNextDimension = () => {
    const next = dimensions[currentDimIndex + 1];
    if (!next) return { currentDomain: 0, currentDimension: 0 };
    return { currentDomain: next.domainId, currentDimension: next.dimensionId };
  };

  const calculateScore = (question: DimensionQuestion, value: AnswerValue) => {
    const maxScore = question.maxScore || 1;
    const type = getQuestionType(question);

    if (!hasAnswer(value)) return 0;
    if (type === "binary") return value ? maxScore : 0;
    if (type === "text") return maxScore;
    if (type === "list") return maxScore;
    if (type === "checkbox") {
      if (Array.isArray(value) && question.checkboxes?.length) {
        return value.reduce((sum, selected) => {
          const match = question.checkboxes?.find(
            (item) => item.option === selected,
          );
          return sum + Number(match?.marks || 0);
        }, 0);
      }
      if (Array.isArray(value)) return Math.min(value.length, maxScore);
      return maxScore;
    }
    return 0;
  };

  const buildResponsesPayload = () => {
    return currentQuestions.map((question) => {
      const value = answers[question.id];
      const type = getQuestionType(question);
      const response =
        type === "checkbox" || type === "list"
          ? Array.isArray(value)
            ? value.join("$")
            : ""
          : type === "binary"
            ? Boolean(value)
            : String(value || "");

      return {
        questionId: question.id,
        response,
        maxScore: question.maxScore || 1,
        obtScore: calculateScore(question, value),
        type,
      };
    });
  };

  const refreshScores = async () => {
    if (!token) return;
    const scores = await questionnaireService.viewResponses(
      id,
      READINESS_INDEX,
      token,
    );
    setScoresByDimension(buildScoresMap(scores));
  };

  const handleSave = async (submitAfter = false) => {
    if (!token || !currentMeta || !currentDimensionDetails) return;

    try {
      setIsSaving(true);
      const next = getNextDimension();
      const responses = buildResponsesPayload();
      const existing = scoresByDimension[currentMeta.dimensionId];

      if (existing?.dimensionScoreId) {
        await questionnaireService.updateResponses(
          {
            companyId: id,
            domainId: currentMeta.domainId,
            dimensionId: currentMeta.dimensionId,
            dimensionScoreId: existing.dimensionScoreId,
            responses,
          },
          token,
        );
      } else {
        await questionnaireService.sendResponse(
          {
            companyId: id,
            index: READINESS_INDEX,
            domainId: currentMeta.domainId,
            dimensionId: currentMeta.dimensionId,
            currentDomain: next.currentDomain,
            currentDimension: next.currentDimension,
            responses,
          },
          token,
        );
      }

      await refreshScores();

      if (submitAfter) {
        await questionnaireService.submitQuestionnaire(
          { companyId: id, index: READINESS_INDEX },
          token,
        );
        router.replace("/companies");
        return;
      }

      if (currentDimIndex < dimensions.length - 1) {
        setCurrentDimIndex((prev) => prev + 1);
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to save responses.";
      if (isScoreAlreadyGeneratedError(message)) {
        router.replace("/companies");
        return;
      }
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryAction = async (submitAfter = false) => {
    if (!submitAfter && hasSavedDimension && !isCurrentDimensionDirty) {
      if (currentDimIndex < dimensions.length - 1) {
        setCurrentDimIndex((prev) => prev + 1);
      }
      return;
    }
    await handleSave(submitAfter);
  };

  const groupedDimensions = useMemo(() => {
    const groups: Record<string, FlatDimension[]> = {};
    dimensions.forEach((dimension) => {
      if (!groups[dimension.domainTitle]) groups[dimension.domainTitle] = [];
      groups[dimension.domainTitle].push(dimension);
    });
    return groups;
  }, [dimensions]);

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground'>
        Loading questionnaire...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
        {errorMessage}
      </div>
    );
  }

  if (!currentMeta) {
    return (
      <div className='rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground'>
        No questionnaire data available.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <div className='fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-24'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>
                {companyName}
              </h2>
              <p className='text-sm text-muted-foreground'>
                GenAI Readiness Assessment
              </p>
            </div>
            <div className='text-right'>
              <div className='text-sm font-medium text-foreground'>
                {overallProgress}% Complete
              </div>
              <p className='text-xs text-muted-foreground'>
                {totalAnswered} saved answers
              </p>
            </div>
          </div>
          <div className='w-full h-1 bg-secondary rounded-full overflow-hidden mt-4'>
            <div
              className='h-full bg-gradient-to-r from-primary to-accent transition-all duration-500'
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <main className='flex-1 px-4 pb-8 pt-32'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-full'>
            <div className='lg:col-span-1'>
              <div className='glass rounded-2xl p-4 sticky top-40 max-h-[calc(100vh-200px)] overflow-y-auto'>
                <h3 className='font-semibold text-foreground mb-4 text-sm uppercase tracking-wide'>
                  Assessment Progress
                </h3>

                {Object.entries(groupedDimensions).map(([domain, dims]) => (
                  <div key={domain} className='mb-6'>
                    <h4 className='text-xs font-bold text-foreground uppercase tracking-wider mb-3 opacity-70'>
                      {domain}
                    </h4>
                    <div className='space-y-2'>
                      {dims.map((dim) => {
                        const isActive = currentDimIndex === dim.index;
                        const saved = scoresByDimension[dim.dimensionId];
                        const isComplete = Boolean(saved);
                        return (
                          <button
                            key={dim.dimensionId}
                            onClick={() => setCurrentDimIndex(dim.index)}
                            className={cn(
                              "w-full text-left px-3 py-3 rounded-lg transition-all text-sm",
                              isActive
                                ? "bg-primary/15 border-l-2 border-primary text-primary font-semibold"
                                : isComplete
                                  ? "bg-accent/10 border-l-2 border-accent text-foreground"
                                  : "border-l-2 border-border text-muted-foreground",
                            )}
                          >
                            <div className='flex items-center justify-between'>
                              <span>{dim.dimensionTitle}</span>
                              {isComplete && (
                                <Check className='h-4 w-4 text-accent' />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='lg:col-span-2'>
              {questionsLoading ? (
                <div className='rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground'>
                  Loading questions...
                </div>
              ) : (
                <>
                  <div className='mb-6'>
                    <div className='mb-4'>
                      <span className='text-xs font-medium text-primary uppercase tracking-wider'>
                        {currentMeta.domainTitle} • Dimension{" "}
                        {currentDimIndex + 1} of {dimensions.length}
                      </span>
                      <h1 className='text-3xl font-bold text-foreground mt-2'>
                        {currentMeta.dimensionTitle}
                      </h1>
                    </div>
                    <div className='glass rounded-2xl p-4 mb-6'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-sm font-medium text-foreground'>
                          {dimAnsweredCount} of {currentQuestions.length}{" "}
                          answered
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium px-3 py-1 rounded-full",
                            isCurrentDimComplete
                              ? "bg-accent/15 text-accent"
                              : "bg-primary/15 text-primary",
                          )}
                        >
                          {isCurrentDimComplete ? "Complete ✓" : "In Progress"}
                        </span>
                      </div>
                      <div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            isCurrentDimComplete
                              ? "bg-gradient-to-r from-accent to-accent"
                              : "bg-gradient-to-r from-primary to-primary",
                          )}
                          style={{
                            width: `${
                              (dimAnsweredCount /
                                Math.max(currentQuestions.length, 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-6 mb-8'>
                    {currentQuestions.map((question, idx) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={idx}
                        answer={answers[question.id]}
                        onAnswer={handleAnswer}
                      />
                    ))}
                  </div>

                  <div className='glass rounded-2xl p-6 sticky bottom-0'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        {savedPulse && (
                          <div className='flex items-center gap-2 text-accent animate-pulse'>
                            <Save className='h-4 w-4' />
                            <span className='text-sm font-medium'>
                              Editing...
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/company/${id}`}
                        className='text-sm text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Exit Assessment
                      </Link>
                    </div>

                    <div className='flex items-center gap-3'>
                      {currentDimIndex > 0 && (
                        <button
                          onClick={() => setCurrentDimIndex((prev) => prev - 1)}
                          className='flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        >
                          <ArrowLeft className='h-4 w-4' />
                          Previous
                        </button>
                      )}
                      <div className='flex-1' />
                      {currentDimIndex === dimensions.length - 1 ? (
                        <button
                          onClick={() => handlePrimaryAction(true)}
                          disabled={!canSubmitAssessment || isSaving}
                          className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                            !canSubmitAssessment || isSaving
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-accent text-accent-foreground hover:bg-accent/90",
                          )}
                        >
                          <Check className='h-4 w-4' />
                          {isSaving
                            ? "Submitting..."
                            : hasSavedDimension && isCurrentDimensionDirty
                              ? "Update & Submit"
                              : "Complete Assessment"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePrimaryAction(false)}
                          disabled={!isCurrentDimComplete || isSaving}
                          className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                            !isCurrentDimComplete || isSaving
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                        >
                          {isSaving
                            ? "Saving..."
                            : hasSavedDimension
                              ? isCurrentDimensionDirty
                                ? "Update & Next"
                                : "Next"
                              : "Save & Next"}
                          <ArrowRight className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                    {currentDimIndex === dimensions.length - 1 &&
                      effectiveAnsweredCount <
                        MIN_REQUIRED_ANSWERS_TO_SUBMIT && (
                        <p className='mt-3 text-xs text-muted-foreground'>
                          Complete at least {MIN_REQUIRED_ANSWERS_TO_SUBMIT}{" "}
                          answered questions before submitting (
                          {effectiveAnsweredCount}/
                          {MIN_REQUIRED_ANSWERS_TO_SUBMIT}).
                        </p>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface QuestionCardProps {
  question: DimensionQuestion;
  index: number;
  answer?: AnswerValue;
  onAnswer: (questionId: string, value: AnswerValue) => void;
}

function QuestionCard({
  question,
  index,
  answer,
  onAnswer,
}: QuestionCardProps) {
  const type = getQuestionType(question);
  const questionDescription = question.description?.trim();
  const options =
    question.options ||
    question.checkboxes?.map((item) => item.option) ||
    (type === "binary" ? ["Yes", "No"] : []);

  return (
    <div className='glass rounded-2xl p-6 transition-all duration-300'>
      <div className='flex items-start gap-4 mb-4'>
        <div className='h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm'>
          {index + 1}
        </div>
        <div className='flex-1'>
          <div className='flex items-start gap-2'>
            <h3 className='text-base font-semibold text-foreground'>
              {question.question || question.text || "Question"}
            </h3>
            {questionDescription && (
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      className='mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground'
                      aria-label='Question description'
                    >
                      i
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs text-xs leading-relaxed'>
                    {questionDescription}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className='inline-block mt-2 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md'>
            {type}
          </span>
        </div>
      </div>

      {type === "checkbox" && (
        <div className='space-y-3'>
          {options.map((option, idx) => {
            const selectedOption = Array.isArray(answer)
              ? answer[0]
              : typeof answer === "string"
                ? answer
                : "";
            const selected = selectedOption === option;
            return (
              <button
                key={`${question.id}-${idx}`}
                onClick={() => {
                  const updated = selected ? [] : [option];
                  onAnswer(question.id || "", updated);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {type === "binary" && (
        <div className='flex gap-3'>
          {[true, false].map((value, idx) => (
            <button
              key={`${question.id}-${idx}`}
              onClick={() => onAnswer(question.id || "", value)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all",
                answer === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {value ? "Yes" : "No"}
            </button>
          ))}
        </div>
      )}

      {type === "text" && (
        <textarea
          value={typeof answer === "string" ? answer : ""}
          onChange={(e) => onAnswer(question.id || "", e.target.value)}
          placeholder={question.placeholder || "Enter your response..."}
          className='w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-all resize-none h-28 font-medium'
        />
      )}

      {type === "list" && (
        <textarea
          value={Array.isArray(answer) ? answer.join("\n") : ""}
          onChange={(e) =>
            onAnswer(
              question.id || "",
              e.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          placeholder='Enter one item per line...'
          className='w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-all resize-none h-28 font-medium'
        />
      )}
    </div>
  );
}
