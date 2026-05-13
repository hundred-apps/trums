import type { AddressType } from "~/types/address";

export const generateAddressView = (address: AddressType) => {
  let addressView = "";

  if (address.villages?.name) {
    addressView = addressView + address.villages?.name + ", ";
  } else if (address.village) {
    addressView = addressView + address.village + ", ";
  }

  if (address.villages?.districts?.name) {
    addressView = addressView + address.villages?.districts?.name + ", ";
  } else if (address.city) {
    addressView = addressView + address.city + ", ";
  }

  if (address.villages?.districts?.regencies?.name) {
    addressView =
      addressView + address.villages?.districts?.regencies?.name + ", ";
  } else if (address.villages?.districts?.regencies?.province?.name) {
    addressView =
      addressView +
      address.villages?.districts?.regencies?.province?.name +
      ", ";
  } else if (address.province) {
    addressView = addressView + address.province + ", ";
  } else if (address.regency) {
    addressView = addressView + address.regency + ", ";
  }

  if (address.villages?.districts?.regencies?.province?.name) {
    addressView =
      addressView +
      address.villages?.districts?.regencies?.province?.name +
      ", ";
  } else if (address.province) {
    addressView = addressView + address.province + ", ";
  }

  addressView = addressView + `${address.codepos}`;

  // return `${address.villages?.name || address.village}, ${
  //   address.villages?.districts?.name || address.city
  // }, ${
  //   (address.villages?.districts?.regencies?.name || address.regency,
  //   address.villages?.districts?.regencies?.province?.name ||
  //     address.province)
  // }, ${
  //   address.villages?.districts?.regencies?.province?.name || address.province
  // }`;

  return addressView;
};
export const generateAddressViewName = (address: AddressType) => {
  return `${address.village}, ${address.city}, ${
    address.regency || address.province
  }`;
};
