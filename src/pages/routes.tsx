import { Route, Routes } from "react-router-dom";
import NotReady from "./NotReady";
import PageHome from "./Home";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<PageHome />} />
            <Route path="*" element={<NotReady />} />
        </Routes>
    );
}
