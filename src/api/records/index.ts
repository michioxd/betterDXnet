import { last50 } from "./last50";
import { playLogDetail } from "./playLogDetail";
import { songRecordDetail } from "./songRecordDetail";
import { songRecords } from "./songRecords";

export { last50 } from "./last50";
export { playLogDetail } from "./playLogDetail";
export { songRecordDetail } from "./songRecordDetail";
export { songRecords } from "./songRecords";
export type {
    GameRecordLast50,
    GameRecordPlayLogDetail,
    GameRecordSong,
    GameRecordSongDifficultyOrUtage,
    GetGameRecordSong,
    SongRecordDetail,
} from "./types";
export {
    difficultyColor,
    GameRecordScoreRank,
    GameRecordSongDifficulty,
    GameRecordSongKind,
    GameRecordStatus,
    GameRecordSyncStatus,
} from "./types";

export const apiRecords = {
    last50,
    playLogDetail,
    songRecordDetail,
    songRecords,
};
