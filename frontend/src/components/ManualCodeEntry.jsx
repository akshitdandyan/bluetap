import React, { useState } from "react";
import axiosInstance from "../utils/axios";
import { metaInfoStore, notificationStore } from "../utils/store";

const ManualCodeEntry = ({ onClose }) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 4) {
      setError("Please enter a complete 4-digit code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const senderDeviceUniqueRandomId =
        metaInfoStore.getState().uniqueRandomId;

      // Add pending request notification
      notificationStore
        .getState()
        .addPendingRequest(senderDeviceUniqueRandomId);

      const response = await axiosInstance.post("/send-pair-request-by-code", {
        connectionCode: fullCode,
        senderDeviceUniqueRandomId,
      });

      if (response.data.requestSent) {
        onClose();
      } else {
        setError("Invalid connection code. Please check and try again.");
        notificationStore
          .getState()
          .removePendingRequest(senderDeviceUniqueRandomId);
      }
    } catch (error) {
      console.error("Error sending pair request:", error);
      setError("Failed to send connection request. Please try again.");
      notificationStore
        .getState()
        .removePendingRequest(metaInfoStore.getState().uniqueRandomId);
      notificationStore.getState().addNotification({
        message: "Failed to send connection request. Please try again.",
        type: "error",
        errorType: "NETWORK_ERROR",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Enter Connection Code
          </h3>
          <p className="text-sm text-gray-600">
            Enter the 4-digit code from the device you want to connect to
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex justify-center space-x-3 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="0"
              />
            ))}
          </div>

          {error && (
            <div className="text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isCodeComplete || isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Connecting...
              </div>
            ) : (
              "Connect"
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                How to connect:
              </p>
              <p className="text-xs text-blue-700">
                1. Ask the other device for their 4-digit connection code
                <br />
                2. Enter the code above
                <br />
                3. Wait for them to accept your connection request
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCodeEntry;
