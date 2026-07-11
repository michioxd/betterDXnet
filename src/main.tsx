import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import "@fontsource/google-sans/400.css";
// import "@fontsource/google-sans/500.css";
// import "@fontsource/google-sans/700.css";
import "./main.scss";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./stores/index";

const theme = createTheme({
    typography: {
        fontFamily: ["Google Sans", "Roboto", "system-ui", "sans-serif"].join(","),
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
    <StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} defaultMode="system">
                <CssBaseline />
                <App />
            </ThemeProvider>
        </StyledEngineProvider>
    </StrictMode>,
);
