import { apiHelperFetchDoc, postCollectionAction } from "../helper";
import { CollectionGeneres, CollectionType, CurrentNameplateResponse, NameplateAvailableListResponse } from "./types";

export async function nameplateAvailableList(): Promise<{
    genereList: CollectionGeneres[];
    nameplateList: NameplateAvailableListResponse[];
}> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/nameplate");

    const genereBlocks = [
        ...res.document.querySelectorAll<HTMLElement>(
            'body div.see_through_area .town_block[name^="genre_"]:not([name="genre_101"]):not([name="genre_100"])',
        ),
    ];

    const genereList: CollectionGeneres[] = genereBlocks.map((block) => ({
        id: block.getAttribute("name")!.replace("genre_", ""),
        name: block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "",
        type: CollectionType.Nameplate,
    }));

    const nameplateList: NameplateAvailableListResponse[] = genereBlocks.flatMap((block) => {
        const genereId = block.getAttribute("name")!.replace("genre_", "");
        const genereName = block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "";

        return [...block.querySelectorAll<HTMLElement>(".see_through_block")].map((item) => {
            const nameplateImage = item.querySelector<HTMLImageElement>(".p_r img.w_396.m_r_10");
            const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/nameplate/set/"]');
            const favoriteOffForm = item.querySelector<HTMLFormElement>(
                'form[action$="/collection/nameplate/favoriteOff/"]',
            );
            const favoriteOnForm = item.querySelector<HTMLFormElement>(
                'form[action$="/collection/nameplate/favoriteOn/"]',
            );

            const formToken =
                setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOffForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOnForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value;

            return {
                title: item.querySelector(".block_info")?.textContent?.trim() ?? "",
                description: item.querySelector(".p_5.f_14.break")?.textContent?.trim() ?? "",
                url: nameplateImage?.getAttribute("src") ?? "",
                genereId,
                genereName,
                using: item.classList.contains("collection_setting_block"),
                favorite: favoriteOffForm !== null,
                available: !nameplateImage?.classList.contains("gray_img"),
                formValue: formToken ?? "",
            };
        });
    });

    return { genereList, nameplateList };
}

export async function currentNameplate(): Promise<CurrentNameplateResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/nameplate");

    const currentNameplateBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    return {
        areaName: currentNameplateBlock?.querySelector(".block_info")?.textContent?.trim() ?? "",
        title: currentNameplateBlock?.querySelector(".p_5.f_14.break")?.textContent?.trim() ?? "",
        description: currentNameplateBlock?.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "",
        url:
            currentNameplateBlock
                ?.querySelector<HTMLImageElement>('img[src*="/img/NamePlate/"]')
                ?.getAttribute("src") ?? "",
    };
}

export function setNameplate(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/nameplate/set/", formValue, token);
}

export function favoriteNameplate(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/nameplate/favoriteOn/", formValue, token);
}

export function unfavoriteNameplate(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/nameplate/favoriteOff/", formValue, token);
}
