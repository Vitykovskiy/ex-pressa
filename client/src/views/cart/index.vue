<template>
    <v-data-table hide-default-footer :items-per-page="-1" :items="cart" :headers="headers" hover
        no-data-text="Пока ничего не добавлено" @click:row="onRowClick">
        <template v-slot:[HEADER_ITEM_SLOT]>
            <h2>Корзина</h2>
        </template>
        <template v-slot:[ITEM_ITEM_SLOT]="{ item }">
            <CartRow :item="item" />
        </template>
    </v-data-table>
</template>

<script lang="ts" setup>
import { useCart } from '@/composables/useCart/';
import CartRow from './cartRow/index.vue'
import { ref } from 'vue';
import { CART_TABLE_HEADERS } from './constants';
import type { DataTableHeader } from 'vuetify';
import type { ItemSlotBase } from 'vuetify/lib/components/VDataTable/types.mjs';
import router from '@/router';
import { RouteNames } from '@/routes';
import type { ICartItem } from '@/composables/useCart/types';

defineOptions({
    name: 'CartView',
});

const HEADER_ITEM_SLOT = 'header.item';
const ITEM_ITEM_SLOT = 'item.item';


const { cart } = useCart()

const headers = ref<DataTableHeader[]>(CART_TABLE_HEADERS)

function onRowClick(
    _event: globalThis.MouseEvent,
    ctx: ItemSlotBase<ICartItem>
): void {
    router.push({
        name: RouteNames.CartItem,
        params: { item: ctx.item.menuItemId },
    })
}

</script>

<style lang="scss" scoped></style>
