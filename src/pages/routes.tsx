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
import PageRecordsLast50 from "./records/Last50";
import PageRecordsLast50Detail from "./records/Last50Detail";
import PagePlayerAlbum from "./player/Album";
import PageSettingsApp from "./settings/App";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<PageHome />} />
            <Route path="*" element={<NotReady />} />
            <Route path="records">
                <Route path="game" element={<PageRecordsLast50 />} />
                <Route path="game/:id" element={<PageRecordsLast50Detail />} />
            </Route>
            <Route path="playdata">
                <Route path="album" element={<PagePlayerAlbum />} />
            </Route>
            <Route path="collections">
                <Route path="icon" element={<PageCollectionsIcon />} />
                <Route path="nameplate" element={<PageCollectionsNameplate />} />
                <Route path="frame" element={<PageCollectionsFrame />} />
                <Route path="title" element={<PageCollectionsTitle />} />
                <Route path="partner" element={<PageCollectionsPartner />} />
            </Route>
            <Route path="settings">
                <Route path="app" element={<PageSettingsApp />} />
                <Route path="game" element={<PageSettingsGame />} />
                <Route path="player" element={<PageSettingsPlayer />} />
            </Route>
        </Routes>
    );
}
