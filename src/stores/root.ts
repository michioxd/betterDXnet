import { AppStore } from "./modules/app";
import { MeStore } from "./modules/me";
import { RecordsStore } from "./modules/records";

export class RootStore {
    readonly me = new MeStore(this);
    readonly app = new AppStore(this);
    readonly records = new RecordsStore(this);
}

export const rootStore = new RootStore();
