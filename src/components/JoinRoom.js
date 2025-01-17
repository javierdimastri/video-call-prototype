'use client'
import { roboto } from "@/ui/fonts";
import Link from "next/link";
import { useState } from "react";

export default function JoinRoom() {
  const [roomID, setRoomID] = useState("");
  const [userId, setUserId] = useState("");

  return (
    <div className="text-center w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />
      </div>
      <Link href={`/video-call?roomId=${roomID}&userId=${userId}`} className={`bg-buttonBlue w-60 text-white py-2 px-4 rounded hover:bg-blue-600 ${roboto.className} inline-block`}>
        Join Room
      </Link>
    </div>
  );
}
