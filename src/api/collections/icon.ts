import { apiHelperFetchDoc, postCollectionAction } from "../helper";
import { CollectionGeneres, CollectionType, CurrentIconResponse, IconAvailableListResponse } from "./types";

export async function iconAvailableList(): Promise<{
    genereList: CollectionGeneres[];
    iconList: IconAvailableListResponse[];
    randomFormValue: {
        all?: string;
        favorite?: string;
    };
}> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/");

    const genereBlocks = [
        ...res.document.querySelectorAll<HTMLElement>(
            'body div.see_through_area .town_block[name^="genre_"]:not([name="genre_101"]):not([name="genre_100"])',
        ),
    ];
    const randomBlock = res.document.querySelector<HTMLElement>(
        'body div.see_through_area .town_block[name="genre_101"]',
    );

    const genereList: CollectionGeneres[] = genereBlocks.map((block) => ({
        id: block.getAttribute("name")!.replace("genre_", ""),
        name: block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "",
        type: CollectionType.Icon,
    }));

    const iconList: IconAvailableListResponse[] = genereBlocks.flatMap((block) => {
        const genereId = block.getAttribute("name")!.replace("genre_", "");
        const genereName = block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "";

        return [...block.querySelectorAll<HTMLElement>(".see_through_block")].map((item) => {
            const iconImage = item.querySelector<HTMLImageElement>('img[src*="/img/Icon/"]');
            const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/set/"]');
            const favoriteOffForm = item.querySelector<HTMLFormElement>('form[action$="/collection/favoriteOff/"]');
            const favoriteOnForm = item.querySelector<HTMLFormElement>('form[action$="/collection/favoriteOn/"]');

            const formToken =
                setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOffForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOnForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value;

            return {
                title: item.querySelector(".p_t_10.p_b_5.f_14.break")?.textContent?.trim() ?? "",
                description: item.querySelector(".f_12.gray.break")?.textContent?.trim() ?? "",
                url: iconImage?.getAttribute("src") ?? "",
                genereId,
                genereName,
                using: item.classList.contains("collection_setting_block"),
                favorite: favoriteOffForm !== null,
                available: !iconImage?.classList.contains("gray_img"),
                formValue: formToken ?? "",
            };
        });
    });

    const randomFormValue = [...(randomBlock?.querySelectorAll<HTMLElement>(".see_through_block") ?? [])].reduce<{
        all?: string;
        favorite?: string;
    }>((value, item) => {
        const title = item.querySelector(".p_t_10.p_b_5.f_14.break")?.textContent?.trim() ?? "";
        const formValue = item.querySelector<HTMLInputElement>(
            'form[action$="/collection/set/"] input[name="idx"]',
        )?.value;

        if (title === "Random selection from all") {
            value.all = formValue;
        } else if (title === "Random selection from favorite") {
            value.favorite = formValue;
        }

        return value;
    }, {});

    return { genereList, iconList, randomFormValue };
}

export async function currentIcon(): Promise<CurrentIconResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/");

    const currentIconBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    const currentIconTitle = currentIconBlock?.querySelector(".p_t_10.p_b_5.f_14.break")?.textContent?.trim() ?? "";
    const isRandomFromAll = currentIconTitle === "Random selection from all";
    const isRandomFromFavorite = currentIconTitle === "Random selection from favorite";

    return {
        areaName: currentIconBlock?.querySelector(".block_info span")?.textContent?.trim() ?? "",
        title: currentIconTitle,
        description: currentIconBlock?.querySelector(".f_12.gray.break")?.textContent?.trim() ?? "",
        url: currentIconBlock?.querySelector<HTMLImageElement>('img[src*="/img/Icon/"]')?.getAttribute("src") ?? "",
        isRandomFromAll,
        isRandomFromFavorite,
    };
}

export function setIcon(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/set/", formValue, token);
}

export function favoriteIcon(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/favoriteOn/", formValue, token, "0");
}

export function unfavoriteIcon(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/favoriteOff/", formValue, token, "0");
}
