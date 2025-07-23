import React from "react";
import { metaInfoStore, clientSocketStore } from "../utils/store";

const DeviceHeader = () => {
  const uniqueRandomId = metaInfoStore((s) => s.uniqueRandomId);
  const username = metaInfoStore((s) => s.username);
  const isConnected = clientSocketStore((s) => s.isConnected);

  // Get username from store or generate from uniqueRandomId
  const getUsername = () => {
    if (username) return username;
    if (!uniqueRandomId) return "Loading...";

    // Use the last 4 characters of the uniqueRandomId to create a username
    const shortId = uniqueRandomId.slice(-4);
    return `Device-${shortId}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">{getUsername()}</h1>
            <p className="text-xs text-blue-100">Your Device</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}
          ></div>
          <span className="text-xs text-blue-100">
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceHeader;
