import { apiRecords } from "@/api";
import {
    GameRecordSongDifficulty,
    type GameRecordLast50,
    type GameRecordPlayLogDetail,
    type GameRecordSong,
    type SongRecordDetail,
} from "@/api/records";
import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";

export class RecordsStore {
    readonly root: RootStore;

    last50: GameRecordLast50[] = [];
    last50Loaded = false;
    last50Loading = false;
    last50Error: Error | null = null;
    private last50RequestId = 0;
    playLogDetails: Record<string, GameRecordPlayLogDetail> = {};
    playLogDetailLoading: Record<string, boolean> = {};
    playLogDetailErrors: Record<string, Error | undefined> = {};
    private playLogDetailRequestIds: Record<string, number> = {};
    songRecords: Partial<Record<GameRecordSongDifficulty, GameRecordSong[]>> = {};
    songRecordsLoaded: Partial<Record<GameRecordSongDifficulty, boolean>> = {};
    songRecordsLoading = false;
    songRecordsError: Error | null = null;
    private songRecordsRequestId = 0;
    songRecordDetails: Record<string, SongRecordDetail> = {};
    songRecordDetailLoading: Record<string, boolean> = {};
    songRecordDetailErrors: Record<string, Error | undefined> = {};
    private songRecordDetailRequestIds: Record<string, number> = {};

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable<
            this,
            "last50RequestId" | "playLogDetailRequestIds" | "songRecordsRequestId" | "songRecordDetailRequestIds"
        >(this, {
            root: false,
            last50: observable.ref,
            last50RequestId: false,
            playLogDetails: observable.ref,
            playLogDetailLoading: observable.ref,
            playLogDetailErrors: observable.ref,
            playLogDetailRequestIds: false,
            songRecords: observable.ref,
            songRecordsLoaded: observable.ref,
            songRecordsRequestId: false,
            songRecordDetails: observable.ref,
            songRecordDetailLoading: observable.ref,
            songRecordDetailErrors: observable.ref,
            songRecordDetailRequestIds: false,
        });
    }

    async refreshLast50() {
        const requestId = ++this.last50RequestId;

        runInAction(() => {
            this.last50Loading = true;
            this.last50Error = null;
        });

        try {
            const records = await apiRecords.last50();

            if (requestId !== this.last50RequestId) return;

            runInAction(() => {
                this.last50 = records;
                this.last50Loaded = true;
            });
        } catch (error) {
            if (requestId !== this.last50RequestId) return;

            runInAction(() => {
                this.last50Error = error as Error;
            });
        } finally {
            if (requestId !== this.last50RequestId) return;

            runInAction(() => {
                this.last50Loading = false;
            });
        }
    }

    ensureLast50() {
        if (this.last50Loaded || this.last50Loading) return;

        return this.refreshLast50();
    }

    getPlayLogDetail(id: string) {
        return this.playLogDetails[id];
    }

    isPlayLogDetailLoading(id: string) {
        return this.playLogDetailLoading[id] ?? false;
    }

    getPlayLogDetailError(id: string) {
        return this.playLogDetailErrors[id] ?? null;
    }

    clearPlayLogDetails(ids?: string[]) {
        if (!ids) {
            this.playLogDetails = {};
            this.playLogDetailErrors = {};
            return;
        }

        this.playLogDetails = Object.fromEntries(
            Object.entries(this.playLogDetails).filter(([id]) => !ids.includes(id)),
        );
        this.playLogDetailErrors = Object.fromEntries(
            Object.entries(this.playLogDetailErrors).filter(([id]) => !ids.includes(id)),
        );
    }

    async refreshPlayLogDetail(id: string) {
        const requestId = (this.playLogDetailRequestIds[id] ?? 0) + 1;
        this.playLogDetailRequestIds[id] = requestId;

        runInAction(() => {
            this.playLogDetailLoading = {
                ...this.playLogDetailLoading,
                [id]: true,
            };
            this.playLogDetailErrors = {
                ...this.playLogDetailErrors,
                [id]: undefined,
            };
        });

        try {
            const detail = await apiRecords.playLogDetail(id);

            if (requestId !== this.playLogDetailRequestIds[id]) return;

            runInAction(() => {
                this.playLogDetails = {
                    ...this.playLogDetails,
                    [id]: detail,
                };
            });
        } catch (error) {
            if (requestId !== this.playLogDetailRequestIds[id]) return;

            runInAction(() => {
                this.playLogDetailErrors = {
                    ...this.playLogDetailErrors,
                    [id]: error as Error,
                };
            });
        } finally {
            if (requestId !== this.playLogDetailRequestIds[id]) return;

            runInAction(() => {
                this.playLogDetailLoading = {
                    ...this.playLogDetailLoading,
                    [id]: false,
                };
            });
        }
    }

    ensurePlayLogDetail(id: string) {
        if (this.playLogDetails[id] || this.playLogDetailLoading[id]) return;

        return this.refreshPlayLogDetail(id);
    }

    async refreshSongRecords(difficulties: GameRecordSongDifficulty[]) {
        const requestId = ++this.songRecordsRequestId;

        runInAction(() => {
            this.songRecordsLoading = true;
            this.songRecordsError = null;
        });

        try {
            const entries: [GameRecordSongDifficulty, GameRecordSong[]][] = [];

            for (const diff of difficulties) {
                entries.push([diff, await apiRecords.songRecords({ diff })]);
            }

            if (requestId !== this.songRecordsRequestId) return;

            runInAction(() => {
                this.songRecords = {
                    ...this.songRecords,
                    ...Object.fromEntries(entries),
                };
                this.songRecordsLoaded = {
                    ...this.songRecordsLoaded,
                    ...Object.fromEntries(entries.map(([diff]) => [diff, true])),
                };
            });
        } catch (error) {
            if (requestId !== this.songRecordsRequestId) return;

            runInAction(() => {
                this.songRecordsError = error as Error;
            });
        } finally {
            if (requestId !== this.songRecordsRequestId) return;

            runInAction(() => {
                this.songRecordsLoading = false;
            });
        }
    }

    ensureSongRecords(difficulties: GameRecordSongDifficulty[]) {
        if (this.songRecordsLoading) return;

        const unloaded = difficulties.filter((diff) => !this.songRecordsLoaded[diff]);

        if (unloaded.length === 0) return;

        return this.refreshSongRecords(unloaded);
    }

    getSongRecordDetail(id: string) {
        return this.songRecordDetails[id];
    }

    isSongRecordDetailLoading(id: string) {
        return this.songRecordDetailLoading[id] ?? false;
    }

    getSongRecordDetailError(id: string) {
        return this.songRecordDetailErrors[id] ?? null;
    }

    async refreshSongRecordDetail(id: string) {
        const requestId = (this.songRecordDetailRequestIds[id] ?? 0) + 1;
        this.songRecordDetailRequestIds[id] = requestId;

        runInAction(() => {
            this.songRecordDetailLoading = {
                ...this.songRecordDetailLoading,
                [id]: true,
            };
            this.songRecordDetailErrors = {
                ...this.songRecordDetailErrors,
                [id]: undefined,
            };
        });

        try {
            const detail = await apiRecords.songRecordDetail(id);

            if (requestId !== this.songRecordDetailRequestIds[id]) return;

            runInAction(() => {
                this.songRecordDetails = {
                    ...this.songRecordDetails,
                    [id]: detail,
                };
            });
        } catch (error) {
            if (requestId !== this.songRecordDetailRequestIds[id]) return;

            runInAction(() => {
                this.songRecordDetailErrors = {
                    ...this.songRecordDetailErrors,
                    [id]: error as Error,
                };
            });
        } finally {
            if (requestId !== this.songRecordDetailRequestIds[id]) return;

            runInAction(() => {
                this.songRecordDetailLoading = {
                    ...this.songRecordDetailLoading,
                    [id]: false,
                };
            });
        }
    }

    ensureSongRecordDetail(id: string) {
        if (this.songRecordDetails[id] || this.songRecordDetailLoading[id]) return;

        return this.refreshSongRecordDetail(id);
    }
}
