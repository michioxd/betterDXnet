import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";
import { apiMe, type ApiMe } from "@/api/me";

export class MeStore {
    readonly root: RootStore;

    me: ApiMe | null = null;
    loading = false;
    error: Error | null = null;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this, {
            root: false,
            me: observable.ref,
        });
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
            console.error("Failed to refresh me:", error);
            runInAction(() => {
                this.error = error as Error;
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    getUserToken(): string | null {
        const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
        const tokenCookie = cookies.find((cookie) => cookie.startsWith("_t="));

        if (!tokenCookie) {
            return null;
        }

        return tokenCookie.split("=")[1];
    }

    fullyReload() {
        runInAction(() => {
            this.me = null;
            this.loading = false;
            this.error = null;
        });

        return this.refresh();
    }
}
