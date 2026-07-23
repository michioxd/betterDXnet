import { maimaiApi } from "@/db/maimaiDataApi";
import { calculateRating } from "@/utils/rating";
import { apiHelperFetchDoc } from "../helper";
import {
    GameRecordScoreRank,
    GameRecordSong,
    GameRecordSongDifficulty,
    GameRecordSongDifficultyOrUtage,
    GameRecordSongKind,
    GameRecordStatus,
    GameRecordSyncStatus,
    GameRecordSyncStatusShort,
    GetGameRecordSong,
} from "./types";

const SONG_RECORDS_PATH = "/maimai-mobile/record/musicGenre/search/";
const DEFAULT_FETCH_ALL_THRESHOLD_MS = 800;

const allDifficulties = [
    GameRecordSongDifficulty.BASIC,
    GameRecordSongDifficulty.ADVANCED,
    GameRecordSongDifficulty.EXPERT,
    GameRecordSongDifficulty.MASTER,
    GameRecordSongDifficulty.REMASTER,
];

const diffQueryByDifficulty: Record<GameRecordSongDifficultyOrUtage, string> = {
    [GameRecordSongDifficulty.BASIC]: "0",
    [GameRecordSongDifficulty.ADVANCED]: "1",
    [GameRecordSongDifficulty.EXPERT]: "2",
    [GameRecordSongDifficulty.MASTER]: "3",
    [GameRecordSongDifficulty.REMASTER]: "4",
    [GameRecordSongKind.UTAGE]: "10",
};

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

const scoreRankByImageName: Record<string, GameRecordScoreRank> = {
    music_icon_d: GameRecordScoreRank.D,
    music_icon_c: GameRecordScoreRank.C,
    music_icon_b: GameRecordScoreRank.B,
    music_icon_bb: GameRecordScoreRank.BB,
    music_icon_bbb: GameRecordScoreRank.BBB,
    music_icon_a: GameRecordScoreRank.A,
    music_icon_aa: GameRecordScoreRank.AA,
    music_icon_aaa: GameRecordScoreRank.AAA,
    music_icon_s: GameRecordScoreRank.S,
    music_icon_sp: GameRecordScoreRank.S_P,
    music_icon_ss: GameRecordScoreRank.SS,
    music_icon_ssp: GameRecordScoreRank.SS_P,
    music_icon_sss: GameRecordScoreRank.SSS,
    music_icon_sssp: GameRecordScoreRank.SSS_P,
};

const statusByImageName: Record<string, GameRecordStatus> = {
    music_icon_back: GameRecordStatus.CLEARED,
    music_icon_clear: GameRecordStatus.CLEARED,
    music_icon_fc: GameRecordStatus.FULL_COMBO,
    music_icon_fcp: GameRecordStatus.FULL_COMBO_PLUS,
    music_icon_ap: GameRecordStatus.ALL_PERFECT,
    music_icon_app: GameRecordStatus.ALL_PERFECT_PLUS,
};

const syncStatusByImageName: Record<string, GameRecordSyncStatus> = {
    music_icon_sync: GameRecordSyncStatus.SYNC_PLAY,
    music_icon_fs: GameRecordSyncStatus.FULL_SYNC,
    music_icon_fsp: GameRecordSyncStatus.FULL_SYNC_PLUS,
    music_icon_fsd: GameRecordSyncStatus.FULL_SYNC_DX,
    music_icon_fsdp: GameRecordSyncStatus.FULL_SYNC_DX_PLUS,
};

const syncStatusShortByImageName: Record<string, GameRecordSyncStatusShort> = {
    music_icon_sync: GameRecordSyncStatusShort.SYNC_PLAY,
    music_icon_fs: GameRecordSyncStatusShort.FULL_SYNC,
    music_icon_fsp: GameRecordSyncStatusShort.FULL_SYNC_PLUS,
    music_icon_fsd: GameRecordSyncStatusShort.FULL_SYNC_DX,
    music_icon_fsdp: GameRecordSyncStatusShort.FULL_SYNC_DX_PLUS,
};

export type SongRecordsOptions = {
    diff?: GameRecordSongDifficultyOrUtage;
    fetchAll?: boolean;
    thresholdMs?: number;
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

function parseNumber(value: string | null | undefined) {
    return Number(normalizeText(value).replace(/[,%]/g, "")) || 0;
}

function parseDxScore(value: string | null | undefined) {
    const [current = "0", max = "0"] = normalizeText(value)
        .replace(/^DX SCORE\s*/i, "")
        .split("/")
        .map((item) => item.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function songRecordsPath(diff: GameRecordSongDifficultyOrUtage) {
    const params = new URLSearchParams({
        genre: "99",
        diff: diffQueryByDifficulty[diff],
    });

    return `${SONG_RECORDS_PATH}?${params.toString()}`;
}

function parseSongRecordBlock(
    block: HTMLElement,
    fallbackDiff: GameRecordSongDifficultyOrUtage,
): GameRecordSong | null {
    const scoreBlocks = [...block.querySelectorAll<HTMLElement>(".music_score_block")];
    const achievement = parseNumber(scoreBlocks[0]?.textContent);

    if (achievement <= 0) {
        return null;
    }

    const difficultyName = imageName(block.querySelector<HTMLImageElement>('img[src*="/img/diff_"]'));
    const songKindName = imageName(block.querySelector<HTMLImageElement>(".music_kind_icon"));
    const resultIconNames = [...block.querySelectorAll<HTMLImageElement>('img[src*="/img/music_icon_"]')].map(
        imageName,
    );
    const scoreRankName = resultIconNames.find((name) => name in scoreRankByImageName) ?? "";
    const statusName = resultIconNames.find((name) => name in statusByImageName) ?? "";
    const syncStatusName = resultIconNames.find((name) => name in syncStatusByImageName) ?? "";
    const songTitle = normalizeText(block.querySelector(".music_name_block")?.textContent);
    const songLevel = normalizeText(block.querySelector(".music_lv_block")?.textContent);
    const songdifficulty =
        difficultyByImageName[difficultyName] ??
        (fallbackDiff !== GameRecordSongKind.UTAGE ? fallbackDiff : GameRecordSongDifficulty.BASIC);
    const songKind = songKindByImageName[songKindName] ?? GameRecordSongKind.STANDARD;

    const querySongDetails = maimaiApi.getSheet({
        title: songTitle,
        level: songLevel,
        type: songKind,
    });
    const status =
        achievement < 80 ? GameRecordStatus.FAILED : (statusByImageName[statusName] ?? GameRecordStatus.CLEARED);
    const rating = querySongDetails?.sheet.internalLevelValue
        ? calculateRating(
              achievement,
              querySongDetails.sheet.internalLevelValue,
              status === GameRecordStatus.ALL_PERFECT || status === GameRecordStatus.ALL_PERFECT_PLUS,
          )
        : undefined;

    return {
        id: block.querySelector<HTMLInputElement>('form input[name="idx"]')?.value ?? "",
        songTitle,
        songdifficulty,
        songLevel,
        songKind,
        songFullDetail: querySongDetails,

        achievement,
        dxScore: parseDxScore(scoreBlocks[1]?.textContent),
        scoreRank: scoreRankByImageName[scoreRankName] ?? GameRecordScoreRank.D,
        status,
        syncStatus: syncStatusByImageName[syncStatusName] ?? GameRecordSyncStatus.SOLO,
        syncStatusShort: syncStatusShortByImageName[syncStatusName] ?? GameRecordSyncStatusShort.SOLO,
        rating,
    };
}

async function fetchSongRecordsByDiff(diff: GameRecordSongDifficultyOrUtage) {
    const res = await apiHelperFetchDoc(songRecordsPath(diff));

    return [...res.document.querySelectorAll<HTMLElement>(".w_450.m_15.p_r.f_0")]
        .map((block) => parseSongRecordBlock(block, diff))
        .filter((record): record is GameRecordSong => record !== null);
}

export async function songRecords(
    options: SongRecordsOptions & { diff: GameRecordSongDifficultyOrUtage },
): Promise<GameRecordSong[]>;
export async function songRecords(options?: SongRecordsOptions): Promise<GetGameRecordSong>;
export async function songRecords(options: SongRecordsOptions = {}) {
    if (options.diff) {
        return fetchSongRecordsByDiff(options.diff);
    }

    const thresholdMs = options.thresholdMs ?? DEFAULT_FETCH_ALL_THRESHOLD_MS;
    const difficulties: GameRecordSongDifficultyOrUtage[] = allDifficulties;
    const result: Partial<Record<GameRecordSongDifficultyOrUtage, GameRecordSong[]>> = {};

    for (const [index, diff] of difficulties.entries()) {
        if (index > 0 && thresholdMs > 0) {
            await sleep(thresholdMs);
        }

        result[diff] = await fetchSongRecordsByDiff(diff);
    }

    return result as GetGameRecordSong;
}
