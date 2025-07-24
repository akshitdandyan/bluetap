import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import getIpAddress from "../utils/getIpAddress";
import DeviceDetector from "device-detector-js";
import QRScanner from "../components/QRScanner";
import PairedDevicesList from "../components/PairedDevicesList";
import DeviceHeader from "../components/DeviceHeader";
import { clientSocketStore, metaInfoStore } from "../utils/store";

const Home = () => {
  const [ip, setIp] = useState("");
  const [brand, setBrand] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQRValue, setScannedQRValue] = useState("");

  const socketInstance = clientSocketStore((s) => s.socketInstance);
  const setSocketInstance = clientSocketStore((s) => s.setSocketInstance);
  const addSocketEvents = clientSocketStore((s) => s.addSocketEvents);
  const isConnected = clientSocketStore((s) => s.isConnected);

  const qrCodeUrl = metaInfoStore((s) => s.qrCodeUrl);
  const uniqueRandomId = metaInfoStore((s) => s.uniqueRandomId);

  const initFunctionDone = useRef(false);

  async function init() {
    if (initFunctionDone.current) return;
    initFunctionDone.current = true;
    try {
      const ipAddress = await getIpAddress();
      setIp(ipAddress);

      const deviceDetector = new DeviceDetector();
      const device = deviceDetector.parse(navigator.userAgent);
      const deviceInfo =
        `${device.device.brand}/${device.device.model}/${device.os.name}`.replace(
          "//",
          "/"
        );
      setBrand(deviceInfo ? deviceInfo : "DEVICE");

      const serverUrl = import.meta.env.VITE_SERVER_URL;
      console.log("serverUrl", serverUrl);

      const newSocketInstance = io(serverUrl, {
        query: {
          ip: ipAddress,
          brand: deviceInfo,
          _uniqueRandomId: localStorage.getItem("_uniqueRandomId") || "",
        },
      });

      setSocketInstance(newSocketInstance);
      addSocketEvents(newSocketInstance);
    } catch (error) {
      console.error("Error initializing:", error);
    }
  }

  useEffect(() => {
    init();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Device Header */}
      <DeviceHeader brand={brand} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Connection Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-semibold ${
                    isConnected ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {isConnected ? "Ready to share" : "Connecting..."}
              </div>
            </div>

            {/* QR Code Section */}
            {isConnected && qrCodeUrl && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-8 border border-emerald-200/50 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
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
                    <p className="text-sm text-emerald-700 font-semibold uppercase tracking-wider">
                      Your QR Code
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 inline-block shadow-lg border border-emerald-200/50">
                    <img
                      src={qrCodeUrl}
                      alt="Device QR Code"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>

                  <p className="text-sm text-slate-600 mt-4 font-medium">
                    Scan this QR code to connect another device
                  </p>
                </div>
              </div>
            )}

            {/* Paired Devices */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Connected Devices
              </h3>
              <PairedDevicesList />
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* QR Scanner Button */}
              <button
                onClick={() => setShowQRScanner(true)}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-6 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5 mr-3"
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
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              Real-time device connectivity platform
            </p>
          </div>
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
