import { apiHelperFetchDoc, postCollectionAction } from "../helper";
import { CurrentPartnerResponse, PartnerAvailableListResponse } from "./types";

export async function partnerAvailableList(): Promise<PartnerAvailableListResponse[]> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/partner");

    const partnerList: PartnerAvailableListResponse[] = [
        ...res.document.querySelectorAll<HTMLElement>("body .town_block.m_15.m_t_0.p_15.t_l .see_through_block"),
    ].map((item) => {
        const partnerImage = item.querySelector<HTMLImageElement>('img[src*="/img/Partner/"]');
        const setForm = item.querySelector<HTMLFormElement>('form[action$="/collection/partner/set/"]');

        return {
            title: item.querySelector(".f_14.break")?.textContent?.trim() ?? "",
            description: item.querySelector(".f_12.gray.break")?.textContent?.trim() ?? "",
            url: partnerImage?.getAttribute("src") ?? "",
            using: item.classList.contains("collection_setting_block"),
            available: !partnerImage?.classList.contains("gray_img"),
            formValue: setForm?.querySelector<HTMLInputElement>('input[name="idx"]')?.value ?? "",
        };
    });

    return partnerList;
}

export async function currentPartner(): Promise<CurrentPartnerResponse> {
    const res = await apiHelperFetchDoc("/maimai-mobile/collection/partner");

    const currentPartnerBlock = res.document.querySelector<HTMLElement>(
        "body .town_block.m_15.p_15.t_l .see_through_block.collection_setting_block",
    );

    return {
        areaName: currentPartnerBlock?.querySelector(".w_300.f_l .f_14.break")?.textContent?.trim() ?? "",
        title: currentPartnerBlock?.querySelector(".w_300.f_l .f_12.gray.break")?.textContent?.trim() ?? "",
        description: currentPartnerBlock?.querySelector(".w_300.f_l .f_12.gray.break")?.textContent?.trim() ?? "",
        url:
            currentPartnerBlock?.querySelector<HTMLImageElement>('img[src*="/img/Partner/"]')?.getAttribute("src") ??
            "",
    };
}

export function setPartner(formValue: string, token: string): Promise<void> {
    return postCollectionAction("/maimai-mobile/collection/partner/set/", formValue, token);
}
