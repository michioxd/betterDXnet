import type { TrophyType } from "./title";

export interface CollectionGeneres {
    id: string;
    name: string;
    type: CollectionType;
}

export enum CollectionType {
    Icon = "icon",
    Nameplate = "nameplate",
    Frame = "frame",
    Title = "title",
    TourMember = "tour_member",
    Partner = "partner",
}

export interface NameplateAvailableListResponse {
    title: string;
    description: string;
    url: string;
    genereId: string;
    genereName: string;
    using: boolean;
    favorite: boolean;
    available: boolean;
    formValue: string;
}

export interface CurrentNameplateResponse {
    areaName: string;
    title: string;
    description: string;
    url: string;
}

export interface CurrentFrameResponse {
    areaName: string;
    title: string;
    description: string;
    url: string;
}

export interface FrameAvailableListResponse {
    title: string;
    description: string;
    url: string;
    genereId: string;
    genereName: string;
    using: boolean;
    favorite: boolean;
    available: boolean;
    formValue: string;
}

export interface IconAvailableListResponse {
    title: string;
    description: string;
    url: string;
    genereId: string;
    genereName: string;
    using: boolean;
    favorite: boolean;
    available: boolean;
    formValue: string;
}

export interface CurrentIconResponse {
    areaName: string;
    title: string;
    description: string;
    url: string;
    isRandomFromAll: boolean;
    isRandomFromFavorite: boolean;
}

export interface PartnerAvailableListResponse {
    title: string;
    description: string;
    url: string;
    using: boolean;
    available: boolean;
    formValue: string;
}

export interface CurrentPartnerResponse {
    areaName: string;
    title: string;
    description: string;
    url: string;
}

export interface TitleAvailableListResponse {
    title: string;
    description: string;
    type: TrophyType;
    using: boolean;
    favorite: boolean;
    available: boolean;
    formValue: string;
}

export interface CurrentTitleResponse {
    title: string;
    description: string;
    type: TrophyType;
}
