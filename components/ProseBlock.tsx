interface ProseBlockProps {
  text: string;
  className?: string;
}

export default function ProseBlock({ text, className = "" }: ProseBlockProps) {
  const paragraphs = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-white/80 text-base leading-relaxed mb-4 last:mb-0"
        >
          {p}
        </p>
      ))}
    </div>
  );
}
