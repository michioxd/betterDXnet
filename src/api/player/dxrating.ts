import { maimaiApi } from "@/db/maimaiDataApi";
import { calculateRating } from "@/utils/rating";
import { apiHelperFetchDoc } from "../helper";
import { GameRecordScoreRank, GameRecordSongDifficulty, GameRecordSongKind } from "../records";
import { GetPlayerDXRating, GetPlayerDXRatingItem } from "./types";

const DX_RATING_PATH = "/maimai-mobile/home/ratingTargetMusic/";

const sectionTitleByKey: Record<keyof GetPlayerDXRating, string> = {
    new: "Songs for Rating(New)",
    old: "Songs for Rating(Others)",
    selectionNew: "Songs for Rating Selection(New)",
    selectionOld: "Songs for Rating Selection(Others)",
};

const difficultyByImageName: Record<string, GameRecordSongDifficulty> = {
    diff_basic: GameRecordSongDifficulty.BASIC,
    diff_advanced: GameRecordSongDifficulty.ADVANCED,
    diff_expert: GameRecordSongDifficulty.EXPERT,
    diff_master: GameRecordSongDifficulty.MASTER,
    diff_remaster: GameRecordSongDifficulty.REMASTER,
};

const songKindByImageName: Record<string, GameRecordSongKind> = {
    music_standard: GameRecordSongKind.STANDARD,
    music_dx: GameRecordSongKind.DX,
    music_utage: GameRecordSongKind.UTAGE,
};

const scoreRankByImageName: Record<string, GameRecordScoreRank> = {
    music_icon_d: GameRecordScoreRank.D,
    music_icon_c: GameRecordScoreRank.C,
    music_icon_b: GameRecordScoreRank.B,
    music_icon_bb: GameRecordScoreRank.BB,
    music_icon_bbb: GameRecordScoreRank.BBB,
    music_icon_a: GameRecordScoreRank.A,
    music_icon_aa: GameRecordScoreRank.AA,
    music_icon_aaa: GameRecordScoreRank.AAA,
    music_icon_s: GameRecordScoreRank.S,
    music_icon_sp: GameRecordScoreRank.S_P,
    music_icon_ss: GameRecordScoreRank.SS,
    music_icon_ssp: GameRecordScoreRank.SS_P,
    music_icon_sss: GameRecordScoreRank.SSS,
    music_icon_sssp: GameRecordScoreRank.SSS_P,
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
    return Number(normalizeText(value).replace(/[,%]/g, "")) || 0;
}

export function parsePlayerDXRatingBlock(block: HTMLElement): GetPlayerDXRatingItem {
    const difficultyName = imageName(block.querySelector<HTMLImageElement>('img[src*="/img/diff_"]'));
    const songKindName = imageName(block.querySelector<HTMLImageElement>(".music_kind_icon"));
    const scoreRankName = imageName(block.querySelector<HTMLImageElement>(".ratingtarget_scorerank_img"));
    const songTitle = normalizeText(block.querySelector(".music_name_block")?.textContent);
    const songLevel = normalizeText(block.querySelector(".music_lv_block")?.textContent);
    const songKind = songKindByImageName[songKindName] ?? GameRecordSongKind.STANDARD;
    const achievement = parseNumber(block.querySelector(".music_score_block")?.textContent);

    const querySongDetails = maimaiApi.getSheet({
        title: songTitle,
        level: songLevel,
        type: songKind,
    });
    const rating = querySongDetails?.sheet.internalLevelValue
        ? calculateRating(achievement, querySongDetails.sheet.internalLevelValue)
        : undefined;

    return {
        id: block.querySelector<HTMLInputElement>('form input[name="idx"]')?.value ?? "",
        songTitle,
        songdifficulty: difficultyByImageName[difficultyName] ?? GameRecordSongDifficulty.BASIC,
        songLevel,
        songKind,
        songFullDetail: querySongDetails,

        achievement,
        scoreRank: scoreRankByImageName[scoreRankName] ?? GameRecordScoreRank.D,
        rating,
    };
}

function parseSection(document: Document, title: string) {
    const sectionHeader = [...document.querySelectorAll<HTMLElement>(".screw_block")].find(
        (block) => normalizeText(block.textContent) === title,
    );

    if (!sectionHeader) return [];

    const items: GetPlayerDXRatingItem[] = [];

    for (let node = sectionHeader.nextElementSibling; node; node = node.nextElementSibling) {
        if (node instanceof HTMLElement && node.classList.contains("screw_block")) break;
        if (node instanceof HTMLElement && node.matches('[class*="music_"][class*="_score_back"]')) {
            items.push(parsePlayerDXRatingBlock(node));
        }
    }

    return items;
}

export async function dxrating(): Promise<GetPlayerDXRating> {
    const res = await apiHelperFetchDoc(DX_RATING_PATH);

    return {
        new: parseSection(res.document, sectionTitleByKey.new),
        old: parseSection(res.document, sectionTitleByKey.old),
        selectionNew: parseSection(res.document, sectionTitleByKey.selectionNew),
        selectionOld: parseSection(res.document, sectionTitleByKey.selectionOld),
    };
}
