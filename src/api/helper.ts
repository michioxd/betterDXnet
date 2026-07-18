export interface ApiFetchDocResponse {
    document: Document;
    headers: Headers;
    status: number;
    statusText: string;
}

function getSegayShutdownLeft(): string {
    const now = new Date();

    const end = new Date(now);
    end.setUTCHours(22, 0, 0, 0);

    if (end <= now) {
        end.setUTCDate(end.getUTCDate() + 1);
    }

    const diff = end.getTime() - now.getTime();

    const hours = Math.floor(diff / 3_600_000);
    if (hours >= 2) return `${hours} hours left`;

    const minutes = Math.ceil(diff / 60_000);
    if (minutes >= 2) return `${minutes} minutes left`;

    return `${Math.ceil(diff / 1000)} seconds left`;
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
            throw new Error(`SEGA shut down they server! Please check back later. (About ${getSegayShutdownLeft()})`);
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
