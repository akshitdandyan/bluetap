import React, { useState } from "react";
import { metaInfoStore } from "../utils/store";
import FileUploadModal from "./FileUploadModal";
import TextShareModal from "./TextShareModal";

const PairedDevicesList = () => {
  const pairedDevices = metaInfoStore((s) => s.pairedDevices);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showTextShare, setShowTextShare] = useState(false);

  // Generate consistent colors based on username
  const getDeviceColor = (username) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    // Use username to generate consistent color
    const hash = username.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Extract brand name from device info
  const getBrandName = (brand) => {
    if (!brand) return "Unknown";
    const parts = brand.split("/");
    return parts[0] || "Unknown";
  };

  if (!pairedDevices || pairedDevices.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg
          className="w-4 h-4 mr-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Paired Devices ({pairedDevices.length})
      </h3>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {pairedDevices.map((device, index) => (
          <div
            key={device._uniqueRandomId || index}
            className="flex-shrink-0 flex flex-col items-center relative group"
          >
            <div
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedDevice(device)}
            >
              {/* Device Avatar */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg ${getDeviceColor(
                    device.uniqueUsername
                  )} ${!device.isOnline ? "opacity-60" : ""}`}
                >
                  {device.uniqueUsername.charAt(0).toUpperCase()}
                </div>

                {/* Online/Offline indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                    device.isOnline ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
              </div>

              {/* Device Info */}
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                  {device.uniqueUsername}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-20">
                  {device.isOnline ? getBrandName(device.brand) : "Offline"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTextShare(true);
                  setSelectedDevice(device);
                }}
                className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                title="Share Text"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* File Upload Modal */}
      {selectedDevice && !showTextShare && (
        <FileUploadModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onFileSent={(fileName) => {
            console.log(
              `File ${fileName} sent successfully to ${selectedDevice.uniqueUsername}`
            );
            setSelectedDevice(null);
          }}
        />
      )}

      {/* Text Share Modal */}
      {selectedDevice && showTextShare && (
        <TextShareModal
          device={selectedDevice}
          onClose={() => {
            setSelectedDevice(null);
            setShowTextShare(false);
          }}
          onTextSent={(text) => {
            console.log(
              `Text sent successfully to ${selectedDevice.uniqueUsername}`
            );
            setSelectedDevice(null);
            setShowTextShare(false);
          }}
        />
      )}
    </div>
  );
};

export default PairedDevicesList;
