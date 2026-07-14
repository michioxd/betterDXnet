import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.scss";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./stores/index";
import "./locales/i18n";

const theme = createTheme({
    typography: {
        fontFamily: [
            "Google Sans",
            "Roboto",
            "system-ui",
            "ヒラギノ角ゴ Pro W3",
            "メイリオ",
            "Meiryo",
            "ＭＳ Ｐゴシック",
            "MS P Gothic",
            "sans-serif",
        ].join(","),
    },
    colorSchemes: {
        light: true,
        dark: true,
    },
});

const container = document.createElement("div");
container.id = "betterDXnet-app";
document.body.appendChild(container);

createRoot(container).render(
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme} defaultMode="system">
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StyledEngineProvider>,
);
