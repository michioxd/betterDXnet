// https://github.com/zetaraku/arcade-songs

export type Sheet = Omit<Song, "sheets"> & {
    type?: string;
    difficulty?: string;

    level?: string;
    levelValue?: number;

    internalLevel?: string;
    internalLevelValue?: number;

    noteDesigner?: string;
    noteCounts?: Record<string, number | null>;

    regions?: Record<string, boolean>;
    regionOverrides?: Record<string, Sheet>;

    isSpecial?: boolean;
};

export type Song = {
    songId: string | null;

    category?: string;
    title?: string;
    artist?: string;
    bpm?: number;

    imageName?: string;

    version?: string;
    releaseDate?: string;

    isNew?: boolean;
    isLocked?: boolean;

    comment?: string;

    sheets: Sheet[];
};

export type Data = {
    songs: Song[];

    categories: {
        category: string;
    }[];

    versions: {
        version: string;
        abbr?: string;
        releaseDate?: string;
    }[];

    types: {
        type: string;
        name: string;
        abbr?: string;
        iconUrl?: string;
        iconHeight?: number;
    }[];
    difficulties: {
        difficulty: string;
        name: string;
        color?: string;
        iconUrl?: string;
        iconHeight?: number;
    }[];

    regions: {
        region: string;
        name: string;
    }[];

    updateTime: string;
};
