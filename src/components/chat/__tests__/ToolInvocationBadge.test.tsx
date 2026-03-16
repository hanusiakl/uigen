import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Viewing' label for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleting old.jsx")).toBeDefined();
});

test("shows 'Renaming' label for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renaming old.jsx → new.jsx")).toBeDefined();
});

test("falls back to tool name for unknown tool", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      args={{}}
      state="result"
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows spinner when state is not result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows green dot and no spinner when state is result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
