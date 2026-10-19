import { inquiryStatuses } from "@/messages/mn";

const styles: Record<keyof typeof inquiryStatuses, string> = {
  NEW: "bg-accent text-accent-ink",
  CONTACTED: "bg-accent-soft text-accent",
  QUOTED: "bg-surface-2 text-ink",
  STARTED: "bg-ink text-bg",
  DONE: "bg-success/15 text-success",
};

export function StatusChip({ status }: { status: keyof typeof inquiryStatuses }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${styles[status]}`}>{inquiryStatuses[status]}</span>
  );
}
