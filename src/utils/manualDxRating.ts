import type { GameRecordSong, GetGameRecordSong } from "@/api/records";
import { GameRecordSongDifficulty } from "@/api/records";
import { maimaiApi } from "@/db/maimaiDataApi";

export interface ManualDXRating {
    new: GameRecordSong[];
    old: GameRecordSong[];
}

const NEW_CHART_COUNT = 15;
const OLD_CHART_COUNT = 35;
const DELUXE_BASE_VERSION_INDEX = 13;
const DELUXE_BASE_NET_VERSION = 1;
const DELUXE_VERSION_STEP = 0.05;

const difficultyOrder = [
    GameRecordSongDifficulty.BASIC,
    GameRecordSongDifficulty.ADVANCED,
    GameRecordSongDifficulty.EXPERT,
    GameRecordSongDifficulty.MASTER,
    GameRecordSongDifficulty.REMASTER,
];

function parseNetVersion(version: string | undefined) {
    const parsed = Number(version);

    return Number.isFinite(parsed) ? parsed : DELUXE_BASE_NET_VERSION;
}

function getCurrentDatabaseVersions(netVersion: string | undefined) {
    const versions = maimaiApi.getVersions();
    const currentIndex = Math.round(
        DELUXE_BASE_VERSION_INDEX + (parseNetVersion(netVersion) - DELUXE_BASE_NET_VERSION) / DELUXE_VERSION_STEP,
    );

    return [versions[currentIndex]?.version, versions[currentIndex - 1]?.version].filter(
        (version): version is string => version !== undefined,
    );
}

function compareByRatingDesc(a: GameRecordSong, b: GameRecordSong) {
    return (b.rating ?? 0) - (a.rating ?? 0);
}

function flattenSongRecords(records: GetGameRecordSong) {
    return difficultyOrder
        .flatMap((difficulty) => records[difficulty] ?? [])
        .filter((record) => record.rating !== undefined);
}

function getChartVersion(record: GameRecordSong) {
    return record.songFullDetail?.sheet.version ?? record.songFullDetail?.song.version;
}

export function calculateManualDXRating(
    records: GetGameRecordSong,
    currentNetVersion: string | undefined,
): ManualDXRating {
    const currentVersions = getCurrentDatabaseVersions(currentNetVersion);
    const songs = flattenSongRecords(records);

    const newCharts = songs
        .filter((record) => currentVersions.includes(getChartVersion(record) ?? ""))
        .sort(compareByRatingDesc)
        .slice(0, NEW_CHART_COUNT);
    const oldCharts = songs
        .filter((record) => !currentVersions.includes(getChartVersion(record) ?? ""))
        .sort(compareByRatingDesc)
        .slice(0, OLD_CHART_COUNT);

    return {
        new: newCharts,
        old: oldCharts,
    };
}

export function sumManualDXRating(items: GameRecordSong[]) {
    return items.reduce((total, item) => total + (item.rating ?? 0), 0);
}
