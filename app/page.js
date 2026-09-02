"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { statusStok } from "@/lib/statusStok";
import AuthGuard from "@/lib/AuthGuard";

function DashboardIsi() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { ambilData(); }, []);

  async function ambilData() {
    setLoading(true);
    const { data, error } = await supabase.from("master_barang").select("*").order("nama_barang", { ascending: true });
    if (!error) setBarang(data);
    setLoading(false);
  }

  const jumlahKritis = barang.filter((b) => statusStok(b.stok_aktual, b.stok_minimum, b.stok_buffer).label === "Kritis").length;
  const jumlahHabis = barang.filter((b) => statusStok(b.stok_aktual, b.stok_minimum, b.stok_buffer).label === "Habis").length;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard monitoring stok</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total barang</p>
          <p className="text-2xl font-semibold">{barang.length}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-700">Perlu pengadaan (kritis)</p>
          <p className="text-2xl font-semibold text-amber-700">{jumlahKritis}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-700">Stok habis</p>
          <p className="text-2xl font-semibold text-red-700">{jumlahHabis}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama barang</th>
                <th className="p-3">Lokasi</th>
                <th className="p-3">Stok aktual</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {barang.map((b) => {
                const s = statusStok(b.stok_aktual, b.stok_minimum, b.stok_buffer);
                return (
                  <tr key={b.id} className="border-t">
                    <td className="p-3">{b.kode_barang}</td>
                    <td className="p-3">{b.nama_barang} {b.spesifikasi && <span className="text-gray-500">({b.spesifikasi})</span>}</td>
                    <td className="p-3">{b.lokasi}</td>
                    <td className="p-3">{b.stok_aktual} {b.satuan}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${s.warna}`}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <AuthGuard><DashboardIsi /></AuthGuard>;
}
