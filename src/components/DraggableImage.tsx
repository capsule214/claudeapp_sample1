"use client";

import { useState, useRef } from "react";
import { TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";

export interface ImageData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  url: string;
}

interface Props {
  image: ImageData;
  onUpdate: (id: string, updates: Partial<ImageData>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  onError: (msg: string) => void;
}

const snap = (v: number) => Math.round(v / 10) * 10;

export default function DraggableImage({ image, onUpdate, onRemove, onBringToFront, onError }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeSize, setResizeSize] = useState<{ width: number; height: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, [data-nодrag]")) return;
    e.preventDefault();
    onBringToFront(image.id);
    dragOffset.current = { x: e.clientX - image.x, y: e.clientY - image.y };

    const onMove = (ev: MouseEvent) => {
      setDragPos({
        x: snap(ev.clientX - dragOffset.current.x),
        y: snap(ev.clientY - dragOffset.current.y),
      });
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const finalPos = {
        x: snap(ev.clientX - dragOffset.current.x),
        y: snap(ev.clientY - dragOffset.current.y),
      };
      setDragPos(null);
      onUpdate(image.id, finalPos);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onBringToFront(image.id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, width: image.width, height: image.height };

    const onMove = (ev: MouseEvent) => {
      setResizeSize({
        width: Math.max(80, snap(resizeStart.current.width + ev.clientX - resizeStart.current.mouseX)),
        height: Math.max(80, snap(resizeStart.current.height + ev.clientY - resizeStart.current.mouseY)),
      });
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const finalSize = {
        width: Math.max(80, snap(resizeStart.current.width + ev.clientX - resizeStart.current.mouseX)),
        height: Math.max(80, snap(resizeStart.current.height + ev.clientY - resizeStart.current.mouseY)),
      };
      setResizeSize(null);
      onUpdate(image.id, finalSize);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    await uploadFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("id", image.id);
      const res = await fetch("/api/images/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "アップロードできませんでした。");
      onUpdate(image.id, { url: json.url! });
    } catch (e) {
      onError(e instanceof Error ? e.message : "アップロードできませんでした。");
    } finally {
      setUploading(false);
    }
  };

  const hasImage = Boolean(image.url);

  const displayX = dragPos?.x ?? image.x;
  const displayY = dragPos?.y ?? image.y;
  const displayWidth = resizeSize?.width ?? image.width;
  const displayHeight = resizeSize?.height ?? image.height;

  return (
    <div
      style={{
        left: displayX,
        top: displayY,
        width: displayWidth,
        height: displayHeight,
        zIndex: image.zIndex,
      }}
      className="absolute select-none"
      onMouseDown={onMouseDown}
    >
      <div className="relative w-full h-full group">
        {hasImage && (
          <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRemove(image.id)}
              className="bg-black/50 hover:bg-red-500 text-white rounded p-1"
              title="削除"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {hasImage ? (
          <img
            src={image.url}
            alt=""
            className="w-full h-full object-cover rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
            draggable={false}
          />
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={[
              "w-full h-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-default",
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white/80",
            ].join(" ")}
          >
            {uploading ? (
              <span className="text-sm text-gray-400">アップロード中...</span>
            ) : (
              <>
                <PhotoIcon className="w-8 h-8 text-gray-300" />
                <span className="text-sm text-gray-400 text-center leading-tight px-2">
                  画像をドロップ
                </span>
                <label className="text-sm text-blue-500 hover:underline cursor-pointer">
                  またはファイルを選択
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </>
            )}
          </div>
        )}

        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-20 flex items-end justify-end pr-1 pb-1"
          title="ドラッグでサイズ変更"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" className="text-white drop-shadow">
            <path d="M1 8L8 1M4 8L8 4M8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
