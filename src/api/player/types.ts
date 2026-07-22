import { MaimaiSheetLookupResult } from "@/db/maimaiDataApi";
import { GameRecordSongDifficulty, GameRecordSongKind } from "../records";

export interface GetPlayerAlbum {
    songKind: GameRecordSongKind;
    songTitle: string;
    songdifficulty: GameRecordSongDifficulty;
    songFullDetail?: MaimaiSheetLookupResult;

    location: string;
    imageUrl: string;
    date: Date;
}
