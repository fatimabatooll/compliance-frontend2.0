import { BookOpen, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreCardsProps {
  domainScore: number
  domainMaturity: string
  dimensionScore: number
  dimensionMaturity: string
}

const getMaturityColor = (maturity: string) => {
  switch (maturity.toLowerCase()) {
    case "initial":
      return "text-red-500"
    case "developing":
      return "text-orange-500"
    case "established":
      return "text-blue-500"
    case "transformative":
      return "text-purple-500"
    default:
      return "text-muted-foreground"
  }
}

export function ScoreCards({
  domainScore,
  domainMaturity,
  dimensionScore,
  dimensionMaturity,
}: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Domain Score Card */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-purple-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Domain Score
            </p>
            <h3 className="text-3xl font-bold text-foreground">{domainScore}</h3>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <FolderOpen className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Maturity:
          </span>
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-wide",
              getMaturityColor(domainMaturity)
            )}
          >
            {domainMaturity}
          </span>
        </div>
      </div>

      {/* Dimension Score Card */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-pink-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Dimension Score
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {dimensionScore}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-pink-500/10">
            <BookOpen className="h-6 w-6 text-pink-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Maturity:
          </span>
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-wide",
              getMaturityColor(dimensionMaturity)
            )}
          >
            {dimensionMaturity}
          </span>
        </div>
      </div>
    </div>
  )
}
