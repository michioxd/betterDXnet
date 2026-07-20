import { apiRecords } from "@/api";
import type { GameRecordLast50, GameRecordPlayLogDetail } from "@/api/records";
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

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable<this, "last50RequestId" | "playLogDetailRequestIds">(this, {
            root: false,
            last50: observable.ref,
            last50RequestId: false,
            playLogDetails: observable.ref,
            playLogDetailLoading: observable.ref,
            playLogDetailErrors: observable.ref,
            playLogDetailRequestIds: false,
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
}
