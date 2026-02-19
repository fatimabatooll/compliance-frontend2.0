"use client";

type Props = {
  value: number; // Score
  max?: number; // Default 100
  label: string; // Domain Name
};

export default function CircularProgress({ value, max = 100, label }: Props) {
  const percentage = Math.min((value / max) * 100, 100);

  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (circumference * percentage) / 100;

  return (
    <div className='flex flex-col items-center'>
      {/* ✅ Circle */}
      <div className='relative h-32 w-32'>
        <svg className='h-full w-full -rotate-90'>
          {/* Background */}
          <circle
            cx='64'
            cy='64'
            r={radius}
            stroke='hsl(var(--border))'
            strokeWidth={strokeWidth}
            fill='none'
          />

          {/* Progress */}
          <circle
            cx='64'
            cy='64'
            r={radius}
            stroke='hsl(var(--primary))'
            strokeWidth={strokeWidth}
            fill='none'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            className='transition-all duration-700 ease-out'
          />
        </svg>

        {/* ✅ Value */}
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-2xl font-bold text-foreground'>{value}%</span>
        </div>
      </div>

      {/* ✅ Label */}
      <p className='text-sm font-medium text-foreground mt-3 text-center'>
        {label}
      </p>
    </div>
  );
}
