export interface ApiFetchDocResponse {
    document: Document;
    headers: Headers;
    status: number;
    statusText: string;
}

/**
 * Fetches a document from the specified path.
 * @param {string} path - The path to fetch.
 * @returns {Promise<ApiFetchDocResponse>} A promise resolving to the fetched document and response details.
 */
export async function apiHelperFetchDoc(path: string): Promise<ApiFetchDocResponse> {
    const res = await fetch(path);

    if (!res.ok) {
        const content = await res.text();
        if (content.includes("Sorry, servers are under maintenance.")) {
            throw new Error("SEGA shut down the server in 7PM-10PM GMT everyday lol.");
        }
        throw new Error(`Request failed with status ${res.status}`);
    }

    const html = await res.text();

    const errorCode = html.match(/ERROR CODE\uFF1A\s*(\d+)/)?.[1];

    if (errorCode) {
        throw new Error(
            `Error code ${errorCode}. You may need to log in again. If it have Back button, please click it to go back and try again.`,
        );
    }

    return {
        document: new DOMParser().parseFromString(html, "text/html"),
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
    };
}

function createCollectionFormBody(formValue: string, token: string, selectGenre?: string) {
    const body = new URLSearchParams();

    body.set("idx", formValue);
    if (selectGenre !== undefined) {
        body.set("selectGenre", selectGenre);
    }
    body.set("token", token);

    return body;
}

export async function postCollectionAction(path: string, formValue: string, token: string, selectGenre?: string) {
    const res = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: createCollectionFormBody(formValue, token, selectGenre),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
}
