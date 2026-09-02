"use client";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import AuthGuard from "@/lib/AuthGuard";

function CetakQRIsi() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Otomatis pakai alamat website Anda saat ini + /pengambilan
    setUrl(`${window.location.origin}/pengambilan`);
  }, []);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-1">QR titik pengambilan</h1>
      <p className="text-sm text-gray-500 mb-4">
        Cetak QR ini satu kali saja, lalu tempel di area pengambilan barang gudang.
        Teknisi cukup scan QR ini untuk membuka form pengambilan.
      </p>

      <div className="bg-white border rounded-lg p-6 flex flex-col items-center gap-3 print:border-0">
        {url && <QRCodeCanvas value={url} size={220} />}
        <p className="text-xs text-gray-500 break-all text-center">{url}</p>
        <p className="font-medium">Scan untuk ambil barang gudang</p>
      </div>

      <button onClick={() => window.print()} className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm print:hidden">
        Cetak QR ini
      </button>

      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        Catatan: URL di atas hanya berfungsi kalau website sudah online (di-deploy ke Vercel).
        Kalau masih dites di laptop sendiri (localhost), QR ini cuma bisa dibuka dari laptop yang sama.
      </p>
    </div>
  );
}

export default function CetakQRPage() {
  return <AuthGuard><CetakQRIsi /></AuthGuard>;
}
