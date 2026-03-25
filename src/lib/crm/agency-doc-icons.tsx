import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileStack,
  Lightbulb,
  NotebookPen,
  ScrollText,
} from "lucide-react";

const HUB_ICON_MAP: Record<string, LucideIcon> = {
  "file-text": FileText,
  "file-stack": FileStack,
  lightbulb: Lightbulb,
  "notebook-pen": NotebookPen,
  "scroll-text": ScrollText,
};

export function hubDocIcon(iconKey: string | null | undefined): LucideIcon {
  const key = (iconKey ?? "file-text").toLowerCase();
  return HUB_ICON_MAP[key] ?? FileText;
}
