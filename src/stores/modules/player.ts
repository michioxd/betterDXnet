import { apiPlayer } from "@/api";
import type { GetPlayerAlbum } from "@/api/player";
import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";

export class PlayerStore {
    readonly root: RootStore;

    album: GetPlayerAlbum[] = [];
    albumLoaded = false;
    albumLoading = false;
    albumError: Error | null = null;
    private albumRequestId = 0;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable<this, "albumRequestId">(this, {
            root: false,
            album: observable.ref,
            albumRequestId: false,
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
}
