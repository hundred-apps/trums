export function validate_decimal(value: string) {
  const decimalRegex = /^[0-9]*\.?[0-9]*$/;
  if (!decimalRegex.test(value)) {
    const quantity = value.replace(/[^0-9.]/g, ""); // Hilangkan karakter non-angka atau titik
    return quantity;
  } else {
    return 0;
  }
}

export const handleInput = (val: string) => {
  console.log("handle input value", val);
  // 1. ubah titik jadi koma
  let normalized = val.replace(/\./g, ",");

  // 2. hapus selain angka & koma
  let cleaned = normalized.replace(/[^0-9,]/g, "");

  // 3. pastikan hanya 1 koma
  const parts = cleaned.split(",");
  if (parts.length > 2) {
    cleaned = parts[0] + "," + parts.slice(1).join("");
  }

  return cleaned;
};
export const toNumber = (val: string) => {
  return Number(val.replace(",", "."));
};
