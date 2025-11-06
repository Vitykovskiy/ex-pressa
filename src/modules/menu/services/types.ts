export type AnyGroup = MenuGroup | OptionsGroup;

interface BaseMenuGroup {
  id: number;
  key: string;
  name: string;
  type: 'group' | 'options_group';
  available: boolean;
  items: MenuItemView[];
}

export type MenuGroup = BaseMenuGroup & {
  type: 'group';
  items: (DrinkItemView | OtherItemView)[];
};

export type OptionsGroup = BaseMenuGroup & {
  type: 'options_group';
  items: OptionItemView[];
};

type BaseMenuItem = {
  id: number;
  name: string;
  description: string | null;
};

export type DrinkItemView = BaseMenuItem & {
  type: 'drink';
  optionsGroupKey: string | null;
  sizes: MenuItemSize[];
};

export type OptionItemView = BaseMenuItem & {
  type: 'option';
  price: number | null;
};

export type OtherItemView = BaseMenuItem & {
  type: 'other';
  optionsGroupKey: string | null;
  price: number;
};

export type MenuItemView = DrinkItemView | OptionItemView | OtherItemView;

export interface MenuItemSize {
  size: string;
  price: number;
}
