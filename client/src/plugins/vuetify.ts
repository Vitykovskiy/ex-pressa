import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#46250dff",
  },
};

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#0000ff",
    surface: "#1E1E1E",
    primary: "#00ffff",
    secondary: "#0088cc",
    success: "#388E3C",
    warning: "#FBC02D",
    error: "#D32F2F",
    info: "#1976D2",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      dark,
      light,
    },
  },
});
