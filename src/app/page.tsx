import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Next.js サンプルアプリ
        </h1>
        <p className="text-lg text-gray-600">
          TypeScript + Tailwind CSS で構築されたシンプルなプロジェクトです。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card title="高速" description="App Router による最適化されたレンダリング" />
          <Card title="型安全" description="TypeScript でバグを事前に防止" />
          <Card title="スタイリング" description="Tailwind CSS で素早くデザイン" />
        </div>
        <div className="mt-6">
          <Link
            href="/memo"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-full transition-colors shadow"
          >
            メモボードへ →
          </Link>
        </div>
      </div>
    </main>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
