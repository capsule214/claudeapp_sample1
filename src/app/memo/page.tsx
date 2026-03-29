"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import DraggableCard, { CardData } from "@/components/DraggableCard";

export default function MemoPage() {
  const [cards, setCards] = useState<CardData[]>([]);

  const addCard = useCallback(() => {
    setCards(prev => [...prev, {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 80 + Math.random() * 150,
      width: 288,
      height: 220,
      title: "メモ",
      titleColor: "#f3f4f6",
      links: [],
    }]);
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<CardData>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const moveLink = useCallback((fromCardId: string, toCardId: string, linkId: string, toIndex: number) => {
    setCards(prev => {
      const fromCard = prev.find(c => c.id === fromCardId);
      const link = fromCard?.links.find(l => l.id === linkId);
      if (!link) return prev;
      return prev.map(card => {
        if (card.id === fromCardId) return { ...card, links: card.links.filter(l => l.id !== linkId) };
        if (card.id === toCardId) {
          const next = [...card.links];
          next.splice(toIndex, 0, link);
          return { ...card, links: next };
        }
        return card;
      });
    });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-gray-100 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← ホームへ戻る
        </Link>
        <h1 className="text-base font-semibold text-gray-800">メモボード</h1>
        <button
          onClick={addCard}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full transition-colors shadow"
        >
          <span className="text-base leading-none">＋</span> 追加
        </button>
      </header>

      <div className="pt-14 w-full h-full">
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-[calc(100vh-56px)] text-gray-400 text-sm pointer-events-none">
            右上の「追加」ボタンでメモカードを作成できます
          </div>
        )}
        {cards.map(card => (
          <DraggableCard
            key={card.id}
            card={card}
            onUpdate={updateCard}
            onRemove={removeCard}
            onMoveLink={moveLink}
          />
        ))}
      </div>
    </div>
  );
}
