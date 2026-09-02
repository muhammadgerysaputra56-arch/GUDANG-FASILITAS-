"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" atau "daftar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email atau password salah.");
        setLoading(false);
        return;
      }
      router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { nama_lengkap: namaLengkap } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setError("");
      alert("Akun berhasil dibuat. Silakan login. (Akun baru otomatis jadi teknisi, admin harus dinaikkan lewat Supabase SQL Editor)");
      setMode("login");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-semibold mb-1 text-center">Gudang Balai Yasa Lahat</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        {mode === "login" ? "Masuk ke sistem" : "Buat akun baru"}
      </p>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={submit} className="bg-white border rounded-lg p-4">
        {mode === "daftar" && (
          <label className="block text-sm mb-3">
            <span className="block text-gray-600 mb-1">Nama lengkap</span>
            <input value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
          </label>
        )}
        <label className="block text-sm mb-3">
          <span className="block text-gray-600 mb-1">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm mb-4">
          <span className="block text-gray-600 mb-1">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg px-3 py-2" />
        </label>
        <button disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded-lg disabled:opacity-50">
          {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {mode === "login" ? (
          <>Belum punya akun? <button onClick={() => setMode("daftar")} className="underline">Daftar</button></>
        ) : (
          <>Sudah punya akun? <button onClick={() => setMode("login")} className="underline">Masuk</button></>
        )}
      </p>
    </div>
  );
}
