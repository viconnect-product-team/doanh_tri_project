import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Eraser, Heading2, Heading3, ImagePlus, Italic,
  Link2, List, ListOrdered, Loader2, Quote, Redo2, Strikethrough, Underline, Undo2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/content/i18n";
import { CMS_IMAGE_SIZES, CMS_MEDIA_BUCKET, CMS_MEDIA_LINK_SECONDS, CMS_MEDIA_TYPES, validateCmsImage } from "@/lib/cms-media";
import { isRichHtml, sanitizeRichHtml } from "@/lib/rich-text";
import { resize } from "./CmsImageUpload";

const FONTS = [
  { label: "Geist", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
];
const SIZES = ["", "14px", "16px", "18px", "20px", "24px", "28px"];
const COLORS = ["#0f172a", "#1e3a8a", "#15803d", "#b91c1c", "#a16207", "#6b7280"];

const toHtml = (v: string) => (!v || isRichHtml(v) ? v : v.split(/\n{2,}/).map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join(""));

function Btn({ on, label, active, children }: { on: () => void; label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={active} onMouseDown={(e) => e.preventDefault()} onClick={on}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, busy }: { editor: Editor; onImage: (f?: File) => void; busy: boolean }) {
  const e = t.cms.editor;
  const s = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive("bold"), italic: ed.isActive("italic"), underline: ed.isActive("underline"), strike: ed.isActive("strike"),
      h2: ed.isActive("heading", { level: 2 }), h3: ed.isActive("heading", { level: 3 }),
      bullet: ed.isActive("bulletList"), ordered: ed.isActive("orderedList"), quote: ed.isActive("blockquote"), link: ed.isActive("link"),
      left: ed.isActive({ textAlign: "left" }), center: ed.isActive({ textAlign: "center" }), right: ed.isActive({ textAlign: "right" }), justify: ed.isActive({ textAlign: "justify" }),
      font: (ed.getAttributes("textStyle")["fontFamily"] as string) ?? "", size: (ed.getAttributes("textStyle")["fontSize"] as string) ?? "",
    }),
  });
  const c = () => editor.chain().focus();
  const sel = "h-9 rounded-md border border-border bg-background px-2 text-sm";
  const sep = <span className="mx-1 h-6 w-px bg-border" />;
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/60 p-1.5">
      <select aria-label={e.font} value={s.font} className={sel} onChange={(ev) => (ev.target.value ? c().setFontFamily(ev.target.value).run() : c().unsetFontFamily().run())}>
        {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
      </select>
      <select aria-label={e.size} value={s.size} className={sel} onChange={(ev) => (ev.target.value ? c().setFontSize(ev.target.value).run() : c().unsetFontSize().run())}>
        {SIZES.map((z) => <option key={z} value={z}>{z ? z.replace("px", "") : e.size}</option>)}
      </select>
      {sep}
      <Btn label={e.bold} active={s.bold} on={() => c().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
      <Btn label={e.italic} active={s.italic} on={() => c().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
      <Btn label={e.underline} active={s.underline} on={() => c().toggleUnderline().run()}><Underline className="h-4 w-4" /></Btn>
      <Btn label={e.strike} active={s.strike} on={() => c().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
      <span className="flex items-center gap-0.5 px-1" aria-label={e.color}>
        {COLORS.map((col) => (
          <button key={col} type="button" title={e.color} aria-label={`${e.color} ${col}`} onMouseDown={(ev) => ev.preventDefault()} onClick={() => c().setColor(col).run()}
            className="h-5 w-5 rounded-full border border-border" style={{ background: col }} />
        ))}
      </span>
      {sep}
      <Btn label={e.h2} active={s.h2} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
      <Btn label={e.h3} active={s.h3} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
      <Btn label={e.bullet} active={s.bullet} on={() => c().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
      <Btn label={e.ordered} active={s.ordered} on={() => c().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn label={e.quote} active={s.quote} on={() => c().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
      {sep}
      <Btn label={e.left} active={s.left} on={() => c().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></Btn>
      <Btn label={e.center} active={s.center} on={() => c().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></Btn>
      <Btn label={e.right} active={s.right} on={() => c().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></Btn>
      <Btn label={e.justify} active={s.justify} on={() => c().setTextAlign("justify").run()}><AlignJustify className="h-4 w-4" /></Btn>
      {sep}
      <Btn label={e.link} active={s.link} on={() => {
        const url = window.prompt(e.linkPrompt, (editor.getAttributes("link")["href"] as string) ?? "https://");
        if (url === null) return;
        if (!url || !/^https:\/\//.test(url)) c().unsetLink().run();
        else c().extendMarkRange("link").setLink({ href: url }).run();
      }}><Link2 className="h-4 w-4" /></Btn>
      <label title={e.image} aria-label={e.image} className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-muted ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        <input type="file" accept={CMS_MEDIA_TYPES.join(",")} className="sr-only" disabled={busy} onChange={(ev) => { onImage(ev.target.files?.[0]); ev.target.value = ""; }} />
      </label>
      <Btn label={e.clear} on={() => c().unsetAllMarks().clearNodes().run()}><Eraser className="h-4 w-4" /></Btn>
      {sep}
      <Btn label={e.undo} on={() => c().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
      <Btn label={e.redo} on={() => c().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
    </div>
  );
}

export function RichTextEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const e = t.cms.editor;
  const [html, setHtml] = useState(() => toHtml(defaultValue));
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, protocols: ["https"], HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image, TextStyle, Color, FontFamily, FontSize,
    ],
    content: html,
    editorProps: { attributes: { class: "rich-text min-h-[260px] px-4 py-3 focus:outline-none" } },
    onUpdate: ({ editor: ed }) => setHtml(ed.isEmpty ? "" : ed.getHTML()),
  });

  async function insertImage(file?: File) {
    if (!file || !editor) return;
    if (!validateCmsImage(file)) { setErr(e.uploadError); return; }
    setBusy(true); setErr("");
    try {
      const bucket = supabase.storage.from(CMS_MEDIA_BUCKET);
      const path = `posts/${crypto.randomUUID()}-inline.webp`;
      const up = await bucket.upload(path, await resize(file, CMS_IMAGE_SIZES.large), { contentType: "image/webp" });
      if (up.error) throw up.error;
      const { data } = await bucket.createSignedUrl(path, CMS_MEDIA_LINK_SECONDS);
      if (!data?.signedUrl) throw new Error("link");
      editor.chain().focus().setImage({ src: data.signedUrl, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch { setErr(e.uploadError); }
    setBusy(false);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <input type="hidden" name={name} value={html} />
      <div className="flex border-b border-border text-sm">
        {[false, true].map((p) => (
          <button key={String(p)} type="button" onClick={() => setPreview(p)} aria-pressed={preview === p}
            className={`px-4 py-2 font-medium ${preview === p ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{p ? e.preview : e.write}</button>
        ))}
      </div>
      {preview
        ? <div className="rich-text min-h-[260px] px-4 py-3" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }} />
        : editor ? <><Toolbar editor={editor} onImage={insertImage} busy={busy} /><EditorContent editor={editor} /></> : <div className="min-h-[300px]" />}
      {err && <p role="alert" className="px-4 pb-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}

export function RichTextView({ value, className = "" }: { value: string; className?: string }) {
  return isRichHtml(value)
    ? <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />
    : <p className={`whitespace-pre-line ${className}`}>{value}</p>;
}
