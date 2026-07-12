import { apiHelperFetchDoc } from "../helper";
import { CollectionGeneres, CollectionType, CurrentIconResponse, IconAvailableListResponse } from "./types";

export async function iconAvailableList(): Promise<{
    genereList: CollectionGeneres[];
    iconList: IconAvailableListResponse[];
}> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/");

    const genereBlocks = [
        ...res.document.querySelectorAll<HTMLElement>(
            'body div.see_through_area .town_block[name^="genre_"]:not([name="genre_101"])',
        ),
    ];

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

            return {
                title: item.querySelector(".p_t_10.p_b_5.f_14.break")?.textContent?.trim() ?? "",
                description: item.querySelector(".f_12.gray.break")?.textContent?.trim() ?? "",
                url: iconImage?.getAttribute("src") ?? "",
                genereId,
                genereName,
                using: item.classList.contains("collection_setting_block"),
                available: !iconImage?.classList.contains("gray_img"),
                formValue: setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ?? "",
            };
        });
    });

    return { genereList, iconList };
}

export async function currentIcon(): Promise<CurrentIconResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/");

    const currentIconBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    return {
        areaName: currentIconBlock?.querySelector(".block_info span")?.textContent?.trim() ?? "",
        title: currentIconBlock?.querySelector(".p_t_10.p_b_5.f_14.break")?.textContent?.trim() ?? "",
        description: currentIconBlock?.querySelector(".f_12.gray.break")?.textContent?.trim() ?? "",
        url: currentIconBlock?.querySelector<HTMLImageElement>('img[src*="/img/Icon/"]')?.getAttribute("src") ?? "",
    };
}
