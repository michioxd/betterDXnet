import { MaimaiSheetLookupResult } from "@/db/maimaiDataApi";
import {
    GameRecordScoreRank,
    GameRecordSongBase,
    GameRecordSongDifficulty,
    GameRecordSongResultBase,
    GameRecordSongKind,
} from "../records";

export interface GetPlayerAlbum extends GameRecordSongBase {
    songKind: GameRecordSongKind;
    songTitle: string;
    songdifficulty: GameRecordSongDifficulty;
    songFullDetail?: MaimaiSheetLookupResult;

    location: string;
    imageUrl: string;
    date: Date;
}

export interface GetPlayerDXRatingItem extends GameRecordSongBase, GameRecordSongResultBase {
    id: string;
    scoreRank: GameRecordScoreRank;
    rating?: number; // rating, only available when songFullDetail is available, otherwise undefined
}

export interface GetPlayerDXRating {
    new: GetPlayerDXRatingItem[];
    old: GetPlayerDXRatingItem[];
    selectionNew: GetPlayerDXRatingItem[];
    selectionOld: GetPlayerDXRatingItem[];
}
