import { maimaiApi } from "@/db/maimaiDataApi";
import { calculateRating } from "@/utils/rating";
import { apiHelperFetchDoc } from "../helper";
import {
    GameRecordScoreRank,
    GameRecordSongDifficulty,
    GameRecordSongKind,
    GameRecordStatus,
    GameRecordSyncStatus,
    GameRecordSyncStatusShort,
    SongRecordDetail,
} from "./types";

const SONG_RECORD_DETAIL_PATH = "/maimai-mobile/record/musicDetail/";

const difficultyById: Record<string, GameRecordSongDifficulty> = {
    basic: GameRecordSongDifficulty.BASIC,
    advanced: GameRecordSongDifficulty.ADVANCED,
    expert: GameRecordSongDifficulty.EXPERT,
    master: GameRecordSongDifficulty.MASTER,
    remaster: GameRecordSongDifficulty.REMASTER,
    utage: GameRecordSongDifficulty.UTAGE,
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

function parseDate(value: string) {
    const [, year, month, day, hour, minute] = value.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/) ?? [];

    if (!year || !month || !day || !hour || !minute) {
        return new Date(value);
    }

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 9, Number(minute)));
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

function parseSongTitle(document: Document) {
    return normalizeText(document.querySelector(".basic_block.m_15.m_t_0.p_5.t_l .m_5.f_15.break")?.textContent);
}

function parseSongKind(document: Document) {
    const name = imageName(
        document.querySelector<HTMLImageElement>(".basic_block.m_15.m_t_0.p_5.t_l img[src*='/img/music_']"),
    );

    return songKindByImageName[name] ?? GameRecordSongKind.STANDARD;
}

function parseDetailBlock(block: HTMLElement, songTitle: string, songKind: GameRecordSongKind) {
    const difficulty = difficultyById[block.id];
    const scoreBlocks = [...block.querySelectorAll<HTMLElement>(".music_score_block")];
    const achievement = parseNumber(scoreBlocks[0]?.textContent);

    if (!difficulty || achievement <= 0) {
        return null;
    }

    const resultIconNames = [...block.querySelectorAll<HTMLImageElement>('img[src*="/img/music_icon_"]')].map(
        imageName,
    );
    const scoreRankName = resultIconNames.find((name) => name in scoreRankByImageName) ?? "";
    const statusName = resultIconNames.find((name) => name in statusByImageName) ?? "";
    const syncStatusName = resultIconNames.find((name) => name in syncStatusByImageName) ?? "";
    const rows = [...block.querySelectorAll<HTMLTableRowElement>(".black_block tr")];
    const lastPlayedDateText = normalizeText(rows[0]?.querySelectorAll("td")[1]?.textContent);
    const playCountText = normalizeText(rows[1]?.querySelectorAll("td")[1]?.textContent);
    const level = normalizeText(block.querySelector(".music_lv_back")?.textContent);
    const status =
        achievement < 80 ? GameRecordStatus.FAILED : (statusByImageName[statusName] ?? GameRecordStatus.CLEARED);
    const sheetDetail = maimaiApi.getSheet({
        title: songTitle,
        level,
        type: songKind,
    })?.sheet;
    const rating =
        difficulty === GameRecordSongDifficulty.UTAGE
            ? undefined
            : sheetDetail?.internalLevelValue
              ? calculateRating(
                    achievement,
                    sheetDetail.internalLevelValue,
                    status === GameRecordStatus.ALL_PERFECT || status === GameRecordStatus.ALL_PERFECT_PLUS,
                )
              : undefined;

    return {
        difficulty,
        level,
        achievement,
        dxScore: parseDxScore(scoreBlocks[1]?.textContent),
        dxStar: parseNumber(
            resultIconNames
                .find((name) => name.startsWith("music_icon_dxstar_detail_"))
                ?.replace("music_icon_dxstar_detail_", ""),
        ),
        scoreRank: scoreRankByImageName[scoreRankName] ?? GameRecordScoreRank.D,
        status,
        syncStatus: syncStatusByImageName[syncStatusName] ?? GameRecordSyncStatus.SOLO,
        syncStatusShort: syncStatusShortByImageName[syncStatusName] ?? GameRecordSyncStatusShort.SOLO,
        lastPlayedDate: parseDate(lastPlayedDateText),
        playCount: parseNumber(playCountText),
        sheetDetail,
        rating,
    };
}

export async function songRecordDetail(id: string): Promise<SongRecordDetail> {
    const res = await apiHelperFetchDoc(`${SONG_RECORD_DETAIL_PATH}?idx=${encodeURIComponent(id)}`);
    const songTitle = parseSongTitle(res.document);
    const songKind = parseSongKind(res.document);
    const parsedLevels = [
        ...res.document.querySelectorAll<HTMLElement>(
            "[id].music_basic_score_back, [id].music_advanced_score_back, [id].music_expert_score_back, [id].music_master_score_back, [id].music_remaster_score_back, [id].music_utage_score_back",
        ),
    ]
        .map((block) => parseDetailBlock(block, songTitle, songKind))
        .filter((level): level is NonNullable<ReturnType<typeof parseDetailBlock>> => level !== null);
    const firstLevel = parsedLevels[0];
    const songLevel = firstLevel?.level ?? "";
    const songdifficulty = firstLevel?.difficulty ?? GameRecordSongDifficulty.BASIC;
    const songFullDetail = maimaiApi.getSheet({
        title: songTitle,
        level: songLevel,
        type: songKind,
    });

    return {
        id,
        songTitle,
        songdifficulty,
        songLevel,
        songKind,
        songFullDetail,
        levels: Object.fromEntries(
            parsedLevels.map(({ difficulty, level: _level, ...detail }) => [difficulty, detail]),
        ) as SongRecordDetail["levels"],
    };
}
