import { Sparkle, Sprout, Smile, Flame, Trophy, BookOpen, type LucideProps } from "lucide-react";
import type { VocabularyStatus } from "@/types";

export interface StatusIconProps extends LucideProps {
  status: VocabularyStatus;
}

const STATUS_ICONS: Record<VocabularyStatus, React.ComponentType<LucideProps>> = {
  new: Sparkle,
  learning: Sprout,
  familiar: Smile,
  strong: Flame,
  mastered: Trophy,
};

export function StatusIcon({ status, className, ...props }: StatusIconProps) {
  const Icon = STATUS_ICONS[status] ?? BookOpen;
  return <Icon className={className} {...props} />;
}
