import type { AddressType } from "~/types/address";
import type { Contact } from "~/types/contact";

const store = localStorage.getItem("setting");
const setting: {
  company: Contact;
  address: AddressType;
} = JSON.parse(store!);

export const currentCompany = () => {
  return setting.company;
};
