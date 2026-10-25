import { definePluginApp } from "@get-bb/plugin-sdk/app";
import { MermaidFence } from "./mermaid";
import { MarkdownFile } from "./markdown-file";

export default definePluginApp((app) => {
  app.slots.experimental_codeFenceRenderer({
    id: "mermaid",
    languages: ["mermaid"],
    component: (props) => <MermaidFence {...props} />,
  });
  app.slots.fileOpener({
    id: "markdown",
    title: "Markdown (Pele)",
    extensions: ["md", "markdown"],
    component: MarkdownFile,
  });
});
