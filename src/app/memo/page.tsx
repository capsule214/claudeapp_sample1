"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Link from "next/link";
import DraggableCard, { CardData } from "@/components/DraggableCard";
import { useColorMode } from "@/components/AppThemeProvider";

export default function MemoPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const zCounter = useRef(1);
  const { mode, toggle } = useColorMode();

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data: CardData[]) => {
        setCards(data);
        const maxZ = data.reduce((m, c) => Math.max(m, c.zIndex), 0);
        zCounter.current = maxZ;
      });
  }, []);

  const addCard = useCallback(() => {
    const zIndex = ++zCounter.current;
    const card: CardData = {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 80 + Math.random() * 150,
      width: 288,
      height: 220,
      title: "メモ",
      titleColor: "#dbeafe",
      links: [],
      zIndex,
    };
    setCards((prev) => [...prev, card]);
    fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<CardData>) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const updated = next.find((c) => c.id === id);
      if (updated) {
        fetch(`/api/cards/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      }
      return next;
    });
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/cards/${id}`, { method: "DELETE" });
  }, []);

  const copyCard = useCallback((id: string) => {
    setCards((prev) => {
      const src = prev.find((c) => c.id === id);
      if (!src) return prev;
      const zIndex = ++zCounter.current;
      const newCard: CardData = {
        ...src,
        id: crypto.randomUUID(),
        x: src.x + 24,
        y: src.y + 24,
        zIndex,
        links: src.links.map((l) => ({ ...l, id: crypto.randomUUID() })),
      };
      fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });
      return [...prev, newCard];
    });
  }, []);

  const bringToFront = useCallback(
    (id: string) => {
      const zIndex = ++zCounter.current;
      updateCard(id, { zIndex });
    },
    [updateCard]
  );

  const moveLink = useCallback(
    (fromCardId: string, toCardId: string, linkId: string, toIndex: number) => {
      setCards((prev) => {
        const fromCard = prev.find((c) => c.id === fromCardId);
        const link = fromCard?.links.find((l) => l.id === linkId);
        if (!link) return prev;
        const next = prev.map((card) => {
          if (card.id === fromCardId)
            return { ...card, links: card.links.filter((l) => l.id !== linkId) };
          if (card.id === toCardId) {
            const links = [...card.links];
            links.splice(toIndex, 0, link);
            return { ...card, links };
          }
          return card;
        });
        [fromCardId, toCardId].forEach((cid) => {
          const card = next.find((c) => c.id === cid);
          if (card) {
            fetch(`/api/cards/${cid}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(card),
            });
          }
        });
        return next;
      });
    },
    []
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="ホームへ戻る">
            <IconButton component={Link} href="/" size="small" color="inherit">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            メモボード
          </Typography>

          <Tooltip title={mode === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}>
            <IconButton onClick={toggle} size="small" color="inherit">
              {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button
            onClick={addCard}
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 9999, fontWeight: 600, px: 2 }}
          >
            追加
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: "48px", width: "100%", height: "100%" }}>
        {cards.length === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100vh - 48px)",
              pointerEvents: "none",
            }}
          >
            <Typography variant="body2" color="text.disabled">
              右上の「追加」ボタンでメモカードを作成できます
            </Typography>
          </Box>
        )}
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            onUpdate={updateCard}
            onRemove={removeCard}
            onCopy={copyCard}
            onMoveLink={moveLink}
            onBringToFront={bringToFront}
          />
        ))}
      </Box>
    </Box>
  );
}
