import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";
import { apiMe, type ApiMe } from "@/api/me";
import { extensionApi } from "@/runtime";

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

    async getUserToken(): Promise<string | null> {
        const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
        const tokenCookie = cookies.find((cookie) => cookie.startsWith("_t="));

        if (tokenCookie) {
            return tokenCookie.split("=")[1];
        }

        if (typeof extensionApi !== "undefined" && extensionApi.cookies) {
            try {
                const cookie = await extensionApi.cookies.get({
                    url: "https://maimaidx-eng.com",
                    name: "_t",
                });
                return cookie ? cookie.value : null;
            } catch (e) {
                console.error("Failed to get cookie via extension API", e);
                return null;
            }
        }

        return null;
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
