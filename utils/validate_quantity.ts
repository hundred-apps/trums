export function validateQuantity(value: string) {
    // Hapus semua karakter kecuali angka dan titik (.)
    value = value.replace(/[^0-9.]/g, "");

    // Hapus koma dan ubah jadi angka (misal: 1,203 → 1203)
    value = value.replace(/,/g, "");

    // Pastikan hanya ada satu titik desimal
    let parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
    }

    value = parseFloat(value).toFixed(2);

    return value;
}