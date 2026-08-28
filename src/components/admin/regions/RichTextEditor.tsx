"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
}

/** Font-size presets exposed in the toolbar. An empty value clears the size
 *  (back to the prose default). Values are plain CSS sizes so they survive the
 *  sanitizer's `font-size` allow-list on both save and render. */
const FONT_SIZES: { label: string; value: string }[] = [
  { label: "Small", value: "0.875rem" },
  { label: "Normal", value: "" },
  { label: "Large", value: "1.25rem" },
  { label: "X-Large", value: "1.5rem" },
  { label: "XX-Large", value: "2rem" },
];

/* -------------------------------------------------------------------------- */
/* Inline SVG icons — self-contained (no icon dependency), 16px, currentColor. */
/* -------------------------------------------------------------------------- */
const svg = (paths: React.ReactNode) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {paths}
  </svg>
);

const BoldIcon = () => svg(<path d="M6.5 4h6a3.5 3.5 0 0 1 0 7h-6zM6.5 11h7a3.5 3.5 0 0 1 0 7h-7z" />);
const ItalicIcon = () => svg(<><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></>);
const UnderlineIcon = () => svg(<><path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" /></>);
const HighlightIcon = () => svg(<><path d="m9 11 6-6 4 4-6 6" /><path d="m9 11-2.5 2.5a2 2 0 0 0 0 3L8 18l1.5-1.5" /><line x1="4" y1="21" x2="12" y2="21" /></>);
const BulletListIcon = () => svg(<><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" /></>);
const OrderedListIcon = () => svg(<><line x1="10" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="10" y1="18" x2="20" y2="18" /><text x="2" y="8.5" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">1</text><text x="2" y="20.5" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">2</text></>);
const QuoteIcon = () => svg(<path d="M6 15a3 3 0 1 1 3-3v.5C9 15 7.5 17 5 18M15 15a3 3 0 1 1 3-3v.5c0 2.5-1.5 4.5-4 5.5" />);
const AlignLeftIcon = () => svg(<><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="17" y2="18" /></>);
const AlignCenterIcon = () => svg(<><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="5" y1="18" x2="19" y2="18" /></>);
const AlignRightIcon = () => svg(<><line x1="4" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="7" y1="18" x2="20" y2="18" /></>);
const ClearIcon = () => svg(<><path d="M8 6h13M5 6l4 13M12 6l-2.5 8" /><line x1="4" y1="21" x2="14" y2="21" /></>);
const UndoIcon = () => svg(<><path d="M9 7 4 12l5 5" /><path d="M4 12h11a5 5 0 0 1 0 10h-1" /></>);
const RedoIcon = () => svg(<><path d="m15 7 5 5-5 5" /><path d="M20 12H9a5 5 0 0 0 0 10h1" /></>);

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection: clicking a toolbar button would otherwise
      // blur the editor and collapse the selection before the command runs, so
      // formatting a highlighted range would silently do nothing.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-bloom-600 text-white shadow-sm"
          : "text-ink-600 hover:bg-white hover:text-ink-900 hover:shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-ink-200" aria-hidden />;
}

function Toolbar({ editor }: { editor: Editor }) {
  // The active block format for the "Paragraph / Heading" select.
  const blockFormat = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "p";

  const applyBlockFormat = (next: string) => {
    if (next === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
    else if (next === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  };

  const activeFontSize = (editor.getAttributes("textStyle").fontSize as string) || "";

  const applyFontSize = (next: string) => {
    if (next === "") editor.chain().focus().unsetFontSize().run();
    else editor.chain().focus().setFontSize(next).run();
  };

  const selectClass =
    "h-8 cursor-pointer rounded-md border border-ink-200 bg-white px-2 text-sm text-ink-700 transition-colors hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-bloom-400/40";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-100 bg-ink-50 p-1.5">
      <select
        aria-label="Text format"
        title="Text format"
        className={selectClass}
        value={blockFormat}
        // Native selects steal focus on mousedown too; preserve the selection.
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => applyBlockFormat(e.target.value)}
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <select
        aria-label="Font size"
        title="Font size"
        className={selectClass}
        value={activeFontSize}
        onChange={(e) => applyFontSize(e.target.value)}
      >
        {FONT_SIZES.map((s) => (
          <option key={s.label} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <Divider />

      <ToolbarButton label="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton label="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton label="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton label="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <HighlightIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <OrderedListIcon />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <QuoteIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRightIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <ClearIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton label="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <RedoIcon />
      </ToolbarButton>
    </div>
  );
}

/**
 * Rich-text editor (Tiptap) shared by legal-page content and product
 * descriptions. Emits HTML via onChange (empty content emits ""). `dir="rtl"`
 * is used for the Arabic editor. SSR-safe (immediatelyRender:false).
 */
export function RichTextEditor({ value, onChange, dir = "ltr", placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Highlight,
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "legal-prose min-h-60 max-w-none px-4 py-3 focus:outline-none",
        dir,
      },
      // Paste plain text as clean, separate paragraphs (Notion-style): each line
      // becomes its own paragraph, so pasted content is structured and bullet /
      // numbered lists work per line instead of wrapping one giant paragraph. Rich
      // HTML pastes (Word, web pages) keep Tiptap's default parser, and a single-line
      // paste is left alone — so this only rescues the multi-line plain-text case.
      handlePaste: (view, event) => {
        const data = event.clipboardData;
        if (!data) return false;
        const html = data.getData("text/html");
        const text = data.getData("text/plain");
        if (html && html.trim()) return false; // rich paste → default handler
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) return false; // single line → default handler
        const esc = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const el = document.createElement("div");
        el.innerHTML = lines.map((l) => `<p>${esc(l)}</p>`).join("");
        const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(el);
        view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
        return true;
      },
    },
    // Empty editors serialize to "<p></p>"; normalize to "" so empty blocks are
    // treated as empty by validators on both ends.
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Sync external value changes (e.g. selecting another page, or "Load default
  // template") into the editor — but never mid-typing (would move the caret).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-60 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-400">…</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white transition-shadow focus-within:border-bloom-400 focus-within:ring-2 focus-within:ring-bloom-400/25">
      <Toolbar editor={editor} />
      <div className="relative">
        {editor.isEmpty && placeholder ? (
          <p
            className="pointer-events-none absolute inset-s-0 top-0 px-4 py-3 text-sm text-ink-400"
            dir={dir}
            aria-hidden
          >
            {placeholder}
          </p>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
