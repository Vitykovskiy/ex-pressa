export type AnyGroup = DrinksGroup | OptionsGroup | OtherMenuGroup;

export const enum GroupTypes {
  Drinks = "drinks_group",
  Options = "options_group",
  Other = "other_group",
}

export const enum ItemTypes {
  Drinks = "drink",
  Options = "option",
  Other = "other",
}

export const enum DrinkSizes {
  Small = "s",
  Medium = "m",
  Large = "l",
}

interface BaseMenuGroup {
  id: number;
  key: string;
  name: string;
  type: GroupTypes;
  available: boolean;
}

export type DrinksGroup = BaseMenuGroup & {
  type: GroupTypes.Drinks;
  items: DrinkMenuItem[];
};

export type OtherMenuGroup = BaseMenuGroup & {
  type: GroupTypes.Other;
  items: OtherMenuItem[];
};

export type OptionsGroup = BaseMenuGroup & {
  type: GroupTypes.Options;
  items: OptionMenuItem[];
};

type BaseMenuItem = {
  id: number;
  name: string;
  description: string | null;
};

export type DrinkMenuItem = BaseMenuItem & {
  type: ItemTypes.Drinks;
  optionsGroupKey: string | null;
  sizes: DrinkSizeItem[];
};

export type OptionMenuItem = BaseMenuItem & {
  type: ItemTypes.Options;
  price: number | null;
};

export type OtherMenuItem = BaseMenuItem & {
  type: ItemTypes.Other;
  optionsGroupKey: string | null;
  price: number;
};

export type MenuItem = DrinkMenuItem | OptionMenuItem | OtherMenuItem;

export interface DrinkSizeItem {
  size: DrinkSizes;
  price: number;
}

export function isDrinksGroup(item: AnyGroup): item is DrinksGroup {
  return item.type === GroupTypes.Drinks;
}

export function isDrinkItem(item: MenuItem): item is DrinkMenuItem {
  return item.type === ItemTypes.Drinks;
}
