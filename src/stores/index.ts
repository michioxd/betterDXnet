import { configure } from "mobx";

configure({
    enforceActions: "never",
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
});
