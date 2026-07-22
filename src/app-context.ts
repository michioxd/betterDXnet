import { createContext, useContext } from "react";

export const AppModeContext = createContext<"content" | "standalone">("content");

export const useAppMode = () => {
    const context = useContext(AppModeContext);
    if (!context) {
        throw new Error("useAppMode must be used within an AppModeContext.Provider");
    }

    return context;
};
