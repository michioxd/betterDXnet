import { apiHelperFetchDoc, postCollectionAction } from "../helper";
import { CurrentTitleResponse, TitleAvailableListResponse } from "./types";

export enum TrophyType {
    Normal = "Normal",
    Bronze = "Bronze",
    Silver = "Silver",
    Gold = "Gold",
    Rainbow = "Rainbow",
}

const trophyRareMap: Record<TrophyType, number> = {
    [TrophyType.Normal]: 0,
    [TrophyType.Bronze]: 1,
    [TrophyType.Silver]: 2,
    [TrophyType.Gold]: 3,
    [TrophyType.Rainbow]: 4,
};

export const trophyBgBasePath = "/maimai-mobile/img/trophy_{}.png";

export async function titleAvailableList(type: TrophyType): Promise<{
    titleList: TitleAvailableListResponse[];
    randomFormValue: {
        all?: string;
        favorite?: string;
    };
}> {
    const res = await apiHelperFetchDoc(`/maimai-mobile/collection/trophy/?rare=${trophyRareMap[type]}`);

    const titleList: TitleAvailableListResponse[] = [
        ...res.document.querySelectorAll<HTMLElement>("body .trophyList .see_through_block"),
    ].map((item) => {
        const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/trophy/set/"]');
        const favoriteOffForm = item.querySelector<HTMLFormElement>('form[action$="/collection/trophy/favoriteOff/"]');
        const favoriteOnForm = item.querySelector<HTMLFormElement>('form[action$="/collection/trophy/favoriteOn/"]');

        const formToken =
            setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
            favoriteOffForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
            favoriteOnForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value;

        return {
            title: item.querySelector(".trophy_inner_block")?.textContent?.trim() ?? "",
            description: item.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "",
            type,
            using: item.classList.contains("collection_setting_block"),
            favorite: favoriteOffForm !== null,
            available: !item.querySelector(".collection_lock_img"),
            formValue: formToken ?? "",
        };
    });

    const randomFormValue = [
        ...res.document.querySelectorAll<HTMLElement>("body .town_block.m_15.m_t_0.p_15.t_l .see_through_block"),
    ].reduce<{
        all?: string;
        favorite?: string;
    }>((value, item) => {
        const title = item.querySelector(".trophy_inner_block")?.textContent?.trim() ?? "";
        const formValue = item.querySelector<HTMLInputElement>(
            'form[action$="/collection/trophy/set/"] input[name="idx"]',
        )?.value;

        if (title === "Random selection from all") {
            value.all = formValue;
        } else if (title === "Random selection from favorite") {
            value.favorite = formValue;
        }

        return value;
    }, {});

    return { titleList, randomFormValue };
}

export async function currentTitle(): Promise<CurrentTitleResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/trophy/?rare=0");

    const currentTitleBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    const title = currentTitleBlock?.querySelector(".trophy_inner_block")?.textContent?.trim() ?? "";
    const description = currentTitleBlock?.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "";
    const isRandomFromAll = title === "Random selection from all";
    const isRandomFromFavorite = title === "Random selection from favorite";
    const type = (currentTitleBlock
        ?.querySelector(".collection_trophy_block")
        ?.className.split(" ")
        .find((className) => className.startsWith("trophy_"))
        ?.replace("trophy_", "") ?? "Normal") as TrophyType;

    return {
        title,
        description,
        type,
        isRandomFromAll,
        isRandomFromFavorite,
    };
}

export function setTitle(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/trophy/set/", formValue, token);
}

export function favoriteTitle(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/trophy/favoriteOn/", formValue, token);
}

export function unfavoriteTitle(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/trophy/favoriteOff/", formValue, token);
}
