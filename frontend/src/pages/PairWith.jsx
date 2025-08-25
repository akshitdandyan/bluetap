import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import getIpAddress from "../utils/getIpAddress";
import DeviceDetector from "device-detector-js";
import axiosInstance from "../utils/axios";
import {
  metaInfoStore,
  notificationStore,
  clientSocketStore,
} from "../utils/store";

const PairWith = () => {
  const { deviceToken } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");
  const hasProcessed = useRef(false);
  const initFunctionDone = useRef(false);

  console.log("PairWith - deviceToken:", deviceToken);

  // Get connection status and uniqueRandomId from stores
  const isConnected = clientSocketStore((s) => s.isConnected);
  const uniqueRandomId = metaInfoStore((s) => s.uniqueRandomId);
  const setSocketInstance = clientSocketStore((s) => s.setSocketInstance);
  const addSocketEvents = clientSocketStore((s) => s.addSocketEvents);

  console.log(
    "PairWith - isConnected:",
    isConnected,
    "uniqueRandomId:",
    uniqueRandomId
  );

  // Initialize socket connection (same as Home page)
  const initSocket = async () => {
    if (initFunctionDone.current) return;
    initFunctionDone.current = true;

    try {
      const ipAddress = await getIpAddress();
      const deviceDetector = new DeviceDetector();
      const device = deviceDetector.parse(navigator.userAgent);
      const deviceInfo =
        `${device.device.brand}/${device.device.model}/${device.os.name}`.replace(
          "//",
          "/"
        );

      const serverUrl = import.meta.env.VITE_SERVER_URL;
      console.log("PairWith - Initializing socket with serverUrl:", serverUrl);

      const newSocketInstance = io(serverUrl, {
        query: {
          ip: ipAddress,
          brand: deviceInfo,
          _uniqueRandomId: localStorage.getItem("_uniqueRandomId") || "",
        },
      });

      setSocketInstance(newSocketInstance);
      addSocketEvents(newSocketInstance);
      console.log("PairWith - Socket initialized");
    } catch (error) {
      console.error("PairWith - Error initializing socket:", error);
    }
  };

  useEffect(() => {
    initSocket();
  }, []);

  useEffect(() => {
    const handlePairRequest = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        console.log("PairWith - Already processed, skipping");
        return;
      }

      console.log("PairWith - Starting pair request process");

      try {
        // Wait for the app to be connected and have a uniqueRandomId
        let attempts = 0;
        const maxAttempts = 30; // Wait up to 30 seconds

        console.log("PairWith - Waiting for initialization...");

        // Use a polling approach instead of relying on reactive state
        while (attempts < maxAttempts) {
          const currentIsConnected = clientSocketStore.getState().isConnected;
          const currentUniqueRandomId = metaInfoStore.getState().uniqueRandomId;

          console.log(
            `PairWith - Attempt ${
              attempts + 1
            }: isConnected=${currentIsConnected}, uniqueRandomId=${currentUniqueRandomId}`
          );

          if (currentIsConnected && currentUniqueRandomId) {
            console.log("PairWith - App initialized, sending pair request...");

            // Add pending request notification
            notificationStore
              .getState()
              .addPendingRequest(currentUniqueRandomId);

            // Send pair request
            const response = await axiosInstance.post("/send-pair-request", {
              uniqueRandomId: deviceToken,
              senderDeviceUniqueRandomId: currentUniqueRandomId,
            });

            console.log("PairWith - Pair request response:", response.data);

            // Mark as processed
            hasProcessed.current = true;

            // Redirect to home page after successful request
            setTimeout(() => {
              navigate("/");
            }, 1500);

            return; // Exit the function
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        // If we get here, we've timed out
        console.log("PairWith - Initialization timeout");
        setError(
          "App initialization timeout. Please refresh the page and try again."
        );
        hasProcessed.current = true;
      } catch (error) {
        console.error("PairWith - Error sending pair request:", error);
        setError(
          "Failed to send pair request. The device might be offline or the connection code is invalid."
        );

        // Remove pending request
        const currentUniqueRandomId = metaInfoStore.getState().uniqueRandomId;
        if (currentUniqueRandomId) {
          notificationStore
            .getState()
            .removePendingRequest(currentUniqueRandomId);
        }

        hasProcessed.current = true;
      } finally {
        console.log("PairWith - Setting isProcessing to false");
        setIsProcessing(false);
      }
    };

    if (deviceToken && !hasProcessed.current) {
      console.log("PairWith - Calling handlePairRequest");
      handlePairRequest();
    }
  }, [deviceToken, navigate]); // Remove isConnected and uniqueRandomId from dependencies

  console.log(
    "PairWith - Render - isProcessing:",
    isProcessing,
    "error:",
    error
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Connection Failed
            </h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isProcessing ? "Connecting to Device" : "Connection Request Sent"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isProcessing
              ? "Sending connection request..."
              : "Redirecting to home page..."}
          </p>
          {!isProcessing && (
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
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
                <span className="text-sm text-green-700 font-medium">
                  Connection request sent successfully!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PairWith;
