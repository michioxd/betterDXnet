import { apiHelperFetchDoc } from "../helper";
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

export async function titleAvailableList(type: TrophyType): Promise<TitleAvailableListResponse[]> {
    const res = await apiHelperFetchDoc(`/maimai-mobile/collection/trophy/?rare=${trophyRareMap[type]}`);

    const titleList: TitleAvailableListResponse[] = [
        ...res.document.querySelectorAll<HTMLElement>("body .trophyList .see_through_block"),
    ].map((item) => {
        const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/trophy/set/"]');

        return {
            title: item.querySelector(".trophy_inner_block")?.textContent?.trim() ?? "",
            description: item.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "",
            type,
            using: item.classList.contains("collection_setting_block"),
            available: !item.querySelector(".collection_lock_img"),
            formValue: setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ?? "",
        };
    });

    return titleList;
}

export async function currentTitle(): Promise<CurrentTitleResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/trophy/?rare=0");

    const currentTitleBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    const title = currentTitleBlock?.querySelector(".trophy_inner_block")?.textContent?.trim() ?? "";
    const description = currentTitleBlock?.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "";
    const type = (currentTitleBlock
        ?.querySelector(".collection_trophy_block")
        ?.className.split(" ")
        .find((className) => className.startsWith("trophy_"))
        ?.replace("trophy_", "") ?? "Normal") as TrophyType;

    return {
        title,
        description,
        type,
    };
}
