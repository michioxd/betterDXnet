import { makeAutoObservable, runInAction } from "mobx";

import type { RootStore } from "../root";

const SIDEBAR_SECTIONS_OPEN_STORAGE_KEY = "betterDXnet.sidebarSectionsOpen";

function loadSidebarSectionsOpen() {
    try {
        const value = localStorage.getItem(SIDEBAR_SECTIONS_OPEN_STORAGE_KEY);
        if (!value) return {};

        const sectionsOpen = JSON.parse(value);
        if (!sectionsOpen || typeof sectionsOpen !== "object" || Array.isArray(sectionsOpen)) return {};

        return sectionsOpen as Record<string, boolean>;
    } catch {
        return {};
    }
}

function saveSidebarSectionsOpen(sectionsOpen: Record<string, boolean>) {
    localStorage.setItem(SIDEBAR_SECTIONS_OPEN_STORAGE_KEY, JSON.stringify(sectionsOpen));
}

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
            saveSidebarSectionsOpen(this.sidebarSectionsOpen);
        });
    }

    ensureSidebarSectionsOpen(defaultSectionsOpen: Record<string, boolean>) {
        runInAction(() => {
            this.sidebarSectionsOpen = {
                ...defaultSectionsOpen,
                ...loadSidebarSectionsOpen(),
                ...this.sidebarSectionsOpen,
            };
            saveSidebarSectionsOpen(this.sidebarSectionsOpen);
        });
    }

    toggleSidebarSection(sectionKey: string) {
        runInAction(() => {
            this.sidebarSectionsOpen = {
                ...this.sidebarSectionsOpen,
                [sectionKey]: !this.sidebarSectionsOpen[sectionKey],
            };
            saveSidebarSectionsOpen(this.sidebarSectionsOpen);
        });
    }
}
