import { apiHelperFetchDoc } from "./helper";

/**
 * Represents the user profile data.
 * @type {ApiMe}
 * @property {string} name - The name of the user.
 * @property {string} trophy - The title shown on the user's profile.
 * @property {ApiMeTrophyType} trophyType - The type of trophy the user has, which can be one of the following: Normal, Bronze, Silver, Gold, or Rainbow.
 * @property {string} trophyBg - The URL of the trophy background image.
 * @property {string} courseRankImg - The URL of the course rank image, for example: https://maimaidx-eng.com/maimai-mobile/img/course/course_rank_00T7GHJvGe.png
 * @property {string} classImg - The URL of the class image, for example: https://maimaidx-eng.com/maimai-mobile/img/class/class_rank_s_00ZqZmdpb8.png
 * @property {number} stars - The number of stars the user has.
 * @property {number} rating - The user's rating.
 * @property {string} ratingImg - The URL of the rating image, for example: https://maimaidx-eng.com/maimai-mobile/img/rating_base_orange.png?ver=1.60
 * @property {string} primaryCharImg - The URL of the primary character image.
 */
export interface ApiMe {
    name: string;
    trophy: string;
    trophyType: ApiMeTrophyType;
    trophyBg: string;
    courseRankImg: string;
    classImg: string;
    stars: number;
    rating: number;
    ratingImg: string;
    primaryCharImg: string;
}

export enum ApiMeTrophyType {
    Normal = "Normal",
    Bronze = "Bronze",
    Silver = "Silver",
    Gold = "Gold",
    Rainbow = "Rainbow",
}

const trophyBgBasePath = "/maimai-mobile/img/trophy_{}.png";

export async function apiMe(): Promise<ApiMe> {
    const res = await apiHelperFetchDoc("/maimai-mobile/home");

    const name =
        res.document.querySelector("body div.wrapper .see_through_block div.name_block")?.textContent?.trim() ?? "";

    const trophy =
        res.document
            .querySelector("body div.wrapper .see_through_block div.trophy_block div.trophy_inner_block")
            ?.textContent?.trim() ?? "";

    const trophyType =
        res.document
            .querySelector("body div.wrapper .see_through_block div.trophy_block")
            ?.className.split(" ")
            .find((cls) => cls.startsWith("trophy_") && !cls.includes("block"))
            ?.replace("trophy_", "") ?? ApiMeTrophyType.Normal;

    const courseRankImg =
        res.document
            .querySelector("body div.wrapper .see_through_block div.basic_block div.p_l_10.f_l img.h_35.f_l")
            ?.getAttribute("src") ?? "";

    const classImg =
        res.document
            .querySelector("body div.wrapper .see_through_block div.basic_block div.p_l_10.f_l img.p_l_10.h_35.f_l")
            ?.getAttribute("src") ?? "";

    const stars =
        parseInt(
            res.document
                .querySelector("body div.wrapper .see_through_block div.p_l_10.f_l div.p_l_10.f_l.f_14")
                ?.textContent?.trim()
                .replace("\u00D7", "") ?? "0",
            10,
        ) || 0;

    const rating =
        parseInt(
            res.document
                .querySelector("body div.wrapper .see_through_block div.basic_block div.p_r.p_3 div.rating_block")
                ?.textContent?.trim() ?? "0",
            10,
        ) || 0;

    const ratingImg =
        res.document
            .querySelector("body div.wrapper .see_through_block div.basic_block div.p_r.p_3 img.h_30.f_r")
            ?.getAttribute("src") ?? "";

    const primaryCharImg =
        res.document.querySelector("body div.wrapper .see_through_block img.w_120.m_t_10.f_r")?.getAttribute("src") ??
        "";

    const trophyBgPath = trophyBgBasePath.replace("{}", trophyType.toLowerCase());

    return {
        name,
        trophy,
        trophyType: trophyType as ApiMeTrophyType,
        trophyBg: trophyBgPath,
        courseRankImg,
        classImg,
        stars,
        rating,
        ratingImg,
        primaryCharImg,
    };
}
