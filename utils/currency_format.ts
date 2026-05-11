export const currency = (number: number, digit?: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: digit ?? 2, // atau 2 kalau mau selalu ada desimal
    maximumFractionDigits: 2,
  }).format(number);
};

export const currencyWithoutSymbol = (number: number, digit?: number) => {
  console.log("without symbol", digit);
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digit ?? 2, // atau 2 kalau mau selalu ada desimal
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatCurrencyID = (value: number | null, digit?: number) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: digit || 0,
    maximumFractionDigits: 2,
    // numberingSystem
  });
};

export const parseCurrencyID = (val: string): number => {
  if (!val) return 0;

  // hapus ribuan
  let clean = val.replace(/\./g, "");
  // ubah koma ke titik
  clean = clean.replace(",", ".");
  // hanya angka & titik
  clean = clean.replace(/[^0-9.]/g, "");

  return Number(clean) || 0;
};
export const parseFormatColon = (val: string): string => {
  if (!val) return "0";

  // hapus ribuan
  let clean = val.replace(/\./g, "");
  let removeColon = clean.replace(",", ".");

  // // ubah koma ke titik
  // clean = clean.replace(",", ".");
  // // hanya angka & titik
  // clean = clean.replace(/[^0-9.]/g, "");

  return removeColon;
};

export const formatInputCurrency = (val: string) => {
  if (!val) return "";

  // jika ada koma, berarti user pakai format Indonesia
  if (val.includes(",")) {
    // hapus titik ribuan
    val = val.replace(/\./g, "");
  } else {
    // kalau tidak ada koma, anggap titik sebagai desimal
    val = val.replace(".", ",");
  }

  const [integer, decimal] = val.split(",");

  const cleanInteger = integer.replace(/\D/g, "");
  const formattedInteger = Number(cleanInteger || 0).toLocaleString("id-ID");

  return decimal !== undefined
    ? `${formattedInteger},${decimal.replace(/\D/g, "")}`
    : formattedInteger;
};
