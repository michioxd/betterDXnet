import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.scss";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./stores/index";
import "./locales/i18n";
import { AppModeContext } from "./app-context.ts";

export default function bootstrap(root: HTMLElement, mode: "content" | "standalone" = "content") {
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

    createRoot(root).render(
        <AppModeContext.Provider value={mode}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme} defaultMode="system">
                    <CssBaseline />
                    <App />
                </ThemeProvider>
            </StyledEngineProvider>
        </AppModeContext.Provider>,
    );
}
