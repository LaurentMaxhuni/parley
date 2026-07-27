"use client";

interface InlineImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function InlineImage({ src, alt = "", className = "" }: InlineImageProps) {
  return (
    <span
      className={`inline-block w-16 h-8 md:w-20 md:h-10 rounded-full align-middle bg-cover bg-center mx-2 ring-2 ring-ink-line/50 ${className}`}
      style={{ backgroundImage: `url(${src})`, backgroundSize: "cover" }}
      role="img"
      aria-label={alt}
    />
  );
}
