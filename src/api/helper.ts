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
        throw new Error(`Request failed with status ${res.status}`);
    }

    const html = await res.text();

    return {
        document: new DOMParser().parseFromString(html, "text/html"),
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
    };
}
