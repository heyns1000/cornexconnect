import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-blue-600",
  className
}: MetricCardProps) {
  const changeColorClass = {
    positive: "text-green-600",
    negative: "text-red-600", 
    neutral: "text-gray-600"
  }[changeType];

  return (
    <Card className={cn("bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={cn("text-sm mt-1", changeColorClass)}>
                {changeType === "positive" && "↗ "}
                {changeType === "negative" && "↙ "}
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center ml-4 shadow-lg bg-gradient-to-br",
            iconColor.includes("blue") && "from-blue-500 to-blue-600",
            iconColor.includes("green") && "from-green-500 to-green-600", 
            iconColor.includes("purple") && "from-purple-500 to-purple-600",
            iconColor.includes("orange") && "from-orange-500 to-orange-600",
            iconColor.includes("red") && "from-red-500 to-red-600"
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
