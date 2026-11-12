import React from "react";
import AppShell from "../../components/AppShell.jsx";
import { SLUG_TO_TOOL_MAP } from "../../data/toolCatalog.js";

export default function ToolDetailPage({ slug }) {
  const toolId = (slug && SLUG_TO_TOOL_MAP[slug]) || "merge";
  return <AppShell initialView="tool" initialTool={toolId} />;
}

export async function getServerSideProps(context) {
  return { props: { slug: context.params?.slug || "merge-pdf" } };
}
