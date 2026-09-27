/** Antwortkachel. Einfach- oder Mehrfachauswahl, optional mit Untertitel. */
export function Choice({
  label,
  hint,
  selected,
  multi,
  onClick,
  className = "",
}: {
  label: string;
  hint?: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-15 w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left ${
        selected ? "border-navy bg-mist shadow-[inset_0_0_0_1px_var(--color-navy)]" : "border-line bg-white"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`flex size-6 flex-none items-center justify-center text-sm font-bold text-white ${
          multi ? "rounded-md" : "rounded-full"
        } ${
          selected
            ? multi
              ? "border-[1.5px] border-navy bg-navy"
              : "border-[7px] border-navy bg-white"
            : "border-[1.5px] border-slate bg-white"
        }`}
      >
        {multi && selected ? "✓" : ""}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-bold leading-6">{label}</span>
        {hint && <span className="text-sm leading-5 text-slate">{hint}</span>}
      </span>
    </button>
  );
}
