const { origin, pathname } = window.location;
const BASE_URL = `${origin}${pathname}`;

export async function getGroupUrl(roomId: string) {
    const voiceResponse = await fetch(`${BASE_URL}/api/voice?roomId=${roomId}`);
    const voiceResult = await voiceResponse.json();

    return voiceResult;
}

export async function postGroupUrl(roomId: string, url: string) {
    return await fetch(`${BASE_URL}/api/voice?roomId=${roomId}`, {
        method: "POST",
        body: JSON.stringify({
            url
        }),
        headers: {
            "Content-type": "application/json"
        }
    })
}