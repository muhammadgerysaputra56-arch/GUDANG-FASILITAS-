"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard, { useProfil } from "@/lib/AuthGuard";

function PengambilanIsi() {
  const profil = useProfil();
  const [kataKunci, setKataKunci] = useState("");
  const [hasil, setHasil] = useState([]);
  const [dipilih, setDipilih] = useState(null);
  const [qty, setQty] = useState("");
  const [pesan, setPesan] = useState(null);

  async function cariBarang(e) {
    e.preventDefault();
    setDipilih(null);
    setPesan(null);
    if (kataKunci.trim().length === 0) return;
    const { data } = await supabase.from("master_barang").select("*").ilike("nama_barang", `%${kataKunci}%`).limit(8);
    setHasil(data || []);
  }

  function pilihBarang(b) {
    setDipilih(b);
    setHasil([]);
    setKataKunci("");
    setPesan(null);
  }

  async function konfirmasiAmbil(e) {
    e.preventDefault();
    setPesan(null);
    const qtyNum = Number(qty);

    const { error } = await supabase.rpc("proses_transaksi", {
      p_kode_barang: dipilih.kode_barang,
      p_jenis: "keluar",
      p_qty: qtyNum,
      p_nama_pengambil: profil?.nama_lengkap,
    });

    if (error) {
      setPesan({ jenis: "error", teks: error.message });
      return;
    }

    setPesan({ jenis: "sukses", teks: "Pengambilan berhasil dicatat, stok sudah diperbarui." });
    setDipilih(null);
    setQty("");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-1">Form pengambilan barang</h1>
      <p className="text-sm text-gray-500 mb-4">
        Pengambil: <span className="font-medium">{profil?.nama_lengkap}</span>
      </p>

      {pesan && (
        <div className={`rounded-lg p-3 mb-4 text-sm border ${pesan.jenis === "sukses" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {pesan.teks}
        </div>
      )}

      {!dipilih && (
        <form onSubmit={cariBarang} className="mb-4">
          <label className="block text-sm mb-1 text-gray-600">Cari nama barang</label>
          <div className="flex gap-2">
            <input value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} placeholder="Misal: pipa, amplas, reduce..." className="flex-1 border rounded-lg px-3 py-2" autoFocus />
            <button className="bg-gray-900 text-white px-4 rounded-lg text-sm">Cari</button>
          </div>
        </form>
      )}

      {hasil.length > 0 && (
        <div className="bg-white border rounded-lg divide-y mb-4">
          {hasil.map((b) => (
            <button key={b.id} onClick={() => pilihBarang(b)} className="w-full text-left p-3 hover:bg-gray-50">
              <p className="font-medium text-sm">{b.nama_barang} {b.spesifikasi && <span className="text-gray-500">({b.spesifikasi})</span>}</p>
              <p className="text-xs text-gray-500">Kode: {b.kode_barang} | Stok: {b.stok_aktual} {b.satuan}</p>
            </button>
          ))}
        </div>
      )}

      {dipilih && (
        <div className="bg-white border rounded-lg p-4">
          <div className="mb-4 pb-4 border-b">
            <p className="font-medium">{dipilih.nama_barang} {dipilih.spesifikasi && <span className="text-gray-500">({dipilih.spesifikasi})</span>}</p>
            <p className="text-sm text-gray-500">Kode: {dipilih.kode_barang} | Lokasi: {dipilih.lokasi || "-"}</p>
            <p className="text-sm text-gray-500">Stok tersedia: {dipilih.stok_aktual} {dipilih.satuan}</p>
          </div>
          <form onSubmit={konfirmasiAmbil}>
            <label className="block text-sm mb-4">
              <span className="block text-gray-600 mb-1">Qty pengambilan</span>
              <input type="number" min="1" max={dipilih.stok_aktual} value={qty} onChange={(e) => setQty(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg">Konfirmasi ambil barang</button>
              <button type="button" onClick={() => setDipilih(null)} className="px-4 border rounded-lg text-sm">Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PengambilanPage() {
  return <AuthGuard><PengambilanIsi /></AuthGuard>;
}
