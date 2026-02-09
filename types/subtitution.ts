export type CatalogueLite = {
  unique_id?: string;
  catalogue_id: string;
  catalogue_name: string;
  sn: string;
  brand_name: string;
};

export type SubstitutionGroup = {
  unique_id: string;
  name: string;
  subtitution_id?: string;
  catalogues: CatalogueLite[];
  isNew?: boolean;
};

export type CatalogueSubstitutionResponse = {
  catalogue_id: string;
  catalogue_name: string;
  sn: string;
  brand_name: string;
  substitutions: SubstitutionGroup[];
};

export type SubstitutionTreeNode = {
  id: string;
  label: string;
  disabled?: boolean;
  children?: SubstitutionTreeNode[];
  isNew?: boolean;
};
