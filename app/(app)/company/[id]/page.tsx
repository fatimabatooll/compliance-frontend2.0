"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  FilePenLine,
  Pencil,
  Trash2,
} from "lucide-react";
import { getMaturityColor, getMaturityLabel } from "@/lib/ui-helpers";
import { cn } from "@/lib/utils";
import companyService, { type CompanyDetails } from "@/services/companyService";
import questionnaireService from "@/services/questionnaireService";
import { useAuth } from "@/hooks/useAuth";
import DimensionMaturityRadar from "@/components/charts/DimensionMaturityRadar";
import CircularProgress from "@/components/charts/CircularProgress";
import { AddCompanyModal } from "@/components/add-company-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DomainChartRow = {
  domain: string;
  score: number;
  max: number;
};

type DimensionChartRow = {
  name: string;
  value: number;
};

export default function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const readinessIndexType = searchParams.get("index") || "genai";
  const { token } = useAuth();

  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [domainScores, setDomainScores] = useState<DomainChartRow[]>([]);
  const [dimensionScores, setDimensionScores] = useState<DimensionChartRow[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const companyData = await companyService.getCompanyById(
          id,
          token,
          readinessIndexType,
        );
        setCompany(companyData);

        if (!companyData || companyData.status !== "evaluated") {
          setDomainScores([]);
          setDimensionScores([]);
          return;
        }

        try {
          const [domains, scores] = await Promise.all([
            questionnaireService.getDomains(readinessIndexType, token),
            questionnaireService.viewResponses(id, readinessIndexType, token),
          ]);

          const domainScoreMap = new Map(
            scores.map((item) => [item.domainId, item.domainScore]),
          );
          const dimensionScoreMap = new Map(
            scores.flatMap((item) =>
              item.dimensionScores.map((dimension) => [
                dimension.dimensionId,
                dimension.maturityLevel,
              ]),
            ),
          );

          setDomainScores(
            domains.map((domain) => ({
              domain: domain.title,
              score: domainScoreMap.get(domain.id) ?? 0,
              max: 100,
            })),
          );

          setDimensionScores(
            domains
              .flatMap((domain) =>
                domain.dimensions.map((dimension) => ({
                  name: dimension.title,
                  value: Number(dimensionScoreMap.get(dimension.id) ?? 0),
                })),
              )
              .slice(0, 12),
          );
        } catch {
          setDomainScores([]);
          setDimensionScores([]);
        }
      } catch (error: unknown) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to load company details.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token, readinessIndexType]);

  const maturityLabel = useMemo(() => {
    if (!company) return "-";
    return getMaturityLabel(company.readinessScore);
  }, [company]);

  const handleUpdateCompany = async (payload: any) => {
    if (!token || !company) return;
    const response = await companyService.updateCompany(
      company.id,
      payload,
      token,
    );
    setCompany((prev) =>
      prev
        ? {
            ...prev,
            name: payload.companyName ?? prev.name,
            industry: payload.industry ?? prev.industry,
            strength: payload.strength ?? prev.strength,
            personName: payload.personName ?? prev.personName,
            designation: payload.designation ?? prev.designation,
            email: payload.email ?? prev.email,
            contactNumber: payload.contactNumber ?? prev.contactNumber,
            companyImage: payload.companyImage ?? prev.companyImage,
          }
        : prev,
    );
    void response;
  };

  const handleDeleteCompany = async () => {
    if (!token || !company) return;
    try {
      setIsDeleting(true);
      setDeleteError("");
      await companyService.deleteCompany(company.id, token);
      router.push("/companies");
      router.refresh();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to delete company.";
      setDeleteError(message);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground'>
        Loading company details...
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

  if (!company) return <div>Company not found</div>;
  return (
    <div className='space-y-6'>
      <div>
        <Link
          href='/companies'
          className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors my-2'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          Back to companies
        </Link>
        <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2 capitalize'>
              {company.name}
            </h1>

            <p className='text-sm text-muted-foreground'>
              {company.industry} • {company.strength}
            </p>

            <p className='text-sm text-muted-foreground mt-1'>
              {company.personName} • {company.designation}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3 sm:justify-end'>
            {company.status === "evaluated" && (
              <Link
                href={`/company/${company.id}/questionnaire/genai`}
                className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
              >
                <FilePenLine className='h-4 w-4' />
                Update Answers
              </Link>
            )}
            {(company.status === "pending" ||
              company.status === "in-progress") && (
              <Link
                href={`/company/${company.id}/questionnaire/genai`}
                className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
              >
                <ClipboardCheck className='h-4 w-4' />
                {company.status === "pending"
                  ? "Start Assessment"
                  : "Continue Assessment"}
              </Link>
            )}
            <button
              type='button'
              onClick={() => setIsEditOpen(true)}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors'
            >
              <Pencil className='h-4 w-4' />
              Edit
            </button>
            <button
              type='button'
              onClick={() => setIsDeleteOpen(true)}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className='glass rounded-2xl p-6 border-l-4 border-l-primary'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-sm font-medium text-muted-foreground mb-2'>
              Overall Readiness Score
            </p>
            <div className='flex items-baseline gap-2'>
              <span
                className={cn(
                  "text-4xl font-bold",
                  getMaturityColor(company.readinessScore),
                )}
              >
                {company.readinessScore}
              </span>
              <span className='text-sm text-muted-foreground'>/100</span>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-xs font-medium text-muted-foreground mb-1'>
              Maturity Level
            </p>
            <p className='text-lg font-semibold text-accent'>{maturityLabel}</p>
          </div>
        </div>
      </div>

      {company.status !== "evaluated" ? (
        <div className='glass rounded-2xl p-12 flex flex-col items-center justify-center min-h-96'>
          <h2 className='text-xl font-semibold text-foreground mb-2'>
            Assessment Not Completed
          </h2>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            This company has not completed the selected readiness assessment
            yet.
          </p>
        </div>
      ) : (
        <>
          <div className='flex flex-col gap-6'>
            <div className='glass rounded-2xl p-6'>
              <h2 className='text-lg font-semibold text-foreground mb-6 text-center sm:text-left'>
                Domain Maturity Overview
              </h2>

              <div className='grid grid-cols-1 min-[287px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
                {domainScores.map((domain) => (
                  <CircularProgress
                    key={domain.domain}
                    value={domain.score}
                    label={domain.domain}
                  />
                ))}
              </div>
            </div>

            <div className='glass rounded-2xl p-6'>
              <h2 className='text-lg font-semibold text-foreground sm:mb-6 text-center sm:text-left'>
                Dimension Maturity Analysis
              </h2>

              <DimensionMaturityRadar data={dimensionScores} />
            </div>
          </div>
        </>
      )}

      <AddCompanyModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode='edit'
        initialData={{
          companyName: company.name,
          industry: company.industry,
          strength: company.strength || "",
          contactPerson: company.personName || "",
          designation: company.designation || "",
          email: company.email || "",
          contactNumber: company.contactNumber || "",
          companyImage: company.companyImage,
        }}
        onSubmit={handleUpdateCompany}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{company.name}</strong> and
              its assessment data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className='rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCompany();
              }}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? "Deleting..." : "Delete Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
