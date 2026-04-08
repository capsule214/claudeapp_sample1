"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import Link from "next/link";

const features = [
  { icon: <BoltIcon />, title: "高速", desc: "App Router による最適化されたレンダリング" },
  { icon: <CodeIcon />, title: "型安全", desc: "TypeScript でバグを事前に防止" },
  { icon: <BrushIcon />, title: "スタイリング", desc: "Material UI で洗練されたデザイン" },
];

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }} color="text.primary">
            Next.js サンプルアプリ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
            TypeScript + Material UI で構築されたシンプルなプロジェクトです。
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ width: "100%" }}
          >
            {features.map(({ icon, title, desc }) => (
              <Card
                key={title}
                elevation={2}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Box sx={{ color: "primary.main", mb: 1 }}>{icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Button
            component={Link}
            href="/memo"
            variant="contained"
            size="large"
            sx={{ borderRadius: 9999, px: 5, py: 1.5, fontWeight: 600, fontSize: "1rem" }}
          >
            メモボードへ →
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
