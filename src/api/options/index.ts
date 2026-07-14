import { currentGameOptions, updateGameOptions } from "./game";
import { currentUserFriendRegistOption, updateUserFriendRegistOption, updateUserName } from "./profile";

export { currentGameOptions, updateGameOptions } from "./game";
export type {
    CurrentGameOptionsResponse,
    GameOptionItem,
    GameOptionName,
    GameOptionSelectOption,
    GameOptionSection,
    GameOptionValues,
} from "./game";
export { currentUserFriendRegistOption, updateUserFriendRegistOption, updateUserName } from "./profile";

export const apiOptions = {
    game: {
        currentGameOptions,
        updateGameOptions,
    },
    profile: {
        currentUserFriendRegistOption,
        updateUserName,
        updateUserFriendRegistOption,
    },
};
