// Shared admin control styles. Everything is sized for a thumb on a phone:
// controls are at least 56px tall and text is never below 16px (which also
// stops iOS from zooming into inputs).

export const labelClass = "mb-2 block text-base font-semibold text-ink";

export const fieldClass =
  "block w-full min-h-14 rounded-control border border-line bg-surface px-4 text-lg text-ink " +
  "placeholder:text-ink-2/70 transition-[border-color,box-shadow] duration-150 " +
  "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20";

export const primaryButtonClass =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-7 text-lg font-semibold text-accent-ink " +
  "transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-lg font-semibold text-ink " +
  "transition-[background-color,border-color,transform] duration-150 hover:border-ink-2 active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const cardClass = "rounded-card border border-line bg-surface";
