import { makeAutoObservable, runInAction } from "mobx";

import type { RootStore } from "../root";

export class AppStore {
    readonly root: RootStore;

    globalLoading = false;
    sidebarOpen = false;
    sidebarSectionsOpen: Record<string, boolean> = {};

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    get isAppLoading() {
        return this.globalLoading;
    }

    setGlobalLoading(loading: boolean) {
        runInAction(() => {
            this.globalLoading = loading;
        });
    }

    toggleGlobalLoading() {
        runInAction(() => {
            this.globalLoading = !this.globalLoading;
        });
    }

    setSidebarOpen(open: boolean) {
        runInAction(() => {
            this.sidebarOpen = open;
        });
    }

    setSidebarSectionsOpen(sectionsOpen: Record<string, boolean>) {
        runInAction(() => {
            this.sidebarSectionsOpen = sectionsOpen;
        });
    }

    ensureSidebarSectionsOpen(defaultSectionsOpen: Record<string, boolean>) {
        runInAction(() => {
            this.sidebarSectionsOpen = {
                ...defaultSectionsOpen,
                ...this.sidebarSectionsOpen,
            };
        });
    }

    toggleSidebarSection(sectionKey: string) {
        runInAction(() => {
            this.sidebarSectionsOpen = {
                ...this.sidebarSectionsOpen,
                [sectionKey]: !this.sidebarSectionsOpen[sectionKey],
            };
        });
    }
}
