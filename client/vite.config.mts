import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import Fonts from "unplugin-fonts/vite";
import VueRouter from "unplugin-vue-router/vite";

// Вспомогательные константы
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";

const packageDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(packageDir, "..");

const safeParseUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

// Настройка Vite
export default defineConfig(({ mode }) => {
  const sharedEnv = loadEnv(mode, repoRoot, "");
  const localEnv = loadEnv(mode, packageDir, "");
  const env = { ...sharedEnv, ...localEnv };

  process.env = { ...process.env, ...env };

  const clientUrl =
    env.WEB_APP_URL || env.VITE_WEB_APP_URL || `http://localhost:${env.VITE_DEV_SERVER_PORT || "5173"}`;

  const parsedClientUrl = safeParseUrl(clientUrl);
  const clientHost = parsedClientUrl?.hostname || "localhost";
  const clientPort = parsedClientUrl?.port ? Number(parsedClientUrl.port) : 5173;

  return {
    plugins: [
      VueRouter({
        dts: "src/typed-router.d.ts",
      }),
      Vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
        styles: {
          configFile: "src/styles/settings.scss",
        },
      }),
      Components({
        dts: "src/components.d.ts",
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: "Roboto",
              weights: [100, 300, 400, 500, 700, 900],
              styles: ["normal", "italic"],
            },
          ],
        },
      }),
    ],
    optimizeDeps: {
      exclude: [
        "vuetify",
        "vue-router",
        "unplugin-vue-router/runtime",
        "unplugin-vue-router/data-loaders",
        "unplugin-vue-router/data-loaders/basic",
      ],
    },
    define: { "process.env": {} },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("src", import.meta.url)),
      },
      extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
    server: {
      host: clientHost,
      port: clientPort,
    },
  };
});
