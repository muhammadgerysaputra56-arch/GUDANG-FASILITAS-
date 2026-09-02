-- SKEMA FINAL - Jalankan seluruh file ini di Supabase Dashboard > SQL Editor > New query > Run

drop function if exists proses_transaksi;
drop table if exists transaksi;
drop table if exists master_barang;
drop table if exists profiles;

-- ============================================
-- TABEL MASTER BARANG
-- ============================================
create table master_barang (
  id uuid primary key default gen_random_uuid(),
  kode_barang text not null unique,
  nama_barang text not null,
  spesifikasi text,
  kategori text,
  satuan text not null,
  merek text,
  lokasi text,
  stok_aktual integer not null default 0,
  stok_minimum integer not null default 0,
  stok_buffer integer not null default 0,
  stok_optimum integer not null default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- TABEL TRANSAKSI (riwayat masuk & keluar)
-- ============================================
create table transaksi (
  id uuid primary key default gen_random_uuid(),
  kode_barang text not null references master_barang(kode_barang) on update cascade,
  jenis text not null check (jenis in ('masuk', 'keluar')),
  qty integer not null,
  nama_pengambil text,
  keterangan text,
  dibuat_oleh uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- TABEL PROFIL (siapa admin, siapa teknisi)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap text not null,
  role text not null default 'teknisi' check (role in ('admin', 'teknisi')),
  created_at timestamp with time zone default now()
);

-- Setiap ada akun baru dibuat, otomatis dibuatkan profil dengan role default 'teknisi'
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, nama_lengkap, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama_lengkap', new.email), 'teknisi');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- FUNGSI TRANSAKSI AMAN
-- Semua tambah/kurang stok WAJIB lewat fungsi ini, bukan update tabel langsung.
-- Validasi role dan stok terjadi di sini, tidak bisa dilewati dari aplikasi.
-- ============================================
create or replace function proses_transaksi(
  p_kode_barang text,
  p_jenis text,
  p_qty integer,
  p_nama_pengambil text default null,
  p_keterangan text default null
) returns void
language plpgsql
security definer
as $$
declare
  v_role text;
  v_stok integer;
begin
  select role into v_role from profiles where id = auth.uid();

  if v_role is null then
    raise exception 'Akun tidak terdaftar, hubungi admin.';
  end if;

  if p_jenis = 'masuk' and v_role <> 'admin' then
    raise exception 'Hanya admin yang bisa mencatat barang masuk.';
  end if;

  if p_qty <= 0 then
    raise exception 'Qty harus lebih dari 0.';
  end if;

  select stok_aktual into v_stok from master_barang where kode_barang = p_kode_barang for update;

  if v_stok is null then
    raise exception 'Kode barang tidak ditemukan.';
  end if;

  if p_jenis = 'masuk' then
    update master_barang set stok_aktual = stok_aktual + p_qty where kode_barang = p_kode_barang;
  elsif p_jenis = 'keluar' then
    if p_qty > v_stok then
      raise exception 'Stok tidak cukup. Tersedia hanya %.', v_stok;
    end if;
    update master_barang set stok_aktual = stok_aktual - p_qty where kode_barang = p_kode_barang;
  else
    raise exception 'Jenis transaksi tidak valid.';
  end if;

  insert into transaksi (kode_barang, jenis, qty, nama_pengambil, keterangan, dibuat_oleh)
  values (p_kode_barang, p_jenis, p_qty, p_nama_pengambil, p_keterangan, auth.uid());
end;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table master_barang enable row level security;
alter table transaksi enable row level security;
alter table profiles enable row level security;

create policy "lihat master barang - semua yang login" on master_barang
  for select using (auth.role() = 'authenticated');

create policy "ubah master barang - hanya admin" on master_barang
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "lihat transaksi - semua yang login" on transaksi
  for select using (auth.role() = 'authenticated');

create policy "lihat profil sendiri" on profiles
  for select using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

grant execute on function proses_transaksi to authenticated;

-- ============================================
-- DATA CONTOH (boleh dihapus nanti)
-- ============================================
insert into master_barang (kode_barang, nama_barang, spesifikasi, kategori, satuan, merek, lokasi, stok_aktual, stok_minimum, stok_buffer, stok_optimum) values
('BYL-00001', 'Pipa PVC', 'Uk. 10 inch', 'Pipa', 'batang', 'Rucika', 'Rak A1', 25, 5, 10, 30),
('BYL-00002', 'Amplas', 'No. 1000', 'Consumable', 'lembar', 'Kansai', 'Rak B2', 8, 5, 15, 40),
('BYL-00003', 'Reduce', '1 inch x 1.5 inch', 'Fitting', 'pcs', 'Rucika', 'Rak C1', 3, 5, 10, 25);

-- ============================================
-- PENTING: setelah Anda daftar akun pertama lewat halaman /login (sign up),
-- jalankan perintah di bawah ini (ganti email-nya) supaya akun itu jadi admin:
--
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'email_anda@contoh.com');
-- ============================================
