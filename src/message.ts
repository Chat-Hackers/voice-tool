import { getGroupUrl } from "./duckdb";
import { MatrixEvent } from "../types";

const { dashboard_url } = process.env;

function getContentUrl(mxcUrl: string) {
  return `${dashboard_url}/api/content?mxcUrl=${mxcUrl}`
}

const handleMessage = async (event: MatrixEvent) => {
  const messageType = event.content.msgtype;

  if (messageType === "m.audio") {
    const groupUrl = await getGroupUrl(event.room_id);

    if (groupUrl) {
      fetch(groupUrl.url, {
        body: JSON.stringify({
          source: "chathackers",
          sender: event.sender,
          group: event.room_id,
          type: "audio",
          content: getContentUrl(event.content.url)
        }),
        method: "POST"
      })
    }
  }
};

export default handleMessage;
