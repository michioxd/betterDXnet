import { AppStore } from "./modules/app";
import { MeStore } from "./modules/me";

export class RootStore {
    readonly me = new MeStore(this);
    readonly app = new AppStore(this);
}

export const rootStore = new RootStore();
