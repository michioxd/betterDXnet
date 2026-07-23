import { apiPlayer, apiRecords } from "@/api";
import type { GetPlayerAlbum, GetPlayerDXRating } from "@/api/player";
import type { GetGameRecordSong } from "@/api/records";
import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";

export class PlayerStore {
    readonly root: RootStore;

    album: GetPlayerAlbum[] = [];
    albumLoaded = false;
    albumLoading = false;
    albumError: Error | null = null;
    private albumRequestId = 0;
    dxrating: GetPlayerDXRating = {
        new: [],
        old: [],
        selectionNew: [],
        selectionOld: [],
    };
    dxratingLoaded = false;
    dxratingLoading = false;
    dxratingError: Error | null = null;
    private dxratingRequestId = 0;
    manualDxratingRecords: GetGameRecordSong = {
        basic: [],
        advanced: [],
        expert: [],
        master: [],
        remaster: [],
    };
    manualDxratingLoaded = false;
    manualDxratingLoading = false;
    manualDxratingError: Error | null = null;
    private manualDxratingRequestId = 0;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable<this, "albumRequestId" | "dxratingRequestId" | "manualDxratingRequestId">(this, {
            root: false,
            album: observable.ref,
            albumRequestId: false,
            dxrating: observable.ref,
            dxratingRequestId: false,
            manualDxratingRecords: observable.ref,
            manualDxratingRequestId: false,
        });
    }

    async refreshAlbum() {
        const requestId = ++this.albumRequestId;

        runInAction(() => {
            this.albumLoading = true;
            this.albumError = null;
        });

        try {
            const album = await apiPlayer.album();

            if (requestId !== this.albumRequestId) return;

            runInAction(() => {
                this.album = album;
                this.albumLoaded = true;
            });
        } catch (error) {
            if (requestId !== this.albumRequestId) return;

            runInAction(() => {
                this.albumError = error as Error;
            });
        } finally {
            if (requestId !== this.albumRequestId) return;

            runInAction(() => {
                this.albumLoading = false;
            });
        }
    }

    ensureAlbum() {
        if (this.albumLoaded || this.albumLoading) return;

        return this.refreshAlbum();
    }

    async refreshDxrating() {
        const requestId = ++this.dxratingRequestId;

        runInAction(() => {
            this.dxratingLoading = true;
            this.dxratingError = null;
        });

        try {
            const dxrating = await apiPlayer.dxrating();

            if (requestId !== this.dxratingRequestId) return;

            runInAction(() => {
                this.dxrating = dxrating;
                this.dxratingLoaded = true;
            });
        } catch (error) {
            if (requestId !== this.dxratingRequestId) return;

            runInAction(() => {
                this.dxratingError = error as Error;
            });
        } finally {
            if (requestId !== this.dxratingRequestId) return;

            runInAction(() => {
                this.dxratingLoading = false;
            });
        }
    }

    ensureDxrating() {
        if (this.dxratingLoaded || this.dxratingLoading) return;

        return this.refreshDxrating();
    }

    async refreshManualDxrating() {
        const requestId = ++this.manualDxratingRequestId;

        runInAction(() => {
            this.manualDxratingLoading = true;
            this.manualDxratingError = null;
        });

        try {
            const records = await apiRecords.songRecords({ fetchAll: true });

            if (requestId !== this.manualDxratingRequestId) return;

            runInAction(() => {
                this.manualDxratingRecords = records;
                this.manualDxratingLoaded = true;
            });
        } catch (error) {
            if (requestId !== this.manualDxratingRequestId) return;

            runInAction(() => {
                this.manualDxratingError = error as Error;
            });
        } finally {
            if (requestId !== this.manualDxratingRequestId) return;

            runInAction(() => {
                this.manualDxratingLoading = false;
            });
        }
    }

    ensureManualDxrating() {
        if (this.manualDxratingLoaded || this.manualDxratingLoading) return;

        return this.refreshManualDxrating();
    }
}
