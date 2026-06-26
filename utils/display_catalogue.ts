import type { Catalogue } from "~/types/catalogue";

export const displayCatalogueName = (catalogue: Catalogue) => {
  let name = catalogue.name || "";

  if (catalogue.sn) {
    name = `${catalogue.sn} - ${catalogue.name}`;
  }

  if (catalogue.brand) {
    name = `${catalogue.name} - ${catalogue.brand.name}`;
  }

  return name;
};
