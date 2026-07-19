import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.scss";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./stores/index";
import "./locales/i18n";
import { extensionRuntime } from "./runtime.ts";

if (document.body.innerHTML.includes("Sorry, servers are under maintenance.")) {
    document.querySelector(".main_info")!.innerHTML += `<div id='betterDXnet-warning'>
    <a href="https://github.com/michioxd/betterDXnet" target="_blank" rel="noopener noreferrer">betterDXnet</a> is not available while the servers are under maintenance.
    </div>`;

    extensionRuntime.onMessage.addListener((message: { type?: string }) => {
        if (message.type === "betterdxnet:toggle") {
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        }
    });
} else {
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
}
