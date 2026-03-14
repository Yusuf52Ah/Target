type SectionTitleProps = {
  label: string;
  title: string;
  description?: string;
};

export function SectionTitle({ label, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
        {label}
      </span>
      <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">{title}</h2>
      {description ? <p className="text-sm leading-relaxed text-slate-300 md:text-base">{description}</p> : null}
    </div>
  );
}
