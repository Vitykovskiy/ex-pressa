<template>
    <div class="card">
        <div class="card__header">
            <h2>{{ item?.name }}</h2>
            <p>{{ item?.description }}</p>
            <h3>{{ basePrice * quantity + " ₽" }}</h3>
        </div>
        <v-divider />

        <template v-if="sizes?.length">
            <div class="card__body">
                <div class="card__sizes">
                    <v-btn-toggle v-model="sizeSelector" color="primary" mandatory>
                        <v-btn v-for="{ size } of sizes" :key="size" variant="outlined" :ripple="false">
                            {{ size }}
                        </v-btn>
                    </v-btn-toggle>
                </div>
            </div>
            <v-divider />
        </template>

        <template v-if="optionsItems?.length">
            <div class="card__body">
                <h3>Добавить</h3>
                <div class="card__options">
                    <v-btn v-for="option in optionsItems" :key="option.id" variant="outlined" :ripple="false"
                        :active="isOptionSelected(option)" @click="onOptionClick(option)">
                        {{ option.name }} {{ option.price }}
                    </v-btn>
                </div>
            </div>
            <v-divider />
        </template>

        <div class="card__body">
            <div class="card__actions">
                <v-btn-toggle>
                    <v-btn variant="outlined" icon="mdi-minus" :ripple="false" @click="() => quantityComputed--" />
                    <v-btn variant="outlined" :ripple="false">{{ quantityComputed }}</v-btn>
                    <v-btn variant="outlined" icon="mdi-plus" :ripple="false" @click="() => quantityComputed++" />
                </v-btn-toggle>
                <v-btn height="48" color="primary" :ripple="false" @click="onConfirmCallback">
                    {{ isEditForm ? 'Изменить' : 'Добавить' }}
                </v-btn>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { useMenu } from '@/composables/useMenu';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCart } from '@/composables/useCart';
import router from '@/router';
import { DrinkSizes, isDrinkItem, type DrinkMenuItem, type DrinkSizeItem, type OptionMenuItem, type OtherMenuItem } from '@/services/menu/types';
import { RouteNames } from '@/routes';

defineOptions({
    name: 'MenuItemView',
});

const MAX_POSITION_QUANTITY = 20

const route = useRoute();
const { menu, options } = useMenu();
const { addToCart, editCartItem } = useCart();

const quantity = ref(parseInt(route.query.quantity as string) || 1);
const drinkSizes = [DrinkSizes.Small, DrinkSizes.Medium, DrinkSizes.Large]

const initialSizeSelector = () => {
    const size = route.query.size as string | undefined;
    const index = size ? drinkSizes.indexOf(size as DrinkSizes) : -1;
    return index >= 0 ? index : 1;
};

const itemCartId = computed(() => {
    const id = parseInt(route.query.id as string);
    return isNaN(id) ? null : id
})
const isEditForm = computed(() => route.name === RouteNames.CartItem)

const onConfirmCallback = computed(() => isEditForm.value ? onEdit : onAdd)

const sizeSelector = ref<number>(initialSizeSelector());

const quantityComputed = computed({
    get() {
        return quantity.value;
    },
    set(value) {
        quantity.value = value && value <= MAX_POSITION_QUANTITY ? value : quantity.value;
    },
});


const item = computed<DrinkMenuItem | OtherMenuItem | null>(() => {
    const { group: groupId, item: itemId } = route.params
    const group = menu.value.find((item) => item.id === Number(groupId))
    return group?.items.find((item) => item.id === Number(itemId)) || null
})

const optionsItems = computed<OptionMenuItem[] | null>(() => {
    const optionsKey = item.value?.optionsGroupKey
    return options.value.find((item) => item.key === optionsKey)?.items || null
})

const sizes = computed<DrinkSizeItem[] | null>(() =>
    item.value && isDrinkItem(item.value) ? item.value.sizes : null
);

const selectedDrinkSize = computed<DrinkSizeItem | null>(() =>
    sizes.value?.[sizeSelector.value] ?? null
);

const initialSelectedOptions = () => {
    const { options } = route.query

    if (options && Array.isArray(options)) {
        return optionsItems.value?.filter(({ id }) => options.some((optionId) => Number(optionId) === id)) || []
    }

    return []
};


const selectedOptions = ref<OptionMenuItem[]>(initialSelectedOptions());

const basePrice = computed(() => {
    if (!item.value) return 0

    const basePrice = isDrinkItem(item.value) ? selectedDrinkSize.value?.price : item.value?.price

    const optionsPrice = selectedOptions.value.reduce((acc, value) => { return acc + (value.price ?? 0) }, 0)

    return basePrice ? basePrice + optionsPrice : 0
})

function onOptionClick(option: OptionMenuItem): void {
    if (isOptionSelected(option)) {
        selectedOptions.value = selectedOptions.value.filter(
            ({ id }) => id !== option.id,
        );
    } else {
        selectedOptions.value.push(option);
    }
}

function isOptionSelected(option: OptionMenuItem): boolean {
    return selectedOptions.value.some(({ id }) => id === option.id);
}

async function onAdd(): Promise<void> {
    if (!item.value) return

    try {
        await addToCart({
            id: item.value.id,
            quantity: quantity.value,
            size: selectedDrinkSize.value?.size,
            selectedOptions: selectedOptions.value.map(({ id }) => id),
        });

        router.back();
    } catch (error) {
        console.error(error);
    }
}

async function onEdit(): Promise<void> {
    if (!item.value || itemCartId.value === null) return

    try {
        await editCartItem(itemCartId.value, {
            id: item.value.id,
            quantity: quantity.value,
            size: selectedDrinkSize.value?.size,
            selectedOptions: selectedOptions.value.map(({ id }) => id),
        })

        router.back();
    } catch (error) {
        console.error(error);
    }
}

</script>

<style lang="scss">
.card {
    display: flex;
    flex-direction: column;
    margin: 0 20px;
    gap: 15px;

    &__header {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__sizes,
    &__options,
    &__actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 5px;
    }
}
</style>
