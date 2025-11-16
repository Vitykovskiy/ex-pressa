<template>
  <v-app>
    <v-main max-width="400">
      <div class="header">
        <div class="header__left">
          <v-btn v-if="!isMainMenu" variant="plain" icon="mdi-arrow-left" @click="onReturnBtn" />
        </div>
        <div class="header__right">
          <div class="cart">
            <v-btn variant="plain" color="primary" icon="mdi-cart-variant" @click="onCart" />
            <div class="cart__counter">{{ cart.length || '' }}</div>
          </div>
        </div>
      </div>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import router from './router';
import { RouteNames } from './routes';
import { useCart } from './composables/useCart';
import { useMenu } from './composables/useMenu';

const route = useRoute()
const { cart, fetchCart } = useCart()
const { fetchMenu } = useMenu()

const isMainMenu = computed(() =>
  route.name === RouteNames.Menu && !route.params.group
)

function onReturnBtn(): void {
  router.back()
}

function onCart(): void {
  router.push({ name: RouteNames.Cart })
}

async function initApp(): Promise<void> {
  await fetchMenu()
  await fetchCart()
}

onBeforeMount(async () => {
  await initApp()
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;

}

:deep(.v-main) {
  padding: 0 10px;
}

.cart {
  position: relative;

  &__counter {
    position: absolute;
    top: 20px;
    right: 0;

    width: 15px;
    font-size: 13px;

    user-select: none;
    pointer-events: none;
  }
}
</style>