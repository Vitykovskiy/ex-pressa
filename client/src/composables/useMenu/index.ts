import type { HttpError } from "@/services/http";
import menuService from "@/services/menu";
import {
  GroupTypes,
  type DrinksGroup,
  type OptionsGroup,
  type OtherMenuGroup,
} from "@/services/menu/types";

import { ref } from "vue";

const menu = ref<(DrinksGroup | OtherMenuGroup)[]>([]);
const options = ref<OptionsGroup[]>([]);

export function useMenu() {
  async function fetchMenu(): Promise<void> {
    try {
      const data = await menuService.fetchMenu();

      menu.value = data.filter((group) => group.type !== GroupTypes.Options);
      options.value = data.filter((group) => group.type === GroupTypes.Options);
    } catch (e) {
      const err = e as HttpError;
      console.error(err.message, err.status, err.data);
    }
  }

  return { menu, options, fetchMenu };
}
