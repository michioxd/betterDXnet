import { maimaiApi } from "@/db/maimaiDataApi";
import { apiHelperFetchDoc } from "../helper";
import { GameRecordSongDifficulty, GameRecordSongKind } from "../records";
import { GetPlayerAlbum } from "./types";

const PLAYER_ALBUM_PATH = "/maimai-mobile/playerData/photo/";

const difficultyByImageName: Record<string, GameRecordSongDifficulty> = {
    diff_basic: GameRecordSongDifficulty.BASIC,
    diff_advanced: GameRecordSongDifficulty.ADVANCED,
    diff_expert: GameRecordSongDifficulty.EXPERT,
    diff_master: GameRecordSongDifficulty.MASTER,
    diff_remaster: GameRecordSongDifficulty.REMASTER,
};

const songKindByImageName: Record<string, GameRecordSongKind> = {
    music_standard: GameRecordSongKind.STANDARD,
    music_dx: GameRecordSongKind.DX,
    music_utage: GameRecordSongKind.UTAGE,
};

function normalizeText(value: string | null | undefined) {
    return value?.replace(/\s+/g, " ").trim() ?? "";
}

function imageName(image: HTMLImageElement | null | undefined) {
    return (
        image
            ?.getAttribute("src")
            ?.split("/")
            .pop()
            ?.split("?")[0]
            ?.replace(/\.png$/, "") ?? ""
    );
}

function parseJapanDate(value: string) {
    const [, year, month, day, hour, minute] = value.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/) ?? [];

    if (!year || !month || !day || !hour || !minute) {
        return new Date(value);
    }

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 9, Number(minute)));
}

export function parsePlayerAlbumBlock(block: HTMLElement): GetPlayerAlbum {
    const difficultyName = imageName(block.querySelector<HTMLImageElement>('img[src*="/img/diff_"]'));
    const songKindName = imageName(block.querySelector<HTMLImageElement>(".music_kind_icon"));
    const songTitle = normalizeText(block.querySelector(".black_block")?.textContent);
    const songLevel = difficultyByImageName[difficultyName] ?? GameRecordSongDifficulty.BASIC;
    const songKind = songKindByImageName[songKindName] ?? GameRecordSongKind.STANDARD;

    const querySongDetails = maimaiApi.getSheetByDifficulty({
        title: songTitle,
        difficulty: songLevel,
        type: songKind,
    });

    return {
        songKind,
        songTitle,
        songdifficulty: songLevel,
        songFullDetail: querySongDetails,
        location: normalizeText(block.querySelector(".see_through_block")?.textContent),
        imageUrl: block.querySelector<HTMLAnchorElement>('a[target="_blank"]')?.href ?? "",
        date: parseJapanDate(normalizeText(block.querySelector(".block_info")?.textContent)),
    };
}

export async function album(): Promise<GetPlayerAlbum[]> {
    const res = await apiHelperFetchDoc(PLAYER_ALBUM_PATH);

    return [...res.document.querySelectorAll<HTMLElement>('[class*="music_"][class*="_score_back"]')].map(
        parsePlayerAlbumBlock,
    );
}
