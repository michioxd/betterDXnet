import { dataSource, type MaimaiData, type MaimaiSheet, type MaimaiSong } from "./maimaiDataTypes";

export type MaimaiSheetLookupInput = {
    title: string;
    level: string;
    type: string;
};

export type MaimaiSheetDifficultyLookupInput = {
    title: string;
    difficulty: string;
    type: string;
};

export type MaimaiSheetLookupResult = {
    song: MaimaiSong;
    sheet: MaimaiSheet;
};

type MaimaiDataCache = {
    data: MaimaiData;
    cachedAt: number;
};

export type MaimaiDataCacheInfo = {
    fetchedAt?: number;
    updateTime?: string;
};

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DB_NAME = "betterDXnet.maimaiData";
const DB_VERSION = 1;
const STORE_NAME = "cache";
const CACHE_KEY = "maimaiData";
const DATA_URL_STORAGE_KEY = "betterDXnet.maimaiData.url";

/**
 * Singleton API for loading, caching, indexing, and querying maimai song data.
 *
 * Usage:
 *
 * ```ts
 * import { maimaiApi } from "@/db/maimaiDataApi";
 *
 * await maimaiApi.init();
 *
 * const song = maimaiApi.getSong("1234");
 * const songByTitle = maimaiApi.getSongByTitle("系ぎて");
 * const chart = maimaiApi.getSheet({
 *     title: "系ぎて",
 *     level: "14+",
 *     type: "dx",
 * });
 * const expertChart = maimaiApi.getSheetByDifficulty({
 *     title: "系ぎて",
 *     difficulty: "expert",
 *     type: "dx",
 * });
 * const songs = maimaiApi.getSongs();
 *
 * await maimaiApi.reload();
 * ```
 *
 * `init()` loads data from IndexedDB when the cache is fresh, otherwise it fetches
 * the remote JSON and replaces the cache. Raw data is cached for 24 hours.
 * Indexes are built in memory only and are never persisted.
 *
 * Lookup methods (`getSong`, `getSongByTitle`, `getSheet`) are O(1). Call
 * `init()` before querying unless startup already initialized `maimaiApi`.
 */
export class MaimaiDataAPI {
    private static instance?: MaimaiDataAPI;

    private initPromise?: Promise<void>;
    private data?: MaimaiData;
    private fetchedAt?: number;
    private bySongId = new Map<string, MaimaiSong>();
    private byTitle = new Map<string, MaimaiSong>();
    private byTitleLevelType = new Map<string, MaimaiSheetLookupResult>();
    private byTitleDifficultyType = new Map<string, MaimaiSheetLookupResult>();

    private constructor() {}

    /**
     * Returns the shared `MaimaiDataAPI` instance.
     *
     * Use the exported `maimaiApi` singleton instead of calling this directly in
     * normal application code.
     */
    static getInstance() {
        if (!MaimaiDataAPI.instance) {
            MaimaiDataAPI.instance = new MaimaiDataAPI();
        }

        return MaimaiDataAPI.instance;
    }

    /**
     * Initializes maimai data once.
     *
     * Loads fresh cache from IndexedDB when available, otherwise downloads the
     * remote JSON, stores it in IndexedDB, and builds all in-memory indexes.
     * Subsequent calls return the same initialization promise.
     */
    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = this.initialize();

        return this.initPromise;
    }

    /**
     * Gets a song by its song ID.
     *
     * @param songId Song ID from maimai data.
     * @returns The matching song, or `undefined` if not found or not initialized.
     */
    getSong(songId: string) {
        return this.bySongId.get(songId);
    }

    /**
     * Gets a song by its exact title.
     *
     * @param title Exact song title.
     * @returns The matching song, or `undefined` if not found or not initialized.
     */
    getSongByTitle(title: string) {
        return this.byTitle.get(title);
    }

    /**
     * Gets a sheet by exact title, level, and type.
     *
     * The lookup key is built as `title + "\\0" + level + "\\0" + type`.
     *
     * @param input Exact sheet lookup fields.
     * @returns The matching song and sheet references, or `undefined` if not found.
     */
    getSheet(input: MaimaiSheetLookupInput) {
        return this.byTitleLevelType.get(this.buildKey(input.title, input.level, input.type));
    }

    /**
     * Gets a sheet by exact title, difficulty name, and type.
     *
     * Use this when the source only has a difficulty name such as `expert`,
     * `master`, or `remaster` instead of a level value like `13+`.
     *
     * @param input Exact sheet lookup fields.
     * @returns The matching song and sheet references, or `undefined` if not found.
     */
    getSheetByDifficulty(input: MaimaiSheetDifficultyLookupInput) {
        return this.byTitleDifficultyType.get(this.buildKey(input.title, input.difficulty, input.type));
    }

    /**
     * Gets all loaded songs.
     *
     * @returns The raw `songs` array from current data, or an empty array before initialization.
     */
    getSongs() {
        return this.data?.songs ?? [];
    }

    /**
     * Gets the current maimai data cache metadata.
     *
     * `fetchedAt` is the timestamp when betterDXnet last fetched and cached the
     * JSON. `updateTime` is the upstream database update time from the JSON.
     *
     * @returns Current cache metadata from memory.
     */
    getCacheInfo(): MaimaiDataCacheInfo {
        return {
            fetchedAt: this.fetchedAt,
            updateTime: this.data?.updateTime,
        };
    }

    /**
     * Gets the default maimai data JSON URL from bundled configuration.
     *
     * @returns Default remote data URL.
     */
    getDefaultDataUrl() {
        return new URL(dataSource.dataPath, `${dataSource.baseUrl}/`).toString();
    }

    /**
     * Gets the currently configured maimai data JSON URL.
     *
     * Returns the custom URL saved in local storage when present, otherwise the
     * bundled default URL.
     *
     * @returns Current remote data URL used by `init()` and `reload()`.
     */
    getDataUrl() {
        return localStorage.getItem(DATA_URL_STORAGE_KEY) || this.getDefaultDataUrl();
    }

    /**
     * Saves a custom maimai data JSON URL.
     *
     * Call `reload()` after changing this value to fetch and cache data from the
     * new source immediately.
     *
     * @param url Absolute URL to a maimai data JSON file.
     */
    setDataUrl(url: string) {
        localStorage.setItem(DATA_URL_STORAGE_KEY, new URL(url).toString());
    }

    /**
     * Removes the custom maimai data JSON URL and restores the bundled default.
     */
    resetDataUrl() {
        localStorage.removeItem(DATA_URL_STORAGE_KEY);
    }

    /**
     * Forces a full data reload from the remote source.
     *
     * Ignores IndexedDB cache, downloads latest data, replaces the cache, then
     * rebuilds every in-memory index from the new raw data.
     */
    async reload() {
        const data = await this.fetchRemoteData();
        const cachedAt = Date.now();

        await this.saveCache({ data, cachedAt });
        this.setData(data, cachedAt);
        this.initPromise = Promise.resolve();
    }

    /**
     * Performs the actual one-time initialization flow used by `init()`.
     *
     * Chooses fresh cache when available; otherwise refreshes the cache from the
     * network. Always builds indexes after data is selected.
     */
    private async initialize() {
        const cache = await this.loadCache();

        if (cache && Date.now() - cache.cachedAt < CACHE_MAX_AGE_MS) {
            this.setData(cache.data, cache.cachedAt);
            return;
        }

        await this.refreshCache();
    }

    /**
     * Downloads remote data and saves it to IndexedDB.
     *
     * @returns The downloaded maimai data.
     */
    private async refreshCache() {
        const data = await this.fetchRemoteData();
        const cachedAt = Date.now();

        await this.saveCache({ data, cachedAt });
        this.setData(data, cachedAt);

        return data;
    }

    /**
     * Fetches the remote maimai JSON data source.
     *
     * @returns Parsed maimai data.
     * @throws When the network request returns a non-OK response.
     */
    private async fetchRemoteData() {
        const response = await fetch(this.remoteDataUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch maimai data: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as MaimaiData;
    }

    /**
     * Loads the raw cached maimai data from IndexedDB.
     *
     * Only `{ data, cachedAt }` is read. In-memory indexes are never loaded from
     * IndexedDB.
     *
     * @returns Cached data, or `undefined` when no cache exists.
     */
    private async loadCache() {
        const db = await this.openDatabase();

        return new Promise<MaimaiDataCache | undefined>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(CACHE_KEY);

            request.onsuccess = () => resolve(request.result as MaimaiDataCache | undefined);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => db.close();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Saves raw maimai data to IndexedDB.
     *
     * Only `{ data, cachedAt }` is persisted. Indexes are intentionally excluded
     * and rebuilt in memory after loading.
     *
     * @param cache Raw cache payload to persist.
     */
    private async saveCache(cache: MaimaiDataCache) {
        const db = await this.openDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");

            transaction.objectStore(STORE_NAME).put(cache, CACHE_KEY);
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    /**
     * Opens the IndexedDB database used by this API.
     *
     * Creates the cache object store on first use or database upgrade.
     *
     * @returns An open IndexedDB database connection. Callers close it after use.
     */
    private openDatabase() {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                request.result.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Replaces the current raw data and rebuilds all in-memory indexes.
     *
     * @param data Raw maimai data to use as the current data source.
     */
    private setData(data: MaimaiData, fetchedAt?: number) {
        this.data = data;
        this.fetchedAt = fetchedAt;
        this.buildIndexes(data);
    }

    /**
     * Builds all O(1) lookup indexes from raw maimai data.
     *
     * Index values store references to existing `Song` and `Sheet` objects. This
     * method does not clone songs or sheets.
     *
     * @param data Raw maimai data to index.
     */
    private buildIndexes(data: MaimaiData) {
        const bySongId = new Map<string, MaimaiSong>();
        const byTitle = new Map<string, MaimaiSong>();
        const byTitleLevelType = new Map<string, MaimaiSheetLookupResult>();
        const byTitleDifficultyType = new Map<string, MaimaiSheetLookupResult>();

        for (const song of data.songs) {
            if (song.songId !== null) {
                bySongId.set(song.songId, song);
            }

            if (song.title) {
                byTitle.set(song.title, song);
            }

            for (const sheet of song.sheets) {
                if (!song.title || !sheet.type) continue;

                if (sheet.level) {
                    byTitleLevelType.set(this.buildKey(song.title, sheet.level, sheet.type), {
                        song,
                        sheet,
                    });
                }

                if (sheet.difficulty) {
                    byTitleDifficultyType.set(this.buildKey(song.title, sheet.difficulty, sheet.type), {
                        song,
                        sheet,
                    });
                }
            }
        }

        this.bySongId = bySongId;
        this.byTitle = byTitle;
        this.byTitleLevelType = byTitleLevelType;
        this.byTitleDifficultyType = byTitleDifficultyType;
    }

    /**
     * Builds the compound key for sheet lookup.
     *
     * @param title Exact song title.
     * @param level Exact sheet level, for example `14+`.
     * @param type Exact chart type, for example `dx` or `std`.
     * @returns Compound map key in `title\\0level\\0type` format.
     */
    private buildKey(title: string, level: string, type: string) {
        return `${title}\0${level}\0${type}`;
    }

    /**
     * Fully resolved remote JSON URL built from `dataSource`.
     */
    private get remoteDataUrl() {
        return this.getDataUrl();
    }
}

export const maimaiApi = MaimaiDataAPI.getInstance();

export const getSongArtworkUrl = (song: MaimaiSong) => {
    if (!song.imageName) {
        return "";
    }

    return new URL(`img/cover/${song.imageName}`, `${dataSource.baseUrl}/`).toString();
};
