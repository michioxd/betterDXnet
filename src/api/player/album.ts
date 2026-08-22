import { maimaiApi } from "@/db/maimaiDataApi";
import { apiHelperFetchDoc } from "../helper";
import { GameRecordSongDifficulty, GameRecordSongKind } from "../records";
import { GetPlayerAlbum } from "./types";
import { imageName, normalizeText, parsePlayDate } from "@/utils/string";

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

export function parsePlayerAlbumBlock(block: HTMLElement): GetPlayerAlbum {
    const difficultyName = imageName(block.querySelector<HTMLImageElement>('img[src*="/img/diff_"]'));
    const songKindName = imageName(block.querySelector<HTMLImageElement>(".music_kind_icon"));
    const songTitle = normalizeText(block.querySelector(".black_block")?.textContent);
    const songLevel = normalizeText(block.querySelector(".music_lv_block")?.textContent);
    const songdifficulty = difficultyByImageName[difficultyName] ?? GameRecordSongDifficulty.BASIC;
    const songKind = songKindByImageName[songKindName] ?? GameRecordSongKind.STANDARD;

    const querySongDetails = maimaiApi.getSheet({
        title: songTitle,
        difficulty: songdifficulty,
        type: songKind,
    });

    return {
        songKind,
        songTitle,
        songdifficulty,
        songLevel,
        songFullDetail: querySongDetails,
        location: normalizeText(block.querySelector(".see_through_block")?.textContent),
        imageUrl: block.querySelector<HTMLAnchorElement>('a[target="_blank"]')?.href ?? "",
        date: parsePlayDate(normalizeText(block.querySelector(".block_info")?.textContent)),
    };
}

export async function album(): Promise<GetPlayerAlbum[]> {
    const res = await apiHelperFetchDoc(PLAYER_ALBUM_PATH);

    return [...res.document.querySelectorAll<HTMLElement>('[class*="music_"][class*="_score_back"]')].map(
        parsePlayerAlbumBlock,
    );
}
