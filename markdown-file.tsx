import { useEffect, useMemo, useState } from "react";
import {
  Markdown,
  useSdk,
  type PluginFileOpenerProps,
} from "@get-bb/plugin-sdk/app";
import { MermaidFence } from "./mermaid";

type Segment =
  | { kind: "markdown"; text: string }
  | { kind: "mermaid"; code: string };

const mermaidFence = /^```mermaid[^\n]*\n([\s\S]*?)^```[ \t]*$/gm;

function splitAtMermaidFences(source: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of source.matchAll(mermaidFence)) {
    segments.push({ kind: "markdown", text: source.slice(cursor, match.index) });
    segments.push({ kind: "mermaid", code: match[1] ?? "" });
    cursor = match.index + match[0].length;
  }
  segments.push({ kind: "markdown", text: source.slice(cursor) });
  return segments.filter((s) => s.kind === "mermaid" || s.text.trim() !== "");
}

function useWorkspaceText({ path, source }: PluginFileOpenerProps) {
  const sdk = useSdk();
  const [text, setText] = useState<string | null>(null);
  const { projectId, environmentId } = source;

  useEffect(() => {
    if (source.kind !== "workspace" || projectId === null || environmentId === null) return;
    const controller = new AbortController();
    sdk.projects
      .fileContent({
        projectId,
        path,
        signal: controller.signal,
        environmentId,
      })
      .then((file) => {
        if (file.contentEncoding === "utf8") setText(file.content);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [sdk, source.kind, projectId, environmentId, path]);

  return text;
}

export function MarkdownFile(props: PluginFileOpenerProps) {
  const { Original, source, path } = props;
  const text = useWorkspaceText(props);
  const segments = useMemo(
    () => (text === null ? [] : splitAtMermaidFences(text)),
    [text],
  );
  const document =
    source.threadId !== null && source.environmentId !== null
      ? {
          threadId: source.threadId,
          rootPath: path.split("/").slice(0, -1).join("/"),
          target: {
            kind: "workspace" as const,
            environmentId: source.environmentId,
            path,
          },
        }
      : undefined;

  if (text === null) return <Original />;

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      {segments.map((segment, index) =>
        segment.kind === "mermaid" ? (
          <MermaidFence
            key={index}
            code={segment.code}
            status="closed"
            Original={Original}
          />
        ) : (
          <Markdown
            key={index}
            content={segment.text}
            experimental_document={document}
          />
        ),
      )}
    </div>
  );
}
