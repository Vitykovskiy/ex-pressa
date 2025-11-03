import * as XLSX from 'xlsx';

export interface ParsedMenuItem {
  name: string;
  price: number;
  isAvailable: boolean;
  position: number;
}

/**
 * Читает первый лист Excel и возвращает массив позиций меню.
 * Пропускает пустые или некорректные строки.
 */
export function parseMenuExcel(buffer: Buffer): ParsedMenuItem[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const items: ParsedMenuItem[] = [];

  rows.forEach((row, i) => {
    const name = row.name?.toString().trim();
    const price = parseFloat(row.price);
    const available =
      String(row.isAvailable).toLowerCase() !== 'false' &&
      String(row.isAvailable).trim() !== '0';
    const position = row.position ? parseInt(row.position, 10) : i + 1;

    if (!name || isNaN(price)) return; // пропускаем невалидные

    items.push({ name, price, isAvailable: available, position });
  });

  return items;
}
