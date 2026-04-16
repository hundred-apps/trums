import type { AddressType } from "~/types/address";

export const generateAddressView = (address: AddressType) => {
  console.log("generateAddressView", address);
  return `${address.villages?.name || address.village}, ${
    address.villages?.districts?.name || address.city
  }, ${address.villages?.districts?.regencies?.name || address.regency}, ${
    address.villages?.districts?.regencies?.province?.name || address.province
  }`;
};
export const generateAddressViewName = (address: AddressType) => {
  return `${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
};
