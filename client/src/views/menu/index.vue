<template>
  <v-data-table hide-default-footer :items-per-page="-1" :items="items" :headers="headers" hover
    no-data-text="Пока не загрузилось" @click:row="onRowClick">

    <template v-slot:[HEADER_NAME_SLOT]>
      <h2>{{ title }}</h2>
    </template>

  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, } from "vue";
import { DRINKS_TABLE_HEADERS, GROUPS_TABLE_HEADERS, OTHER_TABLE_HEADERS } from "./constants";
import { isGroupRow, type DrinkSizesRecord, type GroupTableRowItem, type OtherTableRowItem, type TableRow } from "./types";
import type { DataTableHeader } from "vuetify";
import type { ItemSlotBase } from "vuetify/lib/components/VDataTable/types.mjs";
import router from "@/router";
import { useRoute } from "vue-router";
import { RouteNames } from "@/routes";
import { useMenu } from "@/composables/useMenu";
import { GroupTypes, isDrinksGroup, type DrinksGroup, type DrinkSizeItem, type OtherMenuGroup } from "@/services/menu/types";

defineOptions({
  name: 'MenuView',
});

const HEADER_NAME_SLOT = 'header.name';


const route = useRoute()
const { menu } = useMenu()
const activeGroup = computed<DrinksGroup | OtherMenuGroup | null>(() =>
  menu.value.find(({ id }) => id === Number(route.params.group)) ?? null
);

const title = computed(() =>
  activeGroup.value ? activeGroup.value.name : "Меню",
);

const items = computed<TableRow[]>(() => {
  if (!activeGroup.value) {
    return menu.value.map(({ id, key, name, type }) => ({ id, key, name, type })) as GroupTableRowItem[]
  }

  if (isDrinksGroup(activeGroup.value)) {
    const unzip = (sizes: DrinkSizeItem[]): DrinkSizesRecord =>
      sizes.reduce((acc, value) => {
        acc[value.size] = { price: value.price };
        return acc;
      }, {} as DrinkSizesRecord);

    return activeGroup.value.items.map(({ sizes, ...rest }) => ({ ...rest, sizes: unzip(sizes) }))

  }

  return activeGroup.value.items.map(({ id, name, price }) => (
    {
      id,
      name,
      price,
    })) as OtherTableRowItem[]
}
);

const headers = computed<DataTableHeader[]>(() => {
  if (!activeGroup.value) {
    return GROUPS_TABLE_HEADERS
  }

  switch (activeGroup.value.type) {
    case GroupTypes.Drinks:
      return DRINKS_TABLE_HEADERS;

    case GroupTypes.Other:
      return OTHER_TABLE_HEADERS;

    default:
      return GROUPS_TABLE_HEADERS;
  }
});

function onRowClick(
  _event: globalThis.MouseEvent,
  ctx: ItemSlotBase<TableRow>,
): void {
  const tableRow = ctx.item;

  if (isGroupRow(tableRow)) {
    router.push({ name: RouteNames.Menu, params: { group: tableRow.id } })
    return;
  }

  router.push({ name: RouteNames.MenuItem, params: { item: tableRow.id } })
}
</script>

<style lang="scss" scoped></style>
