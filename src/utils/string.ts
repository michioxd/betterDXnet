export function normalizeText(value: string | null | undefined) {
    return value?.replace(/[\t\r\n]+/g, "").replace(/^[ \f\v]+|[ \f\v]+$/g, "") ?? "";
}

export function imageName(image: HTMLImageElement | null | undefined) {
    return (
        image
            ?.getAttribute("src")
            ?.split("/")
            .pop()
            ?.split("?")[0]
            ?.replace(/\.png$/, "") ?? ""
    );
}

export function parseNumber(value: string | null | undefined) {
    return Number(normalizeText(value).replace(/,/g, "")) || 0;
}

export function parsePlayDate(value: string) {
    const [, year, month, day, hour, minute] = value.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/) ?? [];

    if (!year || !month || !day || !hour || !minute) {
        return new Date(value);
    }

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 9, Number(minute)));
}

export function parsePair(value: string | null | undefined) {
    const [current = "0", max = "0"] = normalizeText(value)
        .split("/")
        .map((item) => item.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}

export function parseDxScore(value: string | null | undefined) {
    const [current = "0", max = "0"] = normalizeText(value)
        .replace(/^DX SCORE\s*/i, "")
        .split("/")
        .map((item) => item.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}
