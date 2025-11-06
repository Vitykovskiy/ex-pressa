export type AnyGroup = DrinksGroup | OptionsGroup | OtherMenuGroup;

interface BaseMenuGroup {
  id: number;
  key: string;
  name: string;
  type: 'drinks_group' | 'options_group' | 'other_group';
  available: boolean;
  items: MenuMenuItem[];
}

export type DrinksGroup = BaseMenuGroup & {
  type: 'drinks_group';
  items: DrinkMenuItem[];
};

export type OtherMenuGroup = BaseMenuGroup & {
  type: 'other_group';
  items: OtherMenuItem[];
};

export type OptionsGroup = BaseMenuGroup & {
  type: 'options_group';
  items: OptionMenuItem[];
};

type BaseMenuItem = {
  id: number;
  name: string;
  description: string | null;
};

export type DrinkMenuItem = BaseMenuItem & {
  type: 'drink';
  optionsGroupKey: string | null;
  sizes: DrinkSizeItem[];
};

export type OptionMenuItem = BaseMenuItem & {
  type: 'option';
  price: number | null;
};

export type OtherMenuItem = BaseMenuItem & {
  type: 'other';
  optionsGroupKey: string | null;
  price: number;
};

export type MenuMenuItem = DrinkMenuItem | OptionMenuItem | OtherMenuItem;

export interface DrinkSizeItem {
  size: string;
  price: number;
}
