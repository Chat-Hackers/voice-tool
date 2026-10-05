import { MatrixEvent } from "../types";
import { insertGroupUrl, deleteGroupUrl } from "./duckdb";
import { LinkifyIt } from 'linkify-it';

const linkify = new LinkifyIt({ fuzzyLink: true });

async function assignUrl(event: MatrixEvent) {
    const message = event.content.body;

    const urls = linkify.match(message);

    if (urls) {
        const url = urls[0].url;

        return {
            message: `React to this message with 👍 to confirm forwarding voice messages to ${url}`,
            context: {
                url,
                group_id: event.room_id
            }
        }
    } else {
        return "no url detected in message"
    }
}

async function confirmUrl(event, context) {
    if (context.url) {
        await deleteGroupUrl(event.room_id);
        await insertGroupUrl(event.room_id, context.url);
        return `Voice messages will be forwarded to ${context.url}`
    }

    return;
}


export default function handleReaction(event: MatrixEvent) {
    const reactionInfo = event.content["m.relates_to"];
    const eventFromReaction = event.prevEvent;
    const { context } = eventFromReaction.content;

    const reactionEmoji = reactionInfo.key.trim();

    if (reactionEmoji.includes("🎤")) {
        return assignUrl(eventFromReaction);
    }

    if (reactionEmoji.includes("👍")) {
        return confirmUrl(eventFromReaction, context);
    }

    return;
}