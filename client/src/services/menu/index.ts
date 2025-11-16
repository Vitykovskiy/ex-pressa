import { http } from "@/services/http";
import type { AnyGroup } from "./types";

async function fetchMenu(): Promise<AnyGroup[]> {
  return http.get<AnyGroup[]>("/menu/items/all");
}

export default {
  fetchMenu,
};
