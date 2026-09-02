"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/AuthGuard";

const kosong = {
  kode_barang: "", nama_barang: "", spesifikasi: "", kategori: "",
  satuan: "", merek: "", lokasi: "", stok_aktual: 0,
  stok_minimum: 0, stok_buffer: 0, stok_optimum: 0,
};

function MasterBarangIsi() {
  const [daftar, setDaftar] = useState([]);
  const [form, setForm] = useState(kosong);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { ambilData(); }, []);

  async function ambilData() {
    const { data } = await supabase.from("master_barang").select("*").order("nama_barang");
    setDaftar(data || []);
  }

  async function simpan(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.from("master_barang").insert([form]);
    if (error) {
      setError("Gagal menyimpan: kode barang mungkin sudah dipakai, atau Anda bukan admin.");
      return;
    }
    setForm(kosong);
    setShowForm(false);
    ambilData();
  }

  async function hapus(id) {
    if (!confirm("Yakin hapus barang ini?")) return;
    await supabase.from("master_barang").delete().eq("id", id);
    ambilData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Master barang</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
          {showForm ? "Batal" : "+ Tambah barang"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={simpan} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-2 gap-3">
          {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
          <Input label="Kode barang" value={form.kode_barang} onChange={(v) => setForm({ ...form, kode_barang: v })} required />
          <Input label="Nama barang" value={form.nama_barang} onChange={(v) => setForm({ ...form, nama_barang: v })} required />
          <Input label="Spesifikasi" value={form.spesifikasi} onChange={(v) => setForm({ ...form, spesifikasi: v })} />
          <Input label="Kategori" value={form.kategori} onChange={(v) => setForm({ ...form, kategori: v })} />
          <Input label="Satuan" value={form.satuan} onChange={(v) => setForm({ ...form, satuan: v })} required />
          <Input label="Merek" value={form.merek} onChange={(v) => setForm({ ...form, merek: v })} />
          <Input label="Lokasi rak" value={form.lokasi} onChange={(v) => setForm({ ...form, lokasi: v })} />
          <Input label="Stok awal" type="number" value={form.stok_aktual} onChange={(v) => setForm({ ...form, stok_aktual: Number(v) })} />
          <Input label="Stok minimum (kritis)" type="number" value={form.stok_minimum} onChange={(v) => setForm({ ...form, stok_minimum: Number(v) })} />
          <Input label="Stok buffer (waspada)" type="number" value={form.stok_buffer} onChange={(v) => setForm({ ...form, stok_buffer: Number(v) })} />
          <Input label="Stok optimum" type="number" value={form.stok_optimum} onChange={(v) => setForm({ ...form, stok_optimum: Number(v) })} />
          <button className="col-span-2 bg-gray-900 text-white py-2 rounded-lg mt-2">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Kode</th><th className="p-3">Nama</th><th className="p-3">Spesifikasi</th>
              <th className="p-3">Lokasi</th><th className="p-3">Stok</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.kode_barang}</td>
                <td className="p-3">{b.nama_barang}</td>
                <td className="p-3">{b.spesifikasi}</td>
                <td className="p-3">{b.lokasi}</td>
                <td className="p-3">{b.stok_aktual} {b.satuan}</td>
                <td className="p-3"><button onClick={() => hapus(b.id)} className="text-red-600 text-xs">Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        QR titik pengambilan ada di halaman <a href="/cetak-qr" className="underline">Cetak QR</a> — cukup 1 QR, bukan per-barang.
      </p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600 mb-1">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
    </label>
  );
}

export default function MasterBarangPage() {
  return <AuthGuard requireAdmin><MasterBarangIsi /></AuthGuard>;
}
