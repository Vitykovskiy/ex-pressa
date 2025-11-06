import * as XLSX from 'xlsx';

export interface ParsedMenuRow {
  id: number; // порядковый номер строки результата (1..N)
  key: string | null; // key из upload_base (только у заголовков групп/опций)
  parentKey: string | null; // key родителя (group или options_group)
  type: string | null; // group | options_group | drink | other | option
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
  const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: '',
  });

  const result: ParsedMenuRow[] = [];

  let currentGroupKey: string | null = null; // для drink/other
  let currentGroupOptionsKey: string | null = null; // options_group_key, заданный у группы
  let currentOptionsParentKey: string | null = null; // для option внутри options_group

  const pushRow = (row: Omit<ParsedMenuRow, 'id'>) => {
    result.push({
      id: result.length + 1,
      ...row,
    });
  };

  const toStr = (value: any): string | null => {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    return s === '' ? null : s;
  };

  const toNum = (value: any): number | null => {
    const s = toStr(value);
    if (!s) return null;
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  for (const row of rows) {
    // пропускаем полностью пустые строки
    const hasValues = Object.values(row).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== '',
    );
    if (!hasValues) continue;

    const key = toStr(row.key);
    const groupName = toStr(row.group_name);
    const rawType = toStr(row.type); // drink | other | option | null
    const name = toStr(row.name);
    const description = toStr(row.description);
    const explicitOptionsKey = toStr(row.options_group_key);
    const availableRaw = toStr(row.available);

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
          type: 'options_group',
          optionsGroupKey: null,
          name: groupName,
          size: null,
          price: null,
          description,
          available,
        });
      } else {
        // Обычная группа ассортимента
        currentGroupKey = key;
        currentGroupOptionsKey = explicitOptionsKey;
        pushRow({
          key,
          parentKey: null,
          type: 'group',
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
    if (rawType === 'option') {
      if (!currentOptionsParentKey) {
        // если нет контекста options_group, просто игнорируем
        continue;
      }

      const price = toNum(row.price ?? row.s ?? row.m ?? row.l);

      pushRow({
        key: null,
        parentKey: currentOptionsParentKey,
        type: 'option',
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
    if (rawType === 'drink') {
      if (!currentGroupKey) continue;

      const resolvedOptionsKey =
        explicitOptionsKey || currentGroupOptionsKey || null;

      // Разворачиваем s/m/l в три строки
      (['s', 'm', 'l'] as const).forEach((sizeKey) => {
        const rawPrice = (row as any)[sizeKey];
        const price = toNum(rawPrice);
        if (price === null) return;

        pushRow({
          key: null,
          parentKey: currentGroupKey,
          type: 'drink',
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

    if (rawType === 'other') {
      if (!currentGroupKey) continue;

      const resolvedOptionsKey =
        explicitOptionsKey || currentGroupOptionsKey || null;

      // Одна строка, цена из price (или s/m/l, если вдруг заполнено там)
      const price = toNum(row.price ?? row.s ?? row.m ?? row.l);

      pushRow({
        key: null,
        parentKey: currentGroupKey,
        type: 'other',
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

  return result;
}
