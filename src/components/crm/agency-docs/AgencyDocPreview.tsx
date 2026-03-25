type AgencyDocPreviewProps = {
  text: string;
  emptyLabel?: string;
};

/** Renders stored plain text as paragraphs (blocks separated by blank lines). */
export default function AgencyDocPreview({
  text,
  emptyLabel = "No content yet — add text in the editor below.",
}: AgencyDocPreviewProps) {
  const blocks = text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-text-secondary dark:text-zinc-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <article
      className="max-w-2xl space-y-4 text-justify text-base leading-relaxed text-text-secondary dark:text-zinc-400"
      aria-label="Preview"
    >
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </article>
  );
}
