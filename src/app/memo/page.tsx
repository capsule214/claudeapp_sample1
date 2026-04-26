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
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Link from "next/link";
import DraggableCard, { CardData } from "@/components/DraggableCard";
import DraggableImage, { ImageData } from "@/components/DraggableImage";
import DraggableRichText, { RichTextData } from "@/components/DraggableRichText";
import { useColorMode } from "@/components/AppThemeProvider";

export default function MemoPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [richTexts, setRichTexts] = useState<RichTextData[]>([]);
  const zCounter = useRef(1);
  const { mode, toggle } = useColorMode();

  useEffect(() => {
    const maxZ = (arr: { zIndex: number }[]) =>
      arr.reduce((m, c) => Math.max(m, c.zIndex), 0);

    fetch("/api/cards")
      .then((r) => r.json())
      .then((data: CardData[]) => {
        setCards(data);
        zCounter.current = Math.max(zCounter.current, maxZ(data));
      });

    fetch("/api/images")
      .then((r) => r.json())
      .then((data: ImageData[]) => {
        setImages(data);
        zCounter.current = Math.max(zCounter.current, maxZ(data));
      });

    fetch("/api/rich-texts")
      .then((r) => r.json())
      .then((data: RichTextData[]) => {
        setRichTexts(data);
        zCounter.current = Math.max(zCounter.current, maxZ(data));
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

  const addImage = useCallback(() => {
    const zIndex = ++zCounter.current;
    const img: ImageData = {
      id: crypto.randomUUID(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      width: 200,
      height: 200,
      zIndex,
      url: "",
    };
    setImages((prev) => [...prev, img]);
    fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(img),
    });
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<ImageData>) => {
    setImages((prev) => {
      const next = prev.map((img) => (img.id === id ? { ...img, ...updates } : img));
      const updated = next.find((img) => img.id === id);
      if (updated) {
        fetch(`/api/images/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      }
      return next;
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    fetch(`/api/images/${id}`, { method: "DELETE" });
  }, []);

  const bringImageToFront = useCallback(
    (id: string) => updateImage(id, { zIndex: ++zCounter.current }),
    [updateImage]
  );

  const addRichText = useCallback(() => {
    const zIndex = ++zCounter.current;
    const rt: RichTextData = {
      id: crypto.randomUUID(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      width: 360,
      height: 260,
      zIndex,
      content: "<p></p>",
    };
    setRichTexts((prev) => [...prev, rt]);
    fetch("/api/rich-texts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rt),
    });
  }, []);

  const updateRichText = useCallback((id: string, updates: Partial<RichTextData>) => {
    setRichTexts((prev) => {
      const next = prev.map((rt) => (rt.id === id ? { ...rt, ...updates } : rt));
      const updated = next.find((rt) => rt.id === id);
      if (updated) {
        fetch(`/api/rich-texts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      }
      return next;
    });
  }, []);

  const removeRichText = useCallback((id: string) => {
    setRichTexts((prev) => prev.filter((rt) => rt.id !== id));
    fetch(`/api/rich-texts/${id}`, { method: "DELETE" });
  }, []);

  const bringRichTextToFront = useCallback(
    (id: string) => updateRichText(id, { zIndex: ++zCounter.current }),
    [updateRichText]
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
            onClick={addRichText}
            variant="outlined"
            size="small"
            startIcon={<TextFieldsIcon />}
            sx={{ borderRadius: 9999, fontWeight: 600, px: 2 }}
          >
            テキスト
          </Button>

          <Button
            onClick={addImage}
            variant="outlined"
            size="small"
            startIcon={<AddPhotoAlternateIcon />}
            sx={{ borderRadius: 9999, fontWeight: 600, px: 2 }}
          >
            画像
          </Button>

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
        {richTexts.map((rt) => (
          <DraggableRichText
            key={rt.id}
            data={rt}
            onUpdate={updateRichText}
            onRemove={removeRichText}
            onBringToFront={bringRichTextToFront}
          />
        ))}
        {images.map((img) => (
          <DraggableImage
            key={img.id}
            image={img}
            onUpdate={updateImage}
            onRemove={removeImage}
            onBringToFront={bringImageToFront}
          />
        ))}
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
