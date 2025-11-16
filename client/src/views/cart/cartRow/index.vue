<template>
    <div class="cart-row">
        <div class="cart-row__info">
            <h3 class="cart-row__name">
                {{ item.name }} <span v-if="item.size">({{ item.size.toUpperCase() }})</span>
            </h3>
            <div class="cart-row__cost">
                <div class="cart-row__quantity">
                    <v-btn variant="text" icon="mdi-minus" :ripple="false" @click.stop="() => quantityComputed--" />
                    <span>{{ quantityComputed }}</span>
                    <v-btn variant="text" icon="mdi-plus" :ripple="false" @click.stop="() => quantityComputed++" />
                </div>
                <h3 class="cart-row__price">{{ item.price * item.quantity }}</h3>
            </div>
        </div>

        <div class="cart-row__options">
            <v-chip v-for="option in options" :key="option" variant="text">{{ option }}</v-chip>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { IProps } from './types';

defineOptions({
    name: 'CartRowItem',
});


const props = defineProps<IProps>()

const item = ref({ ...props.item })

const options = computed<string[]>(() => props.item.selectedOptions?.map(({ name }) => name) ?? [])


const quantityComputed = computed({
    get() {
        return item.value.quantity;
    },
    set(value) {
        item.value.quantity = value >= 0 && value <= 20 ? value : item.value.quantity;
    },
});

</script>

<style lang="scss" scoped>
.cart-row {
    display: flex;
    flex-direction: column;

    &__info {
        display: flex;
        align-items: center;
    }

    &__name {
        flex-grow: 1;
    }

    &__quantity {
        display: flex;
        align-items: center;

        span {
            font-size: 16px;
            user-select: none;
            pointer-events: none;
        }
    }

    &__cost {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    &__price {
        width: 40px
    }
}
</style>
