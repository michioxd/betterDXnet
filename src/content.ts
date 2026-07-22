import bootstrap from "./main";
import { extensionRuntime } from "./runtime";

if (document.body.innerHTML.includes("Sorry, servers are under maintenance.")) {
    document.querySelector(".main_info")!.innerHTML += `<div id='betterDXnet-warning'>
    <a href="https://github.com/michioxd/betterDXnet" target="_blank" rel="noopener noreferrer">betterDXnet</a> is not available while the servers are under maintenance.
    </div>`;

    extensionRuntime.onMessage.addListener((message: { type?: string }) => {
        if (message.type === "betterdxnet:toggle") {
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        }
    });
} else {
    const container = document.createElement("div");
    container.id = "betterDXnet-app";
    document.body.appendChild(container);

    bootstrap(container, "content");
}
