import { makeAutoObservable, observable, runInAction } from "mobx";

import type { RootStore } from "../root";

const SIDEBAR_SECTIONS_OPEN_STORAGE_KEY = "bdn.sidebar";

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
        makeAutoObservable(this, {
            root: false,
            sidebarSectionsOpen: observable.ref,
        });
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
            const nextSidebarSectionsOpen = { ...sectionsOpen };

            this.sidebarSectionsOpen = nextSidebarSectionsOpen;
            saveSidebarSectionsOpen(nextSidebarSectionsOpen);
        });
    }

    ensureSidebarSectionsOpen(defaultSectionsOpen: Record<string, boolean>) {
        runInAction(() => {
            const nextSidebarSectionsOpen = {
                ...defaultSectionsOpen,
                ...loadSidebarSectionsOpen(),
                ...this.sidebarSectionsOpen,
            };

            this.sidebarSectionsOpen = nextSidebarSectionsOpen;
            saveSidebarSectionsOpen(nextSidebarSectionsOpen);
        });
    }

    toggleSidebarSection(sectionKey: string) {
        runInAction(() => {
            const nextSidebarSectionsOpen = {
                ...this.sidebarSectionsOpen,
                [sectionKey]: !this.sidebarSectionsOpen[sectionKey],
            };

            this.sidebarSectionsOpen = nextSidebarSectionsOpen;
            saveSidebarSectionsOpen(nextSidebarSectionsOpen);
        });
    }
}
