"use client";

import { useState, useRef, useId } from "react";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface CardData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  titleColor: string;
  links: LinkItem[];
}

interface DialogState {
  open: boolean;
  mode: "add" | "edit";
  editId: string | null;
  title: string;
  url: string;
  urlError: string;
}

interface Props {
  card: CardData;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
  onRemove: (id: string) => void;
  onMoveLink: (fromCardId: string, toCardId: string, linkId: string, toIndex: number) => void;
}

const PALETTE = [
  "#f3f4f6", "#dbeafe", "#dcfce7",
  "#fef9c3", "#ffedd5", "#fee2e2",
  "#f3e8ff", "#fce7f3", "#ccfbf1",
];

const DRAG_KEY = "application/x-link-drag";

const EMPTY_DIALOG: DialogState = {
  open: false, mode: "add", editId: null, title: "", url: "", urlError: "",
};

export default function DraggableCard({ card, onUpdate, onRemove, onMoveLink }: Props) {
  const uid = useId();
  const [editingTitle, setEditingTitle] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(EMPTY_DIALOG);
  const [draggingLinkIdx, setDraggingLinkIdx] = useState<number | null>(null);
  const [dragOverLinkIdx, setDragOverLinkIdx] = useState<number | null>(null);
  const [externalDragOver, setExternalDragOver] = useState(false);

  const cardDragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });
  const dragSrcIdx = useRef<number | null>(null);

  // ---- カードドラッグ ----
  const onCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a, input, textarea, [data-nodrag]")) return;
    e.preventDefault();
    cardDragOffset.current = { x: e.clientX - card.x, y: e.clientY - card.y };

    const onMove = (ev: MouseEvent) => {
      onUpdate(card.id, {
        x: ev.clientX - cardDragOffset.current.x,
        y: ev.clientY - cardDragOffset.current.y,
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- リサイズ ----
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, width: card.width, height: card.height };

    const onMove = (ev: MouseEvent) => {
      onUpdate(card.id, {
        width: Math.max(200, resizeStart.current.width + ev.clientX - resizeStart.current.mouseX),
        height: Math.max(140, resizeStart.current.height + ev.clientY - resizeStart.current.mouseY),
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- リンクドラッグ（同カード並び替え・他カードへ移動） ----
  const onLinkDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData(DRAG_KEY, JSON.stringify({ sourceCardId: card.id, linkId: card.links[idx].id }));
    e.dataTransfer.effectAllowed = "move";
    dragSrcIdx.current = idx;
    setDraggingLinkIdx(idx);
  };

  const onLinkRowDragOver = (e: React.DragEvent, idx: number) => {
    if (!e.dataTransfer.types.includes(DRAG_KEY)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverLinkIdx(idx);
    setExternalDragOver(false);
  };

  const onLinkRowDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData(DRAG_KEY);
    if (!raw) return;
    const { sourceCardId, linkId } = JSON.parse(raw) as { sourceCardId: string; linkId: string };

    if (sourceCardId === card.id) {
      const fromIdx = dragSrcIdx.current;
      if (fromIdx !== null && fromIdx !== toIdx) {
        const next = [...card.links];
        const [item] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, item);
        onUpdate(card.id, { links: next });
      }
    } else {
      onMoveLink(sourceCardId, card.id, linkId, toIdx);
    }
    setDraggingLinkIdx(null);
    setDragOverLinkIdx(null);
    setExternalDragOver(false);
    dragSrcIdx.current = null;
  };

  const onListAreaDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DRAG_KEY)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setExternalDragOver(true);
  };

  const onListAreaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setExternalDragOver(false);
    const raw = e.dataTransfer.getData(DRAG_KEY);
    if (!raw) return;
    const { sourceCardId, linkId } = JSON.parse(raw) as { sourceCardId: string; linkId: string };
    if (sourceCardId !== card.id) {
      onMoveLink(sourceCardId, card.id, linkId, card.links.length);
    }
    setDraggingLinkIdx(null);
    setDragOverLinkIdx(null);
    dragSrcIdx.current = null;
  };

  const onLinkDragEnd = () => {
    setDraggingLinkIdx(null);
    setDragOverLinkIdx(null);
    setExternalDragOver(false);
    dragSrcIdx.current = null;
  };

  // ---- ダイアログ ----
  const closeDialog = () => setDialog(EMPTY_DIALOG);

  const validateUrl = (raw: string): { ok: true; url: string } | { ok: false; error: string } => {
    let u = raw.trim();
    if (!u) return { ok: false, error: "URLを入力してください。" };
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try { new URL(u); } catch { return { ok: false, error: "有効なURLを入力してください。" }; }
    return { ok: true, url: u };
  };

  const handleDialogSubmit = () => {
    const result = validateUrl(dialog.url);
    if (!result.ok) { setDialog(d => ({ ...d, urlError: result.error })); return; }
    const url = result.url;
    if (dialog.mode === "add") {
      onUpdate(card.id, { links: [...card.links, { id: crypto.randomUUID(), title: dialog.title.trim(), url }] });
    } else {
      onUpdate(card.id, { links: card.links.map(l => l.id === dialog.editId ? { ...l, title: dialog.title.trim(), url } : l) });
    }
    closeDialog();
  };

  return (
    <>
      <div
        style={{ left: card.x, top: card.y, width: card.width, height: card.height }}
        className="absolute flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 select-none overflow-hidden"
        onMouseDown={onCardMouseDown}
      >
        {/* ヘッダー */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-xl cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: card.titleColor }}
        >
          {/* カラーパレット */}
          <div className="relative flex-shrink-0" data-nodrag="">
            <button
              onClick={() => setShowPalette(v => !v)}
              onMouseDown={e => e.stopPropagation()}
              className="w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-125 transition-transform"
              style={{ backgroundColor: card.titleColor }}
              title="色を変更"
            />
            {showPalette && (
              <div
                className="absolute top-6 left-0 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-2 grid grid-cols-3 gap-1.5"
                onMouseDown={e => e.stopPropagation()}
              >
                {PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => { onUpdate(card.id, { titleColor: color }); setShowPalette(false); }}
                    className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: card.titleColor === color ? "#3b82f6" : "#d1d5db",
                    }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* タイトル */}
          {editingTitle ? (
            <input
              autoFocus
              value={card.title}
              onChange={e => onUpdate(card.id, { title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
              className="flex-1 text-xs font-medium bg-white/70 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none min-w-0"
            />
          ) : (
            <span
              className="flex-1 text-xs font-medium text-gray-700 cursor-text hover:text-blue-600 truncate"
              onDoubleClick={() => setEditingTitle(true)}
              title="ダブルクリックで編集"
            >
              {card.title || "（タイトルなし）"}
            </span>
          )}
          <button
            onClick={() => setEditingTitle(v => !v)}
            className="text-gray-500 hover:text-blue-500 text-xs flex-shrink-0"
            title="タイトルを編集"
          >✎</button>
          <button
            onClick={() => onRemove(card.id)}
            className="text-gray-500 hover:text-red-400 text-xs leading-none flex-shrink-0"
            title="カードを削除"
          >✕</button>
        </div>

        {/* リンクリスト */}
        <div
          className={[
            "flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0 transition-colors",
            externalDragOver ? "bg-blue-50" : "",
          ].join(" ")}
          onDragOver={onListAreaDragOver}
          onDragLeave={() => setExternalDragOver(false)}
          onDrop={onListAreaDrop}
        >
          {card.links.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-1 pointer-events-none">
              {externalDragOver ? "ここにドロップ" : "リンクがありません"}
            </p>
          ) : (
            card.links.map((link, idx) => (
              <div
                key={link.id}
                draggable
                onMouseDown={e => e.stopPropagation()}
                onDragStart={e => onLinkDragStart(e, idx)}
                onDragOver={e => onLinkRowDragOver(e, idx)}
                onDrop={e => onLinkRowDrop(e, idx)}
                onDragEnd={onLinkDragEnd}
                className={[
                  "flex items-center gap-1 px-1 py-1 rounded group transition-colors",
                  draggingLinkIdx === idx ? "opacity-30" : "",
                  dragOverLinkIdx === idx && draggingLinkIdx !== idx
                    ? "bg-blue-100 border border-blue-300"
                    : "",
                ].join(" ")}
              >
                <span
                  className="text-gray-300 cursor-grab hover:text-gray-500 text-xs flex-shrink-0"
                  title="ドラッグで移動・並び替え"
                >⠿</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs text-blue-500 hover:underline truncate"
                  title={link.url}
                >
                  {link.title || link.url}
                </a>
                <button
                  onClick={() => setDialog({ open: true, mode: "edit", editId: link.id, title: link.title, url: link.url, urlError: "" })}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 text-xs flex-shrink-0 transition-opacity"
                  title="編集"
                >✎</button>
                <button
                  onClick={() => onUpdate(card.id, { links: card.links.filter(l => l.id !== link.id) })}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-xs flex-shrink-0 transition-opacity"
                  title="削除"
                >✕</button>
              </div>
            ))
          )}
        </div>

        {/* フッター */}
        <div className="flex-shrink-0 flex justify-end px-3 py-2 border-t border-gray-100">
          <button
            onClick={() => setDialog({ ...EMPTY_DIALOG, open: true })}
            className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
          >
            <span className="text-sm leading-none">＋</span> リンク追加
          </button>
        </div>

        {/* リサイズハンドル */}
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end pr-1 pb-1"
          title="ドラッグでサイズ変更"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" className="text-gray-400">
            <path d="M1 8L8 1M4 8L8 4M8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* 追加・編集ダイアログ */}
      {dialog.open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={e => { if (e.target === e.currentTarget) closeDialog(); }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">
              {dialog.mode === "add" ? "リンクを追加" : "リンクを編集"}
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor={`${uid}-title`} className="block text-xs text-gray-500 mb-1">タイトル（任意）</label>
                <input
                  id={`${uid}-title`}
                  autoFocus
                  type="text"
                  value={dialog.title}
                  onChange={e => setDialog(d => ({ ...d, title: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleDialogSubmit(); if (e.key === "Escape") closeDialog(); }}
                  placeholder="サイト名など"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-url`} className="block text-xs text-gray-500 mb-1">
                  URL <span className="text-red-400">*</span>
                </label>
                <input
                  id={`${uid}-url`}
                  type="text"
                  value={dialog.url}
                  onChange={e => setDialog(d => ({ ...d, url: e.target.value, urlError: "" }))}
                  onKeyDown={e => { if (e.key === "Enter") handleDialogSubmit(); if (e.key === "Escape") closeDialog(); }}
                  placeholder="https://example.com"
                  className={[
                    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
                    dialog.urlError ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-400",
                  ].join(" ")}
                />
                {dialog.urlError && <p className="text-xs text-red-500 mt-1">{dialog.urlError}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeDialog} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                キャンセル
              </button>
              <button onClick={handleDialogSubmit} className="text-sm px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                {dialog.mode === "add" ? "追加" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
