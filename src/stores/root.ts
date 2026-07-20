import { AppStore } from "./modules/app";
import { MeStore } from "./modules/me";
import { PlayerStore } from "./modules/player";
import { RecordsStore } from "./modules/records";

export class RootStore {
    readonly me = new MeStore(this);
    readonly app = new AppStore(this);
    readonly player = new PlayerStore(this);
    readonly records = new RecordsStore(this);
}

export const rootStore = new RootStore();
