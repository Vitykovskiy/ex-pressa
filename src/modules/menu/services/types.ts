export type AnyGroup = DrinksGroup | OptionsGroup | OtherMenuGroup;

export enum MenuItemType {
  DrinksGroup = 'drinks_group',
  OptionsGroup = 'options_group',
  OtherGroup = 'other_group',
  Drink = 'drink',
  Option = 'option',
  Other = 'other',
  Group = 'group',
}

export const isGroupType = (
  type: MenuItemType | null,
): type is
  | MenuItemType.DrinksGroup
  | MenuItemType.OtherGroup
  | MenuItemType.OptionsGroup =>
  type === MenuItemType.DrinksGroup ||
  type === MenuItemType.OtherGroup ||
  type === MenuItemType.OptionsGroup;

interface BaseMenuGroup {
  id: number;
  key: string;
  name: string;
  type:
    | MenuItemType.DrinksGroup
    | MenuItemType.OptionsGroup
    | MenuItemType.OtherGroup;
  available: boolean;
  items: MenuMenuItem[];
}

export type DrinksGroup = BaseMenuGroup & {
  type: MenuItemType.DrinksGroup;
  items: DrinkMenuItem[];
};

export type OtherMenuGroup = BaseMenuGroup & {
  type: MenuItemType.OtherGroup;
  items: OtherMenuItem[];
};

export type OptionsGroup = BaseMenuGroup & {
  type: MenuItemType.OptionsGroup;
  items: OptionMenuItem[];
};

type BaseMenuItem = {
  id: number;
  name: string;
  description: string | null;
};

export type DrinkMenuItem = BaseMenuItem & {
  type: MenuItemType.Drink;
  optionsGroupKey: string | null;
  sizes: DrinkSizeItem[];
};

export type OptionMenuItem = BaseMenuItem & {
  type: MenuItemType.Option;
  price: number | null;
};

export type OtherMenuItem = BaseMenuItem & {
  type: MenuItemType.Other;
  optionsGroupKey: string | null;
  price: number;
};

export type MenuMenuItem = DrinkMenuItem | OptionMenuItem | OtherMenuItem;

export interface DrinkSizeItem {
  size: string;
  price: number;
}
