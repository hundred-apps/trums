export const currency = (number: number)=>{
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(number);
}

export const currencyWithoutSymbol = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2, // atau 2 kalau mau selalu ada desimal
    maximumFractionDigits: 2,
  }).format(number);
};