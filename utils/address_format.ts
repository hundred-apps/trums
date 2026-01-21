import type { AddressType } from "~/types/address";

export const generateAddressView = (address: AddressType) => {
    return `${address.villages?.name}, ${address.villages?.districts?.name}, ${address.villages?.districts?.regencies?.name}, ${address.villages?.districts?.regencies?.province?.name}`;
}