// Large on/off switch built on a real checkbox (role="switch").
export function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-4 rounded-control border border-line bg-surface p-4 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-base text-ink-2">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-8 w-14 shrink-0 rounded-full bg-line transition-colors duration-200 peer-checked:bg-accent after:absolute after:top-1 after:left-1 after:size-6 after:rounded-full after:bg-surface after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-6"
      />
    </label>
  );
}
