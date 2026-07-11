import { makeAutoObservable, runInAction } from "mobx";

import type { RootStore } from "../root";
import { apiMe, type ApiMe } from "@/api/me";

export class MeStore {
    readonly root: RootStore;

    me: ApiMe | null = null;
    loading = false;
    error: Error | null = null;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    get isLogin() {
        return this.me !== null;
    }

    async refresh() {
        this.loading = true;

        try {
            const me = await apiMe();

            runInAction(() => {
                this.me = me;
            });
        } catch (error) {
            runInAction(() => {
                this.error = error as Error;
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }
}
