"use client";
import "./globals.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useProfil, keluar } from "@/lib/AuthGuard";

function Navbar() {
  const profil = useProfil();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;
  if (!profil) return null;

  return (
    <nav className="bg-gray-900 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-6 flex-wrap">
        <span className="font-semibold">Gudang Balai Yasa Lahat</span>
        <Link href="/" className="text-sm text-gray-300 hover:text-white">Dashboard</Link>
        {profil.role === "admin" && (
          <>
            <Link href="/master-barang" className="text-sm text-gray-300 hover:text-white">Master Barang</Link>
            <Link href="/barang-masuk" className="text-sm text-gray-300 hover:text-white">Barang Masuk</Link>
          </>
        )}
        <Link href="/pengambilan" className="text-sm text-gray-300 hover:text-white">Pengambilan (Scan QR)</Link>
        <Link href="/cetak-qr" className="text-sm text-gray-300 hover:text-white">Cetak QR</Link>
        <span className="ml-auto text-xs text-gray-400">
          {profil.nama_lengkap} ({profil.role})
        </span>
        <button onClick={() => keluar(router)} className="text-sm text-gray-300 hover:text-white underline">
          Keluar
        </button>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <title>Gudang Balai Yasa Lahat</title>
        <meta name="description" content="Sistem monitoring dan controlling persediaan gudang" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Navbar />
        <main className="max-w-5xl w-full mx-auto p-4 flex-1">{children}</main>
      </body>
    </html>
  );
}
