export async function authFetch(
    input: RequestInfo,
    init?: RequestInit
): Promise<Response> {
    const token = localStorage.getItem("authToken");

    const authHeaders = token
        ? {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
        }
        : init?.headers;

    const finalInit: RequestInit = {
        ...init,
        headers: authHeaders,
    };

    return fetch(input, finalInit);
}
