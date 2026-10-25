import { useEffect, useId, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import type { ExperimentalCodeFenceRendererProps } from "@get-bb/plugin-sdk/app";
import { render } from "pele";
import { adaptAuthorColors } from "./colors";

const tint = (percent: number) =>
  `color-mix(in oklab, var(--foreground) ${percent}%, var(--card))`;

const hostPalette = {
  "--pele-bg": "var(--card)",
  "--pele-fg": "var(--foreground)",
  "--pele-muted": "var(--muted-foreground)",
  "--pele-line": tint(45),
  "--pele-surface": tint(6),
  "--pele-surface-alt": tint(11),
  "--pele-border": tint(22),
  "--pele-accent": "var(--primary)",
  "--pele-radius": "8px",
  "--pele-series-1": "var(--chart-1)",
  "--pele-series-2": "var(--chart-2)",
  "--pele-series-3": "var(--chart-3)",
  "--pele-series-4": "var(--chart-4)",
  "--pele-series-5": "var(--chart-5)",
} as CSSProperties;

function renderSvg(code: string, idPrefix: string): string | null {
  try {
    const { svg } = render(code, {
      idPrefix,
      fontFamily: getComputedStyle(document.body).fontFamily,
      fontSize: 14,
      linkSchemes: ["https", "http"],
      images: false,
    });
    return adaptAuthorColors(svg);
  } catch {
    return null;
  }
}

export function MermaidFence({
  code,
  status,
  Original,
}: Pick<ExperimentalCodeFenceRendererProps, "code" | "status"> & {
  Original: React.ComponentType;
}) {
  const idPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svg = useMemo(() => renderSvg(code, idPrefix), [code, idPrefix]);
  const lastGood = useRef<string | null>(null);
  useEffect(() => {
    if (svg !== null) lastGood.current = svg;
  }, [svg]);

  const shown = svg ?? (status === "streaming" ? lastGood.current : null);
  if (shown === null) return <Original />;

  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-xl border border-border bg-card px-6 py-5 [&>svg]:shrink-0 [&_.pele-today]:opacity-40 [&_.pele-node.focus>:not(text)]:stroke-primary [&_.pele-node.focus>:not(text)]:stroke-2 [&_.pele-node.dim]:opacity-35"
      style={hostPalette}
      dangerouslySetInnerHTML={{ __html: shown }}
    />
  );
}
