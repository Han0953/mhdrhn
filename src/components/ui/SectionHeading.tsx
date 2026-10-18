import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  gradient?: "primary" | "accent" | "research";
  className?: string;
  number?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  gradient = "primary",
  className,
  number,
}: SectionHeadingProps) {
  const gradientClass = {
    primary: "text-gradient",
    accent: "text-gradient-accent",
    research: "text-gradient-research",
  }[gradient];

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {number && (
        <span className="block mb-2 font-mono text-sm md:text-base font-extrabold tracking-[0.25em] bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] bg-clip-text text-transparent uppercase">
          {number}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
          gradientClass
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground sm:text-lg md:mt-4 md:text-xl">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-4 h-1 w-16 rounded-full bg-gradient-to-r md:mt-6",
          gradient === "primary" && "from-electric to-cyan-brand",
          gradient === "accent" && "from-emerald-brand to-cyan-brand",
          gradient === "research" && "from-research to-electric",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
