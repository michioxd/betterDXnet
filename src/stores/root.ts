import { MeStore } from "./modules/me";

export class RootStore {
    readonly me = new MeStore(this);
}

export const rootStore = new RootStore();
