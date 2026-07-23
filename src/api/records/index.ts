import { last50 } from "./last50";
import { playLogDetail } from "./playLogDetail";
import { songRecords } from "./songRecords";

export { last50 } from "./last50";
export { playLogDetail } from "./playLogDetail";
export { songRecords } from "./songRecords";
export type {
    GameRecordLast50,
    GameRecordPlayLogDetail,
    GameRecordSong,
    GameRecordSongDifficultyOrUtage,
    GetGameRecordSong,
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
    songRecords,
};
