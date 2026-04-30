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
