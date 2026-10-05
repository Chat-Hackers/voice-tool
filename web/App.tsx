import "./App.css";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { getGroupUrl, postGroupUrl } from "./requests";

export default function App() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [currentGroupUrl, setCurrentGroupUrl] = useState("");
  const [newGroupUrl, setNewGroupUrl] = useState("");

  async function loadGroupUrl(roomId: string) {
    const groupUrl = await getGroupUrl(roomId);
    setCurrentGroupUrl(groupUrl.url);
  }

  useEffect(() => {
    if (roomId) {
      loadGroupUrl(roomId);
    }
  }, []);

  async function updateGroupUrl() {
    if (roomId) {
      await postGroupUrl(roomId, newGroupUrl);
      loadGroupUrl(roomId);
    }
  }

  return (
    <>
      <h1>Voice Forwarding Tool</h1>
      <h3>
        Use the text box below to set the url voice messages will be forward to.
      </h3>
      <p>The current url is:</p>
      <p>{currentGroupUrl}</p>
      <div id="change-container">
        <textarea
          value={newGroupUrl}
          onChange={(e) => setNewGroupUrl(e.target.value)}
        ></textarea>
        <button onClick={updateGroupUrl}>Update</button>
      </div>
    </>
  );
}
