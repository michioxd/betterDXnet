import { apiHelperFetchDoc } from "../helper";
import { CollectionGeneres, CollectionType, CurrentNameplateResponse, NameplateAvailableListResponse } from "./types";

export async function nameplateAvailableList(): Promise<{
    genereList: CollectionGeneres[];
    nameplateList: NameplateAvailableListResponse[];
}> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/nameplate");

    const genereBlocks = [
        ...res.document.querySelectorAll<HTMLElement>(
            'body div.see_through_area .town_block[name^="genre_"]:not([name="genre_101"])',
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

        return [...block.querySelectorAll<HTMLElement>(".see_through_block")].map((item) => ({
            title: item.querySelector(".block_info")?.textContent?.trim() ?? "",
            description: item.querySelector(".p_5.f_14.break")?.textContent?.trim() ?? "",
            url: item.querySelector<HTMLImageElement>(".p_r img.w_396.m_r_10")?.getAttribute("src") ?? "",
            genereId,
            genereName,
            using: item.classList.contains("collection_setting_block"),
            available: !item.querySelector<HTMLImageElement>(".p_r img.w_396.m_r_10")?.classList.contains("gray_img"),
            formValue: item.querySelector<HTMLInputElement>('form input[name="idx"]')?.value ?? "",
        }));
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
