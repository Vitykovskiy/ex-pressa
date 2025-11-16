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
    background: "#0000ff", // glowing blue
    surface: "#1E1E1E", // темный оттенок для поверхности
    primary: "#00ffff", // светло-голубой для акцентов
    secondary: "#0088cc", // более темный синий для второстепенных элементов
    success: "#388E3C", // стандартный зеленый для успеха
    warning: "#FBC02D", // желтый для предупреждений
    error: "#D32F2F", // красный для ошибок
    info: "#1976D2", // синий для информационных сообщений
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
