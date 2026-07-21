import { apiHelperFetchDoc } from "../helper";
import {
    GameRecordLast50,
    GameRecordMode,
    GameRecordScoreRank,
    GameRecordSongDifficulty,
    GameRecordSongKind,
    GameRecordStatus,
    GameRecordSyncStatus,
    GameRecordSyncStatusShort,
} from "./types";

const LAST_50_PATH = "/maimai-mobile/record/";
const PLAYLOG_DETAIL_PATH = "https://maimaidx-eng.com/maimai-mobile/record/playlogDetail/";

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
    d: GameRecordScoreRank.D,
    c: GameRecordScoreRank.C,
    b: GameRecordScoreRank.B,
    bb: GameRecordScoreRank.BB,
    bbb: GameRecordScoreRank.BBB,
    a: GameRecordScoreRank.A,
    aa: GameRecordScoreRank.AA,
    aaa: GameRecordScoreRank.AAA,
    s: GameRecordScoreRank.S,
    splus: GameRecordScoreRank.S_P,
    ss: GameRecordScoreRank.SS,
    ssplus: GameRecordScoreRank.SS_P,
    sss: GameRecordScoreRank.SSS,
    sssplus: GameRecordScoreRank.SSS_P,
};

const statusByImageName: Record<string, GameRecordStatus> = {
    failed: GameRecordStatus.FAILED,
    clear: GameRecordStatus.CLEARED,
    fc_dummy: GameRecordStatus.CLEARED,
    fc: GameRecordStatus.FULL_COMBO,
    fcplus: GameRecordStatus.FULL_COMBO_PLUS,
    ap: GameRecordStatus.ALL_PERFECT,
    applus: GameRecordStatus.ALL_PERFECT_PLUS,
};

const syncStatusByImageName: Record<string, GameRecordSyncStatus> = {
    sync_dummy: GameRecordSyncStatus.SOLO,
    sync: GameRecordSyncStatus.SYNC_PLAY,
    fs: GameRecordSyncStatus.FULL_SYNC,
    fsplus: GameRecordSyncStatus.FULL_SYNC_PLUS,
    fsd: GameRecordSyncStatus.FULL_SYNC_DX,
    fsdplus: GameRecordSyncStatus.FULL_SYNC_DX_PLUS,
};

const syncStatusShortByImageName: Record<string, GameRecordSyncStatusShort> = {
    sync_dummy: GameRecordSyncStatusShort.SOLO,
    sync: GameRecordSyncStatusShort.SYNC_PLAY,
    fs: GameRecordSyncStatusShort.FULL_SYNC,
    fsplus: GameRecordSyncStatusShort.FULL_SYNC_PLUS,
    fsd: GameRecordSyncStatusShort.FULL_SYNC_DX,
    fsdplus: GameRecordSyncStatusShort.FULL_SYNC_DX_PLUS,
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
    return Number(normalizeText(value).replace(/,/g, "")) || 0;
}

function parsePlayDate(value: string) {
    const [, year, month, day, hour, minute] = value.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/) ?? [];

    if (!year || !month || !day || !hour || !minute) {
        return new Date(value);
    }

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 9, Number(minute)));
}

function parseSongTitle(block: HTMLElement) {
    const titleBlock = block.querySelector<HTMLElement>(".basic_block.m_5.m_t_17.m_r_60");

    if (!titleBlock) {
        return "";
    }

    const clone = titleBlock.cloneNode(true) as HTMLElement;
    clone.querySelector(".w_80")?.remove();

    return normalizeText(clone.textContent);
}

function parseDxScore(block: HTMLElement) {
    const [current = "0", max = "0"] = normalizeText(block.querySelector(".playlog_score_block .white")?.textContent)
        .split("/")
        .map((value) => value.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}

function parseLifeStatus(block: HTMLElement) {
    const [current = "0", max = "0"] = normalizeText(block.querySelector(".playlog_life_block")?.textContent)
        .split("/")
        .map((value) => value.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}

export function parsePlaylogBlock(block: HTMLElement): GameRecordLast50 {
    const detailForm = block.querySelector<HTMLFormElement>(`form[action="${PLAYLOG_DETAIL_PATH}"]`);
    const difficultyName = imageName(block.querySelector<HTMLImageElement>(".playlog_diff"));
    const songKindName = imageName(block.querySelector<HTMLImageElement>(".playlog_music_kind_icon"));
    const scoreRankName = imageName(block.querySelector<HTMLImageElement>(".playlog_scorerank"));
    const resultIcons = [...block.querySelectorAll<HTMLImageElement>(".playlog_result_innerblock > img.h_35.m_5.f_l")];
    const statusName = imageName(resultIcons[0]);
    const syncStatusName = imageName(resultIcons[1]);
    const subTitleText = normalizeText(block.querySelector(".sub_title")?.textContent);
    const dxStarName = imageName(block.querySelector<HTMLImageElement>(".playlog_deluxscore_star"));
    const achievement = parseNumber(block.querySelector(".playlog_achievement_txt")?.textContent?.replace("%", ""));

    const mode = block.querySelector('img[src*="/img/icon_perfectchallenge.png"]')
        ? "perfect_challenge"
        : block.querySelector('img[src*="/img/icon_kaleidxscope.png"]')
          ? "kaleidxscope"
          : "normal";

    return {
        id: detailForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ?? "",
        songTitle: parseSongTitle(block),
        songArtwork: block.querySelector<HTMLImageElement>(".music_img")?.getAttribute("src") ?? "",
        songdifficulty: difficultyByImageName[difficultyName] ?? GameRecordSongDifficulty.BASIC,
        songLevel: normalizeText(block.querySelector(".playlog_level_icon")?.textContent),
        songKind: songKindByImageName[songKindName] ?? GameRecordSongKind.STANDARD,
        achievement,
        newAchievement: block.querySelector("img.playlog_achievement_newrecord") !== null,
        dxScore: parseDxScore(block),
        dxStar: parseNumber(dxStarName.replace("dxstar_", "")),
        newDxScore: block.querySelector("img.playlog_deluxscore_newrecord") !== null,
        scoreRank: scoreRankByImageName[scoreRankName] ?? GameRecordScoreRank.D,
        status:
            achievement < 80 ? GameRecordStatus.FAILED : (statusByImageName[statusName] ?? GameRecordStatus.CLEARED),
        syncStatus: syncStatusByImageName[syncStatusName] ?? GameRecordSyncStatus.SOLO,
        syncStatusShort: syncStatusShortByImageName[syncStatusName] ?? GameRecordSyncStatusShort.SOLO,
        syncPlayGrade: imageName(block.querySelector<HTMLImageElement>(".playlog_matching_icon")),
        mode: mode as GameRecordMode,
        liveStatus: parseLifeStatus(block),
        trackNo: parseNumber(subTitleText.match(/TRACK\s+(\d+)/)?.[1]),
        playDate: parsePlayDate(subTitleText.match(/\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}/)?.[0] ?? ""),
    };
}

export async function last50(): Promise<GameRecordLast50[]> {
    const res = await apiHelperFetchDoc(LAST_50_PATH);

    return [...res.document.querySelectorAll<HTMLFormElement>(`form[action="${PLAYLOG_DETAIL_PATH}"]`)]
        .map((form) => form.closest<HTMLElement>(".p_10.t_l.f_0.v_b"))
        .filter((block): block is HTMLElement => block !== null)
        .map(parsePlaylogBlock);
}
