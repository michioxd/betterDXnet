import { last50 } from "./last50";
import { playLogDetail } from "./playLogDetail";

export { last50 } from "./last50";
export { playLogDetail } from "./playLogDetail";
export type { GameRecordLast50, GameRecordPlayLogDetail } from "./types";
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
};
