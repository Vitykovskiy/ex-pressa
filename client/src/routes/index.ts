import type { RouteRecordRaw } from "vue-router";
import Menu from "@/views/menu/index.vue";
import MenuItem from "@/views/menuItem/index.vue";
import Cart from "@/views/cart/index.vue";

export const enum RouteNames {
  Menu = "Menu",
  MenuItem = "MenuItem",
  Cart = "Cart",
  CartItem = "CartItem",
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/:group?",
    children: [
      {
        path: "",
        name: RouteNames.Menu,
        component: Menu,
      },
      {
        path: "item/:item",
        name: RouteNames.MenuItem,
        component: MenuItem,
      },
    ],
  },
  {
    path: "/cart",
    children: [
      {
        path: "",
        name: RouteNames.Cart,
        component: Cart,
      },
      {
        path: "/:item",
        name: RouteNames.CartItem,
        component: MenuItem,
      },
    ],
  },
];
