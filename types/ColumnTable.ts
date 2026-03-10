import type {
  ClassNameGetter,
  FixedDirection,
  HeaderClassGetter,
  CellRenderer,
  HeaderCellRenderer,
  Alignment,
} from "element-plus/es/components/table-v2/src/types.mjs";
import type { CSSProperties } from "vue";
export type KeyType = string | number | symbol;
export type ColumnTable<T = any> = {
  align?: Alignment;
  class?: string | ClassNameGetter<T>;
  key?: KeyType;
  dataKey?: KeyType;
  fixed?: true | FixedDirection;
  flexGrow?: CSSProperties["flexGrow"];
  flexShrink?: CSSProperties["flexShrink"];
  title?: string;
  hidden?: boolean;
  headerClass?: HeaderClassGetter<T> | string;
  maxWidth?: number;
  minWidth?: number;
  style?: CSSProperties;
  sortable?: boolean;
  width?: number;
  /**
   * Renderers
   */
  cellRenderer?: CellRenderer<T>;
  headerCellRenderer?: HeaderCellRenderer<T>;
};
