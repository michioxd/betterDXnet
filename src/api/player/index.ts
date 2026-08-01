import { album } from "./album";
import { dxrating } from "./dxrating";
import { favorite, setFavorite } from "./favorite";

export { album } from "./album";
export { dxrating } from "./dxrating";
export { favorite, setFavorite } from "./favorite";
export type { GetPlayerAlbum, GetPlayerDXRating, GetPlayerDXRatingItem, GetPlayerFavoriteSong } from "./types";

export const apiPlayer = {
    album,
    dxrating,
    favorite,
    setFavorite,
};
