import { maimaiApi } from "@/db/maimaiDataApi";
import { apiHelperFetchDoc } from "../helper";
import { GetPlayerFavoriteSong } from "./types";
import { normalizeText } from "@/utils/string";

const PLAYER_FAVORITE_SONG_PATH = "/maimai-mobile/home/userOption/favorite/updateMusic";
const PLAYER_FAVORITE_SONG_UPDATE_PATH = "/maimai-mobile/home/userOption/favorite/updateMusic/set";
const ALL_GENRE_IDX = "99";

export function parsePlayerFavoriteSongLabel(label: HTMLLabelElement): GetPlayerFavoriteSong | null {
    const input = label.querySelector<HTMLInputElement>('input[name="music[]"]');

    if (!input) {
        return null;
    }

    const songTitle = normalizeText(label.querySelector(".favorite_music_name")?.textContent);
    const song = maimaiApi.getSongByTitle(songTitle);

    return {
        songTitle,
        songFullDetail: song,
        selected: input.checked,
        value: input.value,
    };
}

function createFavoriteSongBody(values: string[], token: string) {
    const body = new URLSearchParams();

    body.set("idx", ALL_GENRE_IDX);
    values.forEach((value) => {
        body.append("music[]", value);
    });
    body.set("token", token);

    return body;
}

export async function favorite(): Promise<GetPlayerFavoriteSong[]> {
    const res = await apiHelperFetchDoc(PLAYER_FAVORITE_SONG_PATH);

    return [...res.document.querySelectorAll<HTMLLabelElement>("label.favorite_checkbox_frame")]
        .map(parsePlayerFavoriteSongLabel)
        .filter((song): song is GetPlayerFavoriteSong => song !== null);
}

export async function setFavorite(values: Array<GetPlayerFavoriteSong | string>, token: string): Promise<void> {
    const res = await fetch(new URL(PLAYER_FAVORITE_SONG_UPDATE_PATH, "https://maimaidx-eng.com/").toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: createFavoriteSongBody(
            values.map((value) => (typeof value === "string" ? value : value.value)),
            token,
        ),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
}
