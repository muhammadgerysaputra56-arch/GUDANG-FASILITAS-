export function statusStok(stok_aktual, stok_minimum, stok_buffer, stok_optimum) {
  if (stok_aktual <= 0) {
    return { label: 'Habis', warna: 'bg-black text-white' };
  }
  if (stok_aktual <= stok_minimum) {
    return { label: 'Kritis', warna: 'bg-red-100 text-red-700' };
  }
  if (stok_aktual <= stok_buffer) {
    return { label: 'Waspada', warna: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Aman', warna: 'bg-green-100 text-green-700' };
}
