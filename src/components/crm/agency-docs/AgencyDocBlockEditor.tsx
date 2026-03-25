"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  type ReactNode,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Minus,
  Underline as UnderlineIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/core";

export type AgencyDocBlockEditorHandle = {
  getHtml: () => string;
};

type Props = {
  initialHtml: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

const AgencyDocBlockEditor = forwardRef<AgencyDocBlockEditorHandle, Props>(
  function AgencyDocBlockEditor(
    { initialHtml, disabled = false, autoFocus = true },
    ref
  ) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
        }),
        Underline,
      ],
      content: initialHtml || "<p></p>",
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "agency-doc-tiptap min-h-[120px] px-3 py-2 text-base leading-relaxed text-text-primary focus:outline-none dark:text-zinc-100 [&_hr]:my-4 [&_hr]:border-border dark:[&_hr]:border-zinc-600 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        },
      },
    });

    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled);
    }, [disabled, editor]);

    useEffect(() => {
      if (!autoFocus || !editor) return;
      const id = requestAnimationFrame(() => {
        editor.commands.focus("end");
      });
      return () => cancelAnimationFrame(id);
    }, [autoFocus, editor]);

    useImperativeHandle(
      ref,
      () => ({
        getHtml: () => {
          const html = editor?.getHTML().trim();
          if (!html || html === "<p></p>") return "<p></p>";
          return html;
        },
      }),
      [editor]
    );

    if (!editor) {
      return (
        <div className="min-h-[140px] animate-pulse rounded-lg border border-border bg-surface/80 dark:border-zinc-700 dark:bg-zinc-800/50" />
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div
          className="flex items-center gap-0.5 border-b border-border px-2 py-1.5 dark:border-zinc-700"
          role="toolbar"
          aria-label="Text formatting and structure"
        >
          <ToolbarBtn
            editor={editor}
            label="Bold"
            isActive={() => editor.isActive("bold")}
            onPress={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
          <ToolbarBtn
            editor={editor}
            label="Italic"
            isActive={() => editor.isActive("italic")}
            onPress={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
          <ToolbarBtn
            editor={editor}
            label="Underline"
            isActive={() => editor.isActive("underline")}
            onPress={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
          <span
            className="mx-1 h-6 w-px shrink-0 self-center bg-border dark:bg-zinc-600"
            aria-hidden
          />
          <ToolbarBtn
            editor={editor}
            label="Bullet list"
            isActive={() => editor.isActive("bulletList")}
            onPress={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
          <ToolbarBtn
            editor={editor}
            label="Numbered list"
            isActive={() => editor.isActive("orderedList")}
            onPress={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
          <ToolbarBtn
            editor={editor}
            label="Horizontal line"
            isActive={() => false}
            onPress={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </ToolbarBtn>
        </div>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

function ToolbarBtn({
  editor,
  label,
  isActive,
  onPress,
  children,
}: {
  editor: Editor;
  label: string;
  isActive: () => boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const active = isActive();
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPress()}
      disabled={!editor.isEditable}
      className={`rounded-md p-2 text-text-secondary transition-colors hover:bg-surface disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
        active
          ? "bg-surface text-accent dark:bg-zinc-800 dark:text-blue-400"
          : ""
      }`}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default AgencyDocBlockEditor;
