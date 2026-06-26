import type { People } from "./people";

export enum CommentReference {
  CANVASSING = "canvassing",
}
export type CommentData = {
  unique_id: string | null;
  comment: string;
  reference: CommentReference;
  reference_id: string;
  created_by: string;
  created_at: number;
  updated_at: number;
  version: number;
  people?: People;
};
