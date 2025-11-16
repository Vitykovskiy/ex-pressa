import {
  DrinkSizes,
  GroupTypes,
  ItemTypes,
  type AnyGroup,
} from "@/services/menu/types";

export interface DrinkSizeVariant {
  size: DrinkSizes;
  price: number;
}

export type DrinkSizesRecord = Record<DrinkSizes, { price: number }>;

export type TableRow =
  | GroupTableRowItem
  | DrinkTableRowItem
  | OtherTableRowItem;

export interface GroupTableRowItem {
  id: number;
  name: string;
  type: AnyGroup["type"];
}

export interface DrinkTableRowItem {
  id: number;
  name: string;
  type: ItemTypes.Drinks;
  sizes: Record<DrinkSizes, { price: number }>;
}

export interface OtherTableRowItem {
  id: number;
  name: string;
  price: number;
  type: ItemTypes.Other;
}

export function isGroupRow(item: TableRow): item is GroupTableRowItem {
  return (
    item.type === GroupTypes.Drinks ||
    item.type === GroupTypes.Options ||
    item.type === GroupTypes.Other
  );
}
