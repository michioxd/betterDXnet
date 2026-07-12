import { Route, Routes } from "react-router-dom";

function PlaceholderPage({ title }: { title: string }) {
    return <div>{title}</div>;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<div>Home</div>} />
            <Route path="dx-rating" element={<PlaceholderPage title="DX Rating" />} />
            <Route path="maimai-record" element={<PlaceholderPage title="Record of maimai" />} />
            <Route path="playdata" element={<PlaceholderPage title="Player data" />} />
            <Route path="playdata/stamp-card" element={<PlaceholderPage title="Stamp card" />} />
            <Route path="playdata/album" element={<PlaceholderPage title="Album" />} />
            <Route path="shop" element={<PlaceholderPage title="maimile Shop" />} />
            <Route path="records/game" element={<PlaceholderPage title="Game records" />} />
            <Route path="records/songs" element={<PlaceholderPage title="Song scores" />} />
            <Route path="records/courses" element={<PlaceholderPage title="Courses" />} />
            <Route path="records/worldstats" element={<PlaceholderPage title="World stats" />} />
            <Route path="events/area" element={<PlaceholderPage title="Area" />} />
            <Route path="events/event-area" element={<PlaceholderPage title="Event area" />} />
            <Route path="events/end-event-area" element={<PlaceholderPage title="End event area" />} />
            <Route path="events/season-info" element={<PlaceholderPage title="Season info" />} />
            <Route path="collections/icon" element={<PlaceholderPage title="Icon collection" />} />
            <Route path="collections/nameplate" element={<PlaceholderPage title="Nameplate collection" />} />
            <Route path="collections/frame" element={<PlaceholderPage title="Frame collection" />} />
            <Route path="collections/title" element={<PlaceholderPage title="Title collection" />} />
            <Route path="collections/tour-member" element={<PlaceholderPage title="Tour member collection" />} />
            <Route path="collections/partner" element={<PlaceholderPage title="Partner collection" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Routes>
    );
}
