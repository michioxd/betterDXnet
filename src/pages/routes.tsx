import { Route, Routes } from "react-router-dom";
import NotReady from "./NotReady";
import PageHome from "./Home";

import PageCollectionsIcon from "./collections/Icon";
import PageCollectionsNameplate from "./collections/Nameplate";
import PageCollectionsFrame from "./collections/Frame";
import PageCollectionsTitle from "./collections/Title";
import PageCollectionsPartner from "./collections/Partner";
import PageSettingsGame from "./settings/Game";
import PageSettingsPlayer from "./settings/Player";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<PageHome />} />
            <Route path="*" element={<NotReady />} />
            <Route path="collections">
                <Route path="icon" element={<PageCollectionsIcon />} />
                <Route path="nameplate" element={<PageCollectionsNameplate />} />
                <Route path="frame" element={<PageCollectionsFrame />} />
                <Route path="title" element={<PageCollectionsTitle />} />
                <Route path="partner" element={<PageCollectionsPartner />} />
            </Route>
            <Route path="settings">
                <Route path="game" element={<PageSettingsGame />} />
                <Route path="player" element={<PageSettingsPlayer />} />
            </Route>
        </Routes>
    );
}
