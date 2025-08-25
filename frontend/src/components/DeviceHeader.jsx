import React, { useState, useEffect } from "react";
import { metaInfoStore, clientSocketStore } from "../utils/store";
import DeviceDetector from "device-detector-js";

const DeviceHeader = () => {
  const uniqueRandomId = metaInfoStore((s) => s.uniqueRandomId);
  const username = metaInfoStore((s) => s.username);
  const isConnected = clientSocketStore((s) => s.isConnected);
  const [brand, setBrand] = useState("");

  useEffect(() => {
    const getDeviceInfo = () => {
      try {
        const deviceDetector = new DeviceDetector();
        const device = deviceDetector.parse(navigator.userAgent);
        const deviceInfo =
          `${device.device.brand}/${device.device.model}/${device.os.name}`.replace(
            "//",
            "/"
          );
        setBrand(deviceInfo || "Unknown Device");
      } catch (error) {
        console.error("Error getting device info:", error);
        setBrand("Unknown Device");
      }
    };

    getDeviceInfo();
  }, []);

  // Get username from store or generate from uniqueRandomId
  const getUsername = () => {
    if (username) return username;
    if (!uniqueRandomId) return "Loading...";

    // Use the last 4 characters of the uniqueRandomId to create a username
    const shortId = uniqueRandomId.slice(-4);
    return `Device-${shortId}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg
                className="w-5 h-5 text-white"
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
              <h1 className="text-xl font-bold text-slate-900">
                {getUsername()}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {brand || "Loading device info..."}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center mr-3">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent tracking-tight">
                  BlueTap
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceHeader;
