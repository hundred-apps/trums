import * as XLSX from "xlsx";

export const useSheetjs = () => {
  const createWorkbook = () => {
    return XLSX.utils.book_new();
  };

  return {
    XLSX,
    createWorkbook,
  };
};
