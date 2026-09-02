"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useProfil() {
  const [profil, setProfil] = useState(null); // null = masih memuat, false = tidak login
  const router = useRouter();

  useEffect(() => {
    let aktif = true;

    async function cek() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (aktif) setProfil(false);
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (aktif) setProfil({ ...data, email: session.user.email });
    }

    cek();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfil(false);
        router.push("/login");
      }
    });

    return () => { aktif = false; listener.subscription.unsubscribe(); };
  }, [router]);

  return profil;
}

export async function keluar(router) {
  await supabase.auth.signOut();
  router.push("/login");
}

// Bungkus halaman dengan ini supaya wajib login dulu.
// Kalau requireAdmin true, non-admin akan lihat pesan "akses ditolak".
export default function AuthGuard({ children, requireAdmin = false }) {
  const profil = useProfil();

  if (profil === null) {
    return <p className="text-gray-500 text-sm">Memeriksa sesi login...</p>;
  }
  if (profil === false) {
    return null; // sedang dialihkan ke /login
  }
  if (requireAdmin && profil.role !== "admin") {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">
        Halaman ini hanya bisa diakses oleh admin gudang.
      </div>
    );
  }
  return <>{children}</>;
}
