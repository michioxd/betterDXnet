import { apiHelperFetchDoc } from "../helper";

function createProfileOptionBody(values: Record<string, string>, token: string) {
    const body = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
        body.set(key, value);
    });
    body.set("token", token);

    return body;
}

async function postProfileOption(path: string, values: Record<string, string>, token: string): Promise<void> {
    const res = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: createProfileOptionBody(values, token),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
}

export function updateUserName(userName: string, token: string): Promise<void> {
    return postProfileOption("/maimai-mobile/home/userOption/updateUserName/update/", { userName }, token);
}

export function updateUserFriendRegistOption(userOption: boolean, token: string): Promise<void> {
    return postProfileOption(
        "/maimai-mobile/home/userOption/updateUserFriendRegistOption/update/",
        { userOption: userOption ? "1" : "0" },
        token,
    );
}

export async function currentUserFriendRegistOption(): Promise<boolean> {
    const res = await apiHelperFetchDoc("/maimai-mobile/home/userOption/updateUserFriendRegistOption/");
    const selectedValue =
        res.document.querySelector<HTMLSelectElement>('select[name="userOption"]')?.value ??
        res.document.querySelector<HTMLOptionElement>('select[name="userOption"] option[selected]')?.value ??
        "0";

    return selectedValue === "1";
}
