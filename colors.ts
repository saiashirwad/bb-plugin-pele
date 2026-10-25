type Property = "fill" | "stroke";
type Adapter = Partial<Record<Property, (color: string) => string>>;

const tinted = (color: string, percent: number, base: string, chroma: number) =>
  `oklch(from color-mix(in oklab, ${color} ${percent}%, ${base}) l calc(c * ${chroma}) h)`;

const shape: Adapter = {
  fill: (color) => tinted(color, 28, "var(--card)", 2.2),
  stroke: (color) => tinted(color, 80, "var(--card)", 1.2),
};

const text: Adapter = {
  fill: (color) => tinted(color, 18, "var(--foreground)", 2),
};

function adaptDeclarations(style: string, adapter: Adapter): string {
  return style.replace(
    /(^|;)\s*(fill|stroke)\s*:\s*([^;]+)/g,
    (declaration, separator: string, property: Property, value: string) => {
      const adapt = adapter[property];
      const color = value.trim();
      if (adapt === undefined || color.includes("var(") || color === "none") {
        return declaration;
      }
      return `${separator}${property}:${adapt(color)}`;
    },
  );
}

export function adaptAuthorColors(svg: string): string {
  return svg.replace(
    /<(\w+)([^>]*?) style="([^"]*)"/g,
    (_, tag: string, attributes: string, style: string) => {
      const adapter = tag === "text" || tag === "tspan" ? text : shape;
      return `<${tag}${attributes} style="${adaptDeclarations(style, adapter)}"`;
    },
  );
}
