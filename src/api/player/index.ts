import { album } from "./album";
import { dxrating } from "./dxrating";

export { album } from "./album";
export { dxrating } from "./dxrating";
export type { GetPlayerAlbum, GetPlayerDXRating, GetPlayerDXRatingItem } from "./types";

export const apiPlayer = {
    album,
    dxrating,
};
