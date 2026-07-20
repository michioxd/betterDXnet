import { ApiMeRankType } from "../me";
import { apiHelperFetchDoc } from "../helper";
import type { GameRecordPlayLogDetail, JudgeCount, JudgeTable } from "./types";
import { parsePlaylogBlock } from "./last50";

const PLAYLOG_DETAIL_PATH = "/maimai-mobile/record/playlogDetail/";

const emptyJudgeCount: JudgeCount = {
    criticalPerfect: 0,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
};

const rankTypeByImageName: Record<string, ApiMeRankType> = {
    rating_base: ApiMeRankType.Base,
    rating_base_blue: ApiMeRankType.Blue,
    rating_base_green: ApiMeRankType.Green,
    rating_base_yellow: ApiMeRankType.Yellow,
    rating_base_red: ApiMeRankType.Red,
    rating_base_purple: ApiMeRankType.Purple,
    rating_base_bronze: ApiMeRankType.Bronze,
    rating_base_silver: ApiMeRankType.Silver,
    rating_base_gold: ApiMeRankType.Gold,
    rating_base_platinum: ApiMeRankType.Platinum,
    rating_base_rainbow: ApiMeRankType.Rainbow,
};

function normalizeText(value: string | null | undefined) {
    return value?.replace(/\s+/g, " ").trim() ?? "";
}

function imageName(image: HTMLImageElement | null | undefined) {
    return (
        image
            ?.getAttribute("src")
            ?.split("/")
            .pop()
            ?.split("?")[0]
            ?.replace(/\.png$/, "") ?? ""
    );
}

function parseNumber(value: string | null | undefined) {
    return Number(normalizeText(value).replace(/[,+()]/g, "")) || 0;
}

function parsePair(value: string | null | undefined) {
    const [current = "0", max = "0"] = normalizeText(value)
        .split("/")
        .map((item) => item.trim());

    return {
        current: parseNumber(current),
        max: parseNumber(max),
    };
}

function parseJudgeCount(row: HTMLTableRowElement | null): JudgeCount {
    if (!row) return { ...emptyJudgeCount };

    const values = [...row.querySelectorAll<HTMLTableCellElement>("td")].map((cell) => parseNumber(cell.textContent));

    return {
        criticalPerfect: values[0] ?? 0,
        perfect: values[1] ?? 0,
        great: values[2] ?? 0,
        good: values[3] ?? 0,
        miss: values[4] ?? 0,
    };
}

function parseJudgeTable(document: Document): JudgeTable {
    const rowsByName = new Map(
        [...document.querySelectorAll<HTMLTableRowElement>(".playlog_notes_detail tr")]
            .map((row) => [imageName(row.querySelector<HTMLImageElement>("th img")), row] as const)
            .filter(([name]) => name),
    );

    return {
        tap: parseJudgeCount(rowsByName.get("tap") ?? null),
        hold: parseJudgeCount(rowsByName.get("hold") ?? null),
        slide: parseJudgeCount(rowsByName.get("slide") ?? null),
        touch: parseJudgeCount(rowsByName.get("touch") ?? null),
        break: parseJudgeCount(rowsByName.get("break") ?? null),
    };
}

function parseRatingDirection(document: Document): GameRecordPlayLogDetail["ratingDirection"] {
    const ratingIconName = imageName(
        document.querySelector<HTMLImageElement>(".playlog_rating_detail_block img[src*='/playlog/rating_']"),
    );

    if (ratingIconName === "rating_up") return "up";
    if (ratingIconName === "rating_down") return "down";

    return "keep";
}

function parseRating(document: Document) {
    const ratingResult = parseNumber(document.querySelector(".playlog_rating_detail_block .rating_block")?.textContent);
    const ratingDirection = parseRatingDirection(document);
    const ratingDelta = parseNumber(document.querySelector(".playlog_rating_detail_block span")?.textContent);
    const signedRatingDelta = ratingDirection === "down" ? -ratingDelta : ratingDelta;
    const ratingImgName = imageName(
        document.querySelector<HTMLImageElement>(".playlog_rating_detail_block img[src*='/img/rating_base']"),
    );

    return {
        ratingPrev: ratingResult - signedRatingDelta,
        ratingPrevType: rankTypeByImageName[ratingImgName] ?? ApiMeRankType.Base,
        ratingResult,
        ratingDelta: signedRatingDelta,
        ratingDirection,
    };
}

function parseFastLate(document: Document) {
    const fastLateBlocks = [...document.querySelectorAll<HTMLElement>(".playlog_fl_block .w_96")];
    const valuesByName = new Map(
        fastLateBlocks.map((block) => [
            imageName(block.querySelector<HTMLImageElement>("img")),
            parseNumber(block.textContent),
        ]),
    );

    return {
        fast: valuesByName.get("fast") ?? 0,
        late: valuesByName.get("late") ?? 0,
    };
}

function parseScorePair(document: Document, imageNameValue: "maxcombo" | "maxsync") {
    const block = [...document.querySelectorAll<HTMLElement>(".playlog_score_block")].find(
        (block) => imageName(block.querySelector<HTMLImageElement>("img")) === imageNameValue,
    );

    return parsePair(block?.querySelector(".white")?.textContent);
}

export async function playLogDetail(id: string): Promise<GameRecordPlayLogDetail> {
    const res = await apiHelperFetchDoc(`${PLAYLOG_DETAIL_PATH}?idx=${encodeURIComponent(id)}`);
    const detailBlock = res.document.querySelector<HTMLElement>(".p_10.t_l.f_0.v_b");

    if (!detailBlock) {
        throw new Error("Play log detail block not found");
    }

    const detail = parsePlaylogBlock(detailBlock);
    const rating = parseRating(res.document);
    const fastLate = parseFastLate(res.document);

    return {
        id,
        detail: {
            ...detail,
            id,
        },
        judge: parseJudgeTable(res.document),
        fast: fastLate.fast,
        late: fastLate.late,
        ratingPrev: rating.ratingPrev,
        ratingPrevType: rating.ratingPrevType,
        ratingResult: rating.ratingResult,
        ratingDirection: rating.ratingDirection,
        ratingDelta: rating.ratingDelta,
        maxCombo: parseScorePair(res.document, "maxcombo"),
        maxSync: parseScorePair(res.document, "maxsync"),
    };
}
