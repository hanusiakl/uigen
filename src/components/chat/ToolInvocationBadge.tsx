"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";
  const file = path.split("/").pop() || path;
  const command = args.command;

  if (toolName === "str_replace_editor") {
    if (command === "create") return `Creating ${file}`;
    if (command === "str_replace" || command === "insert" || command === "undo_edit") return `Editing ${file}`;
    if (command === "view") return `Viewing ${file}`;
  }

  if (toolName === "file_manager") {
    if (command === "delete") return `Deleting ${file}`;
    if (command === "rename") {
      const newFile = typeof args.new_path === "string" ? args.new_path.split("/").pop() || args.new_path : "";
      return `Renaming ${file} → ${newFile}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const label = getLabel(toolName, args);
  const done = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
