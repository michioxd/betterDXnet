import LocaleEng from "./resources/en/index";
import LocaleVie from "./resources/vi/index";

export type LocaleResourcesType = {
    [key: string]: object;
};

export const LocalesResources = {
    en: LocaleEng,
    vi: LocaleVie,
};

export const knownLocales: Record<
    string,
    {
        name: string;
        code: string;
        code4: string;
        code4under: string;
        authors: {
            name: string;
            url: string;
        }[];
    }
> = {
    "en-US": {
        name: "English",
        code: "en",
        code4: "en-US",
        code4under: "en_US",
        authors: [
            {
                name: "michioxd",
                url: "https://github.com/michioxd",
            },
        ],
    },
    "vi-VN": {
        name: "Tiếng Việt",
        code: "vi",
        code4: "vi-VN",
        code4under: "vi_VN",
        authors: [
            {
                name: "michioxd",
                url: "https://github.com/michioxd",
            },
        ],
    },
};
