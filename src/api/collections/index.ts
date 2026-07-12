import { currentIcon, iconAvailableList } from "./icon";
import { currentFrame, frameAvailableList } from "./frame";
import { currentNameplate, nameplateAvailableList } from "./nameplate";
import { currentPartner, partnerAvailableList } from "./partner";
import { currentTitle, titleAvailableList } from "./title";

export { currentIcon, iconAvailableList } from "./icon";
export { currentFrame, frameAvailableList } from "./frame";
export { currentNameplate, nameplateAvailableList } from "./nameplate";
export { currentPartner, partnerAvailableList } from "./partner";
export { currentTitle, titleAvailableList } from "./title";
export * from "./types";

export const apiCollections = {
    nameplate: {
        /**
         * Get the list of available nameplates for the user.
         * @returns {Promise<{ genereList: NameplateAvailableListGenereResponse[]; nameplateList: NameplateAvailableListResponse[] }>} A promise resolving to an object containing the list of genres and nameplates.
         */
        listAvailable: nameplateAvailableList,
        /**
         * Get the user's currently equipped nameplate.
         * @returns {Promise<CurrentNameplateResponse>} A promise resolving to the current nameplate details.
         */
        current: currentNameplate,
    },
    icon: {
        /**
         * Get the list of available icons for the user.
         * @returns {Promise<{ genereList: CollectionGeneres[]; iconList: IconAvailableListResponse[] }>} A promise resolving to an object containing the list of genres and icons.
         */
        listAvailable: iconAvailableList,
        /**
         * Get the user's currently equipped icon.
         * @returns {Promise<CurrentIconResponse>} A promise resolving to the current icon details.
         */
        current: currentIcon,
    },
    frame: {
        /**
         * Get the list of available frames for the user.
         * @returns {Promise<{ genereList: CollectionGeneres[]; frameList: FrameAvailableListResponse[] }>} A promise resolving to an object containing the list of genres and frames.
         */
        listAvailable: frameAvailableList,
        /**
         * Get the user's currently equipped frame.
         * @returns {Promise<CurrentFrameResponse>} A promise resolving to the current frame details.
         */
        current: currentFrame,
    },
    partner: {
        /**
         * Get the list of available partners for the user.
         * @returns {Promise<PartnerAvailableListResponse[]>} A promise resolving to an object containing the list of partners.
         */
        listAvailable: partnerAvailableList,
        /**
         * Get the user's currently equipped partner.
         * @returns {Promise<CurrentPartnerResponse>} A promise resolving to the current partner details.
         */
        current: currentPartner,
    },
    title: {
        /**
         * Get the list of available titles for the user by trophy type.
         * @param {ApiMeTrophyType} type The trophy type to fetch.
         * @returns {Promise<TitleAvailableListResponse[]>} A promise resolving to the list of titles.
         */
        listAvailable: titleAvailableList,
        /**
         * Get the user's currently equipped title.
         * @returns {Promise<CurrentTitleResponse>} A promise resolving to the current title details.
         */
        current: currentTitle,
    },
};
