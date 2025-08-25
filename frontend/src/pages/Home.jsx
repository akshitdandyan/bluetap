import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import getIpAddress from "../utils/getIpAddress";
import DeviceDetector from "device-detector-js";
import QRScanner from "../components/QRScanner";
import ManualCodeEntry from "../components/ManualCodeEntry";
import PairedDevicesList from "../components/PairedDevicesList";
import DeviceHeader from "../components/DeviceHeader";
import { clientSocketStore, metaInfoStore } from "../utils/store";

const Home = () => {
  const [ip, setIp] = useState("");
  const [brand, setBrand] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualCodeEntry, setShowManualCodeEntry] = useState(false);
  const [scannedQRValue, setScannedQRValue] = useState("");

  const socketInstance = clientSocketStore((s) => s.socketInstance);
  const setSocketInstance = clientSocketStore((s) => s.setSocketInstance);
  const addSocketEvents = clientSocketStore((s) => s.addSocketEvents);
  const isConnected = clientSocketStore((s) => s.isConnected);

  const qrCodeUrl = metaInfoStore((s) => s.qrCodeUrl);
  const uniqueRandomId = metaInfoStore((s) => s.uniqueRandomId);
  const connectionCode = metaInfoStore((s) => s.connectionCode);

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
      <div className="container mx-auto px-4 py-8">
        {/* Desktop: Center content with max-width, Mobile: Full width */}
        <div className="max-w-4xl mx-auto">
          {/* Device Header */}
          <DeviceHeader />

          {/* Main Content */}
          <div className="mt-8">
            {/* Loading State */}
            {!isConnected && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Connecting to BlueTap
                </h2>
                <p className="text-slate-600">
                  Please wait while we establish your connection...
                </p>
              </div>
            )}

            {/* Action Buttons Section - Most Important First */}
            {isConnected && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                  Connect to Another Device
                </h2>

                {/* Desktop: Side by side buttons, Mobile: Stacked */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* QR Scanner Button */}
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-6 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

                  {/* Manual Code Entry Button */}
                  <button
                    onClick={() => setShowManualCodeEntry(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Enter Code Manually
                  </button>
                </div>
              </div>
            )}

            {/* Connection Options Section - Only show if connected */}
            {isConnected && (connectionCode || qrCodeUrl) && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                  Your Connection Options
                </h2>

                {/* Desktop: Side by side cards, Mobile: Stacked */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Connection Code Card */}
                  {connectionCode && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mr-2">
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-blue-700 font-semibold uppercase tracking-wider">
                            Connection Code
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 inline-block shadow-md border border-blue-200/50 mb-3">
                          <div className="text-3xl font-bold text-blue-600 tracking-widest">
                            {connectionCode}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          Share this code with another device
                        </p>
                      </div>
                    </div>
                  )}

                  {/* QR Code Card */}
                  {qrCodeUrl && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/50">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center mr-2">
                            <svg
                              className="w-4 h-4 text-emerald-600"
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
                            QR Code
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 inline-block shadow-md border border-emerald-200/50">
                          <img
                            src={qrCodeUrl}
                            alt="Device QR Code"
                            className="w-32 h-32 mx-auto"
                          />
                        </div>

                        <p className="text-xs text-slate-600 mt-3 font-medium">
                          Scan this QR code to connect
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connected Devices Section */}
            {isConnected && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                  Connected Devices
                </h2>
                <PairedDevicesList />
              </div>
            )}
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

      {/* Manual Code Entry Modal */}
      {showManualCodeEntry && (
        <ManualCodeEntry onClose={() => setShowManualCodeEntry(false)} />
      )}
    </div>
  );
};

export default Home;
