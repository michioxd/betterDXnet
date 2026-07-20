import { GameRecordSongDifficulty, GameRecordSongKind } from "../records";

export interface GetPlayerAlbum {
    songKind: GameRecordSongKind;
    songTitle: string;
    songdifficulty: GameRecordSongDifficulty;

    location: string;
    imageUrl: string;
    date: Date;
}
