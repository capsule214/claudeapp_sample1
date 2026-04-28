"use client";

import { useRef, useCallback, useEffect, ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Highlight from "@tiptap/extension-highlight";
import { TrashIcon } from "@heroicons/react/24/outline";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TableChartIcon from "@mui/icons-material/TableChart";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

export interface RichTextData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content: string;
}

interface Props {
  data: RichTextData;
  onUpdate: (id: string, updates: Partial<RichTextData>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

const snap = (v: number) => Math.round(v / 10) * 10;

// ツールバーボタン
function ToolBtn({
  onClick, active = false, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={[
        "p-0.5 rounded transition-colors flex items-center justify-center",
        active
          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />;
}

export default function DraggableRichText({ data, onUpdate, onRemove, onBringToFront }: Props) {
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUpdate = useCallback((content: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onUpdate(data.id, { content }), 600);
  }, [onUpdate, data.id]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      FontSize,
      Color,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: data.content || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => scheduleUpdate(editor.getHTML()),
    editorProps: {
      attributes: { class: "rt-editor" },
    },
  });

  // ---- 移動 ----
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-nodrag], button, input, select")) return;
    e.preventDefault();
    onBringToFront(data.id);
    dragOffset.current = { x: e.clientX - data.x, y: e.clientY - data.y };
    const onMove = (ev: MouseEvent) => {
      onUpdate(data.id, { x: snap(ev.clientX - dragOffset.current.x), y: snap(ev.clientY - dragOffset.current.y) });
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- リサイズ ----
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    onBringToFront(data.id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, width: data.width, height: data.height };
    const onMove = (ev: MouseEvent) => {
      onUpdate(data.id, {
        width: Math.max(260, snap(resizeStart.current.width + ev.clientX - resizeStart.current.mouseX)),
        height: Math.max(180, snap(resizeStart.current.height + ev.clientY - resizeStart.current.mouseY)),
      });
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!editor) return null;

  const inTable = editor.isActive("table");

  // 現在のフォントサイズ
  const currentSize = editor.getAttributes("textStyle").fontSize ?? "";

  return (
    <div
      style={{ left: data.x, top: data.y, width: data.width, height: data.height, zIndex: data.zIndex }}
      className="absolute flex flex-col select-none rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      onMouseDown={onMouseDown}
    >
      {/* ヘッダー */}
      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-1 truncate">リッチテキスト</span>
        <button
          onClick={() => onRemove(data.id)}
          className="text-gray-400 hover:text-red-500 flex-shrink-0"
          title="削除"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ツールバー */}
      <div
        data-nodrag=""
        className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-1 flex-wrap border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        {/* 履歴 */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="元に戻す"><UndoIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="やり直し"><RedoIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <Sep />

        {/* テキスト装飾 */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="太字"><FormatBoldIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="斜体"><FormatItalicIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="下線"><FormatUnderlinedIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="取り消し線"><FormatStrikethroughIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="ハイライト">
          <span className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">蛍</span>
        </ToolBtn>
        <Sep />

        {/* 文字色 */}
        <label className="relative cursor-pointer p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" title="文字色">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">A</span>
          <input
            type="color"
            className="absolute opacity-0 w-0 h-0"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          <div
            className="w-4 h-1 rounded-sm mt-0.5 ml-0.5"
            style={{ backgroundColor: editor.getAttributes("textStyle").color ?? "#171717" }}
          />
        </label>
        <Sep />

        {/* フォントサイズ */}
        <select
          onMouseDown={(e) => e.stopPropagation()}
          value={currentSize}
          onChange={(e) => {
            const v = e.target.value;
            if (v) (editor.chain().focus() as any).setFontSize(v).run();
            else (editor.chain().focus() as any).unsetFontSize().run();
          }}
          className="text-xs px-0.5 py-0 rounded border border-gray-200 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 cursor-pointer"
          title="フォントサイズ"
        >
          <option value="">標準</option>
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s.replace("px", "")}</option>)}
        </select>
        <Sep />

        {/* 見出し */}
        {([1, 2, 3] as const).map((level) => (
          <ToolBtn
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive("heading", { level })}
            title={`見出し ${level}`}
          >
            <span className="text-xs font-bold leading-none">H{level}</span>
          </ToolBtn>
        ))}
        <ToolBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="本文"
        >
          <span className="text-xs leading-none">P</span>
        </ToolBtn>
        <Sep />

        {/* リスト */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="箇条書き"><FormatListBulletedIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="番号リスト"><FormatListNumberedIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <Sep />

        {/* 配置 */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="左揃え"><FormatAlignLeftIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="中央揃え"><FormatAlignCenterIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="右揃え"><FormatAlignRightIcon sx={{ fontSize: 17 }} /></ToolBtn>
        <Sep />

        {/* テーブル */}
        <ToolBtn
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={false}
          title="テーブルを挿入"
        >
          <TableChartIcon sx={{ fontSize: 17 }} />
        </ToolBtn>

        {/* テーブル内の操作（カーソルがテーブル内にある時のみ表示） */}
        {inTable && (
          <>
            <Sep />
            <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="行を追加">
              <span className="text-xs leading-none font-bold">+行</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="列を追加">
              <span className="text-xs leading-none font-bold">+列</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteRow().run()} title="行を削除">
              <span className="text-xs leading-none text-red-500">−行</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="列を削除">
              <span className="text-xs leading-none text-red-500">−列</span>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="テーブルを削除">
              <span className="text-xs leading-none text-red-500">⌫表</span>
            </ToolBtn>
          </>
        )}
      </div>

      {/* エディタ本体 */}
      <div
        data-nodrag=""
        className="flex-1 overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <EditorContent editor={editor} style={{ height: "100%" }} />
      </div>

      {/* リサイズハンドル */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10 flex items-end justify-end pr-1 pb-1"
        title="ドラッグでサイズ変更"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" className="text-gray-400">
          <path d="M1 8L8 1M4 8L8 4M8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
