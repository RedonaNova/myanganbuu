// Big tappable radio/checkbox tiles: much easier on a phone than a <select>.
// Works without JS (plain form controls, styled via :has).
export function ChoiceGrid({
  legend,
  name,
  type,
  options,
  defaultValue = [],
  columns = 2,
}: {
  legend: string;
  name: string;
  type: "radio" | "checkbox";
  options: { value: string; label: string }[];
  defaultValue?: string[];
  columns?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-base font-semibold text-ink">{legend}</legend>
      <div className={`grid gap-2 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className={
              "flex min-h-14 cursor-pointer items-center justify-center rounded-control border border-line bg-surface px-3 text-center text-base leading-tight font-semibold " +
              "transition-colors duration-150 hover:border-ink-2 " +
              "has-checked:border-accent has-checked:bg-accent has-checked:text-accent-ink " +
              "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
            }
          >
            <input
              type={type}
              name={name}
              value={o.value}
              defaultChecked={defaultValue.includes(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
