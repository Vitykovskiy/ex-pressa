import * as XLSX from 'xlsx';
import { MenuItemType } from '../services/types';

export interface ParsedMenuRow {
  id: number; // порядковый номер строки результата (1..N)
  key: string | null; // key из upload_base (только у заголовков групп/опций)
  parentKey: string | null; // key родителя (drinks_group / other_group / options_group)
  type: MenuItemType | null; // тип позиции/группы
  optionsGroupKey: string | null; // options_group_key для позиций/товаров
  name: string | null;
  size: 's' | 'm' | 'l' | null;
  price: number | null;
  description: string | null;
  available: boolean;
}

export function parseMenuExcel(buffer: Buffer): ParsedMenuRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const excelRows: any[] = XLSX.utils.sheet_to_json(
    workbook.Sheets[sheetName],
    {
      defval: '',
    },
  );

  const resultRows: ParsedMenuRow[] = [];

  let currentGroupKey: string | null = null; // для drink/other
  let currentGroupOptionsKey: string | null = null; // options_group_key, заданный у группы
  let currentOptionsParentKey: string | null = null; // для option внутри options_group

  const pushRow = (rowWithoutId: Omit<ParsedMenuRow, 'id'>) => {
    resultRows.push({
      id: resultRows.length + 1,
      ...rowWithoutId,
    });
  };

  const toStringOrNull = (value: any): string | null => {
    if (value === undefined || value === null) return null;
    const valueString = String(value).trim();
    return valueString === '' ? null : valueString;
  };

  const toNumberOrNull = (value: any): number | null => {
    const numericString = toStringOrNull(value);
    if (!numericString) return null;
    const numericValue = Number(numericString.replace(',', '.'));
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  for (const rawRow of excelRows) {
    // пропускаем полностью пустые строки
    const hasValues = Object.values(rawRow).some((cellValue) => {
      if (cellValue === undefined || cellValue === null) return false;
      return String(cellValue).trim() !== '';
    });
    if (!hasValues) continue;

    const key = toStringOrNull(rawRow.key);
    const groupName = toStringOrNull(rawRow.group_name);
    const rawType = toStringOrNull(rawRow.type); // drink | other | option | null
    const name = toStringOrNull(rawRow.name);
    const description = toStringOrNull(rawRow.description);
    const explicitOptionsKey = toStringOrNull(rawRow.options_group_key);
    const availableRaw = toStringOrNull(rawRow.available);

    const available =
      !availableRaw ||
      (availableRaw.toLowerCase() !== 'false' && availableRaw.trim() !== '0');

    // Заголовок группы или options_group: есть group_name, но нет name
    if (groupName && !name) {
      currentGroupKey = null;
      currentGroupOptionsKey = null;
      currentOptionsParentKey = null;

      // Заголовок группы опций: key вида "options_*"
      if (key && key.startsWith('options_')) {
        currentOptionsParentKey = key;
        pushRow({
          key,
          parentKey: null,
          type: MenuItemType.OptionsGroup,
          optionsGroupKey: null,
          name: groupName,
          size: null,
          price: null,
          description,
          available,
        });
      } else {
        // Обычная группа ассортимента (тип временно 'group')
        currentGroupKey = key;
        currentGroupOptionsKey = explicitOptionsKey;
        pushRow({
          key,
          parentKey: null,
          type: MenuItemType.Group, // позже превратим в drinks_group/other_group
          optionsGroupKey: null,
          name: groupName,
          size: null,
          price: null,
          description,
          available,
        });
      }

      continue;
    }

    // Пункт опций внутри options_group
    if (rawType === MenuItemType.Option) {
      if (!currentOptionsParentKey) {
        // если нет контекста options_group, просто игнорируем
        continue;
      }

      const price =
        toNumberOrNull(rawRow.price) ??
        toNumberOrNull(rawRow.s) ??
        toNumberOrNull(rawRow.m) ??
        toNumberOrNull(rawRow.l);

      pushRow({
        key: null,
        parentKey: currentOptionsParentKey,
        type: MenuItemType.Option,
        optionsGroupKey: null, // как в result_base
        name,
        size: null,
        price,
        description,
        available,
      });

      continue;
    }

    // Напитки / прочие позиции внутри текущей группы
    if (rawType === MenuItemType.Drink) {
      if (!currentGroupKey) continue;

      const resolvedOptionsKey =
        explicitOptionsKey || currentGroupOptionsKey || null;

      // Разворачиваем s/m/l в три строки
      (['s', 'm', 'l'] as const).forEach((sizeKey) => {
        const rawPrice = (rawRow as any)[sizeKey];
        const price = toNumberOrNull(rawPrice);
        if (price === null) return;

        pushRow({
          key: null,
          parentKey: currentGroupKey,
          type: MenuItemType.Drink,
          optionsGroupKey: resolvedOptionsKey,
          name,
          size: sizeKey,
          price,
          description,
          available,
        });
      });

      continue;
    }

    if (rawType === MenuItemType.Other) {
      if (!currentGroupKey) continue;

      const resolvedOptionsKey =
        explicitOptionsKey || currentGroupOptionsKey || null;

      // Одна строка, цена из price (или s/m/l, если вдруг заполнено там)
      const price =
        toNumberOrNull(rawRow.price) ??
        toNumberOrNull(rawRow.s) ??
        toNumberOrNull(rawRow.m) ??
        toNumberOrNull(rawRow.l);

      pushRow({
        key: null,
        parentKey: currentGroupKey,
        type: MenuItemType.Other,
        optionsGroupKey: resolvedOptionsKey,
        name,
        size: null,
        price,
        description,
        available,
      });

      continue;
    }

    // Остальные типы сейчас игнорируем
  }

  // Пост-обработка: group -> drinks_group | other_group
  for (const parsedRow of resultRows) {
    if (parsedRow.type === MenuItemType.Group && parsedRow.key) {
      const hasDrinkChild = resultRows.some(
        (childRow) =>
          childRow.parentKey === parsedRow.key &&
          childRow.type === MenuItemType.Drink,
      );

      parsedRow.type = hasDrinkChild
        ? MenuItemType.DrinksGroup
        : MenuItemType.OtherGroup;
    }
  }

  return resultRows;
}
