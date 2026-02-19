"use client";

import { cn } from "@/lib/utils";

type Props = {
  data: {
    domain: string;
    score: number;
    max: number;
  }[];
};

const MATURITY_LABELS = {
  0: "Not Started",
  1: "Learner",
  2: "Explorer",
  3: "Transformative",
  4: "Professional",
};

function getMaturityLevel(score: number) {
  if (score <= 0) return 0;
  if (score <= 25) return 1;
  if (score <= 50) return 2;
  if (score <= 75) return 3;
  return 4;
}

function getCircleColor(level: number) {
  switch (level) {
    case 1:
      return "text-orange-500";
    case 2:
      return "text-yellow-500";
    case 3:
      return "text-green-500";
    case 4:
      return "text-blue-500";
    default:
      return "text-muted-foreground";
  }
}

export default function DomainMaturityChart({ data }: Props) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
      {data.map((domain) => {
        const percentage = (domain.score / domain.max) * 100;
        const maturityLevel = getMaturityLevel(domain.score);

        return (
          <div
            key={domain.domain}
            className='flex flex-col items-center text-center'
          >
            {/* ✅ Circle */}
            <div className='relative h-28 w-28'>
              <svg className='h-full w-full -rotate-90'>
                <circle
                  cx='56'
                  cy='56'
                  r='48'
                  stroke='hsl(var(--border))'
                  strokeWidth='8'
                  fill='none'
                />
                <circle
                  cx='56'
                  cy='56'
                  r='48'
                  stroke='hsl(var(--primary))'
                  strokeWidth='8'
                  fill='none'
                  strokeDasharray={302}
                  strokeDashoffset={302 - (302 * percentage) / 100}
                  strokeLinecap='round'
                />
              </svg>

              {/* ✅ Score */}
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-xl font-bold text-foreground'>
                  {domain.score}
                </span>
                <span className='text-xs text-muted-foreground'>
                  /{domain.max}
                </span>
              </div>
            </div>

            {/* ✅ Labels */}
            <p className='text-sm font-medium text-foreground mt-3'>
              {domain.domain}
            </p>

            <p
              className={cn(
                "text-xs font-medium mt-1",
                getCircleColor(maturityLevel),
              )}
            >
              {MATURITY_LABELS[maturityLevel]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
