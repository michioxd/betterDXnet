import { currentIcon, favoriteIcon, iconAvailableList, setIcon, unfavoriteIcon } from "./icon";
import { currentFrame, favoriteFrame, frameAvailableList, setFrame, unfavoriteFrame } from "./frame";
import {
    currentNameplate,
    favoriteNameplate,
    nameplateAvailableList,
    setNameplate,
    unfavoriteNameplate,
} from "./nameplate";
import { currentPartner, partnerAvailableList, setPartner } from "./partner";
import { currentTitle, favoriteTitle, setTitle, titleAvailableList, unfavoriteTitle } from "./title";

export { currentIcon, favoriteIcon, iconAvailableList, setIcon, unfavoriteIcon } from "./icon";
export { currentFrame, favoriteFrame, frameAvailableList, setFrame, unfavoriteFrame } from "./frame";
export {
    currentNameplate,
    favoriteNameplate,
    nameplateAvailableList,
    setNameplate,
    unfavoriteNameplate,
} from "./nameplate";
export { currentPartner, partnerAvailableList, setPartner } from "./partner";
export {
    currentTitle,
    favoriteTitle,
    setTitle,
    titleAvailableList,
    TrophyType,
    trophyBgBasePath,
    unfavoriteTitle,
} from "./title";
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
        set: setNameplate,
        favorite: favoriteNameplate,
        unfavorite: unfavoriteNameplate,
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
        set: setIcon,
        favorite: favoriteIcon,
        unfavorite: unfavoriteIcon,
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
        set: setFrame,
        favorite: favoriteFrame,
        unfavorite: unfavoriteFrame,
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
        set: setPartner,
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
        set: setTitle,
        favorite: favoriteTitle,
        unfavorite: unfavoriteTitle,
    },
};
