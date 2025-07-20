import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import getIpAddress from "../utils/getIpAddress";
import DeviceDetector from "device-detector-js";
import QRScanner from "../components/QRScanner";

const Home = () => {
  const [ip, setIp] = useState("");
  const [brand, setBrand] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [uniqueUsername, setUniqueUsername] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQRValue, setScannedQRValue] = useState("");

  async function init() {
    try {
      const ipAddress = await getIpAddress();
      setIp(ipAddress);

      const deviceDetector = new DeviceDetector();
      const device = deviceDetector.parse(navigator.userAgent);
      const deviceInfo = `${device.device.brand}/${device.device.model}/${device.os.name}`;
      setBrand(deviceInfo);

      const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
        query: {
          ip: ipAddress,
          brand: deviceInfo,
        },
      });

      socketInstance.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      socketInstance.on("qrCodeImageUrl", (qrUrl) => {
        console.log("Received QR code URL");
        setQrCodeUrl(qrUrl);
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error("Error initializing:", error);
    }
  }

  useEffect(() => {
    init();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleQRCodeDetected = (qrValue) => {
    setScannedQRValue(qrValue);
    setShowQRScanner(false);
    console.log("QR Code detected:", qrValue);
    // Here you can add logic to handle the scanned QR code
    // For example, connect to the device using the QR code value
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            BlueTap
          </h1>
          <p className="text-gray-600 text-sm">Device Connection Hub</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Connection Status */}
          <div className="flex items-center justify-center mb-6">
            <div
              className={`w-4 h-4 rounded-full mr-3 ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`font-medium ${
                isConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Device Info */}
          <div className="space-y-4 mb-6">
            {/* IP Address */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    IP Address
                  </p>
                  <p className="text-lg font-mono font-semibold text-gray-800">
                    {ip || "Loading..."}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Device Brand */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Device Info
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {brand || "Loading..."}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
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
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {isConnected && qrCodeUrl && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Device QR Code
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 inline-block shadow-sm border border-green-200">
                  <img
                    src={qrCodeUrl}
                    alt="Device QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Scan this QR code to connect another device
                </p>
              </div>
            </div>
          )}

          {/* QR Scanner Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowQRScanner(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
              Scan QR Code
            </button>
          </div>

          {/* Scanned QR Result */}
          {scannedQRValue && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Scanned QR Code
                  </p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {scannedQRValue}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isConnected
                ? "Your device is connected to the BlueTap network"
                : "Connecting to BlueTap network..."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">Real-time device monitoring</p>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onQRCodeDetected={handleQRCodeDetected}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};

export default Home;
