import React, { useState } from "react";
import { metaInfoStore } from "../utils/store";
import FileUploadModal from "./FileUploadModal";
import TextShareModal from "./TextShareModal";
import ShareOptionsSheet from "./ShareOptionsSheet";

const PairedDevicesList = () => {
  const pairedDevices = metaInfoStore((s) => s.pairedDevices);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showTextShare, setShowTextShare] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Generate consistent colors based on username
  const getDeviceColor = (username) => {
    const colors = [
      "bg-gradient-to-br from-red-500 to-red-600",
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-emerald-500 to-emerald-600",
      "bg-gradient-to-br from-amber-500 to-amber-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-cyan-500 to-cyan-600",
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
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
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
        </div>
        <p className="text-slate-500 font-medium">No devices connected yet</p>
        <p className="text-sm text-slate-400 mt-1">Scan a QR code to connect</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          <svg
            className="w-5 h-5 mr-3 text-slate-600"
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
          Connected Devices
        </h3>
        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {pairedDevices.length}
        </span>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-4 -mx-2 px-2">
        {pairedDevices.map((device, index) => (
          <div
            key={device._uniqueRandomId || index}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div
              className="cursor-pointer hover:scale-105 transition-all duration-300 group"
              onClick={() => {
                setSelectedDevice(device);
                setShowShareOptions(true);
              }}
            >
              {/* Device Avatar */}
              <div className="relative mb-3">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${getDeviceColor(
                    device.uniqueUsername
                  )} ${
                    !device.isOnline ? "opacity-60" : ""
                  } group-hover:shadow-xl transition-all duration-300`}
                >
                  {device.uniqueUsername.charAt(0).toUpperCase()}
                </div>

                {/* Online/Offline indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 border-3 border-white rounded-full shadow-lg ${
                    device.isOnline ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                ></div>
              </div>

              {/* Device Info */}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-24 mb-1">
                  {device.uniqueUsername}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-24">
                  {device.isOnline ? getBrandName(device.brand) : "Offline"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Options Sheet */}
      {selectedDevice && showShareOptions && (
        <ShareOptionsSheet
          device={selectedDevice}
          onClose={() => {
            setSelectedDevice(null);
            setShowShareOptions(false);
          }}
          onSelectFile={() => {
            setShowShareOptions(false);
            setShowFileShare(true);
          }}
          onSelectText={() => {
            setShowShareOptions(false);
            setShowTextShare(true);
          }}
        />
      )}

      {/* File Upload Modal */}
      {selectedDevice && showFileShare && (
        <FileUploadModal
          device={selectedDevice}
          onClose={() => {
            setSelectedDevice(null);
            setShowFileShare(false);
          }}
          onFileSent={(fileName) => {
            console.log(
              `File ${fileName} sent successfully to ${selectedDevice.uniqueUsername}`
            );
            setSelectedDevice(null);
            setShowFileShare(false);
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
