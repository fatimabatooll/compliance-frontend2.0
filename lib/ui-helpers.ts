import type { CompanyStatus } from "@/services/companyService";

export function getMaturityLabel(score: number): string {
  if (score <= 0) return "Not Started";
  if (score <= 25) return "Learner";
  if (score <= 50) return "Explorer";
  if (score <= 75) return "Transformative";
  return "Professional";
}

export function getMaturityColor(score: number): string {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-chart-3";
  return "text-destructive";
}

export function getStatusColor(status: CompanyStatus): string {
  switch (status) {
    case "evaluated":
      return "bg-accent/15 text-accent border-accent/30";
    case "in-progress":
      return "bg-primary/15 text-primary border-primary/30";
    case "pending":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
