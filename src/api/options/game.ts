import { apiHelperFetchDoc } from "../helper";

export type GameOptionName =
    | "optionKind"
    | "noteSpeed"
    | "touchSpeed"
    | "slideSpeed"
    | "trackSkip"
    | "mirrorMode"
    | "starRotate"
    | "adjustTiming"
    | "judgeTiming"
    | "brightness"
    | "touchEffect"
    | "dispCenter"
    | "outFrameType"
    | "dispJudge"
    | "dispJudgePos"
    | "dispJudgeTouchPos"
    | "dispChain"
    | "submonitorAchieve"
    | "dispRate"
    | "submonitorAppeal"
    | "tapDesign"
    | "holdDesign"
    | "slideDesign"
    | "starType"
    | "outlineDesign"
    | "ansVolume"
    | "tapSe"
    | "criticalSe"
    | "tapHoldVolume"
    | "breakSe"
    | "breakVolume"
    | "exSe"
    | "exVolume"
    | "slideSe"
    | "slideVolume"
    | "breakSlideVolume"
    | "touchVolume"
    | "touchHoldVolume"
    | "damageSeVolume";

export type GameOptionValues = Partial<Record<GameOptionName, string>>;

export type GameOptionSelectOption = {
    value: string;
    label: string;
};

export type GameOptionItem = {
    name: GameOptionName;
    label: string;
    description: string;
    value: string;
    options: GameOptionSelectOption[];
};

export type GameOptionSection = {
    title: string;
    options: GameOptionItem[];
};

export type CurrentGameOptionsResponse = {
    token: string;
    values: GameOptionValues;
    sections: GameOptionSection[];
};

const GAME_OPTION_PATH = "/maimai-mobile/home/userOption/updateUserOption/";
const GAME_OPTION_UPDATE_PATH = "/maimai-mobile/home/userOption/updateUserOption/update/";

const sectionTitleByImageName: Record<string, string> = {
    title_option_speed: "Speed",
    title_option_game: "Game",
    title_option_disp: "Display",
    title_option_design: "Design",
    title_option_sound: "Sound",
};

function normalizeText(value: string | null | undefined) {
    return value?.replace(/\s+/g, " ").trim() ?? "";
}

function getSectionTitle(block: HTMLElement) {
    const titleImage = block.querySelector<HTMLImageElement>('img[src*="/img/title_option_"]');
    const titleImageSource = titleImage?.getAttribute("src") ?? "";
    const titleImageName =
        titleImageSource
            .split("/")
            .pop()
            ?.replace(/\.png$/, "") ?? "";

    return sectionTitleByImageName[titleImageName] ?? "Simple";
}

function parseGameOptionItem(table: HTMLTableElement): GameOptionItem | null {
    const select = table.querySelector<HTMLSelectElement>("select.option_select[name]");

    if (!select) {
        return null;
    }

    return {
        name: select.name as GameOptionName,
        label: normalizeText(table.querySelector("tr:first-child td:first-child")?.textContent),
        description: normalizeText(table.querySelector('td[colspan="2"]')?.textContent),
        value: select.value,
        options: [...select.options].map((option) => ({
            value: option.value,
            label: normalizeText(option.textContent),
        })),
    };
}

function createGameOptionBody(values: GameOptionValues, token: string) {
    const body = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
            body.set(key, value);
        }
    });
    body.set("token", token);

    return body;
}

export async function currentGameOptions(): Promise<CurrentGameOptionsResponse> {
    const res = await apiHelperFetchDoc(GAME_OPTION_PATH);
    const form = res.document.querySelector<HTMLFormElement>(`form[action$="${GAME_OPTION_UPDATE_PATH}"]`);

    if (!form) {
        throw new Error("Game option form not found");
    }

    const token = form.querySelector<HTMLInputElement>('input[name="token"]')?.value ?? "";
    const sections = [...form.querySelectorAll<HTMLElement>(".see_through_block")]
        .map((block) => ({
            title: getSectionTitle(block),
            options: [...block.querySelectorAll<HTMLTableElement>("table")]
                .map(parseGameOptionItem)
                .filter((option): option is GameOptionItem => option !== null),
        }))
        .filter((section) => section.options.length > 0);
    const values = sections.reduce<GameOptionValues>((currentValues, section) => {
        section.options.forEach((option) => {
            currentValues[option.name] = option.value;
        });

        return currentValues;
    }, {});

    return { token, values, sections };
}

export async function updateGameOptions(values: GameOptionValues, token: string): Promise<void> {
    const res = await fetch(GAME_OPTION_UPDATE_PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: createGameOptionBody(values, token),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
}
