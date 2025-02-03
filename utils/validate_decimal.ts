export function validate_decimal(value: string){
    const decimalRegex = /^[0-9]*\.?[0-9]*$/;
    if (!decimalRegex.test(value)) {
      const quantity = value.replace(/[^0-9.]/g, ""); // Hilangkan karakter non-angka atau titik
      return quantity;
    }else{
        return 0;
    }
  }