"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/AuthGuard";

function BarangMasukIsi() {
  const [daftar, setDaftar] = useState([]);
  const [kodeBarang, setKodeBarang] = useState("");
  const [qty, setQty] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState(null);

  useEffect(() => {
    supabase.from("master_barang").select("kode_barang, nama_barang, stok_aktual, satuan")
      .order("nama_barang").then(({ data }) => setDaftar(data || []));
  }, []);

  async function simpan(e) {
    e.preventDefault();
    setPesan(null);
    const qtyNum = Number(qty);
    if (!kodeBarang || qtyNum <= 0) return;

    const { error } = await supabase.rpc("proses_transaksi", {
      p_kode_barang: kodeBarang,
      p_jenis: "masuk",
      p_qty: qtyNum,
      p_keterangan: keterangan,
    });

    if (error) {
      setPesan({ jenis: "error", teks: error.message });
      return;
    }

    setPesan({ jenis: "sukses", teks: "Stok berhasil ditambahkan." });
    setQty(""); setKeterangan(""); setKodeBarang("");
    const { data } = await supabase.from("master_barang").select("kode_barang, nama_barang, stok_aktual, satuan").order("nama_barang");
    setDaftar(data || []);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Barang masuk (restock)</h1>

      {pesan && (
        <div className={`rounded-lg p-3 mb-4 text-sm border ${pesan.jenis === "sukses" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {pesan.teks}
        </div>
      )}

      <form onSubmit={simpan} className="bg-white border rounded-lg p-4 max-w-md">
        <label className="block text-sm mb-3">
          <span className="block text-gray-600 mb-1">Pilih barang</span>
          <select value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value)} required className="w-full border rounded-lg px-3 py-2">
            <option value="">-- pilih barang --</option>
            {daftar.map((b) => (
              <option key={b.kode_barang} value={b.kode_barang}>{b.nama_barang} (stok: {b.stok_aktual} {b.satuan})</option>
            ))}
          </select>
        </label>
        <label className="block text-sm mb-3">
          <span className="block text-gray-600 mb-1">Qty yang masuk</span>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm mb-4">
          <span className="block text-gray-600 mb-1">Keterangan (opsional)</span>
          <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Misal: dari supplier X / no. PO" className="w-full border rounded-lg px-3 py-2" />
        </label>
        <button className="w-full bg-gray-900 text-white py-2 rounded-lg">Simpan barang masuk</button>
      </form>

      <p className="text-sm text-gray-500 mt-3">
        Barang baru? Tambahkan dulu lewat <a href="/master-barang" className="underline">Master Barang</a>.
      </p>
    </div>
  );
}

export default function BarangMasukPage() {
  return <AuthGuard requireAdmin><BarangMasukIsi /></AuthGuard>;
}
