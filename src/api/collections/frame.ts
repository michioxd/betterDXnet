import { apiHelperFetchDoc, postCollectionAction } from "../helper";
import { CollectionGeneres, CollectionType, CurrentFrameResponse, FrameAvailableListResponse } from "./types";

export async function frameAvailableList(): Promise<{
    genereList: CollectionGeneres[];
    frameList: FrameAvailableListResponse[];
}> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/frame");

    const genereBlocks = [
        ...res.document.querySelectorAll<HTMLElement>(
            'body div.see_through_area .town_block[name^="genre_"]:not([name="genre_101"]):not([name="genre_100"])',
        ),
    ];

    const genereList: CollectionGeneres[] = genereBlocks.map((block) => ({
        id: block.getAttribute("name")!.replace("genre_", ""),
        name: block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "",
        type: CollectionType.Frame,
    }));

    const frameList: FrameAvailableListResponse[] = genereBlocks.flatMap((block) => {
        const genereId = block.getAttribute("name")!.replace("genre_", "");
        const genereName = block.querySelector(".t_c.f_15.f_b")?.textContent?.trim() ?? "";

        return [...block.querySelectorAll<HTMLElement>(".see_through_block")].map((item) => {
            const frameImage = item.querySelector<HTMLImageElement>('img[src*="/img/Frame/"]');
            const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/frame/set/"]');
            const favoriteOffForm = item.querySelector<HTMLFormElement>(
                'form[action$="/collection/frame/favoriteOff/"]',
            );
            const favoriteOnForm = item.querySelector<HTMLFormElement>('form[action$="/collection/frame/favoriteOn/"]');

            const formToken =
                setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOffForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ??
                favoriteOnForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value;

            return {
                title: item.querySelector(".p_5.f_14.break")?.textContent?.trim() ?? "",
                description: item.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "",
                url: frameImage?.getAttribute("src") ?? "",
                genereId,
                genereName,
                using: item.classList.contains("collection_setting_block"),
                favorite: favoriteOffForm !== null,
                available: !frameImage?.classList.contains("gray_img"),
                formValue: formToken ?? "",
            };
        });
    });

    return { genereList, frameList };
}

export async function currentFrame(): Promise<CurrentFrameResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/frame");

    const currentFrameBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    return {
        areaName: currentFrameBlock?.querySelector(".block_info")?.textContent?.trim() ?? "",
        title: currentFrameBlock?.querySelector(".p_5.f_14.break")?.textContent?.trim() ?? "",
        description: currentFrameBlock?.querySelector(".p_l_5.f_12.gray.break")?.textContent?.trim() ?? "",
        url: currentFrameBlock?.querySelector<HTMLImageElement>('img[src*="/img/Frame/"]')?.getAttribute("src") ?? "",
    };
}

export function setFrame(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/frame/set/", formValue, token);
}

export function favoriteFrame(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/frame/favoriteOn/", formValue, token);
}

export function unfavoriteFrame(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/frame/favoriteOff/", formValue, token);
}
