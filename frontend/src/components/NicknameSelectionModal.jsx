import React, { useState } from "react";
import { metaInfoStore } from "../utils/store";

const NicknameSelectionModal = ({ deviceInfo, onConfirm, onClose }) => {
  const [nickname, setNickname] = useState("");
  const [useDefault, setUseDefault] = useState(true); // Default to using default nickname
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const finalNickname = useDefault
        ? deviceInfo.targetDeviceUsername || deviceInfo.senderUsername
        : nickname;
      await onConfirm(finalNickname);
      // Close the modal after successful confirmation
      onClose();
    } catch (error) {
      console.error("Error setting nickname:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDefault = () => {
    setUseDefault(true);
    setNickname("");
  };

  const handleCustomNickname = () => {
    setUseDefault(false);
    setNickname("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Set Device Nickname
          </h3>
          <p className="text-sm text-gray-600">
            Choose how you'd like to identify this device in your list
          </p>
        </div>

        {/* Device Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
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
              <p className="text-sm font-medium text-gray-900">
                {deviceInfo.targetDeviceBrand || deviceInfo.senderBrand}
              </p>
              <p className="text-xs text-gray-500">
                Default:{" "}
                {deviceInfo.targetDeviceUsername || deviceInfo.senderUsername}
              </p>
            </div>
          </div>
        </div>

        {/* Nickname Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Use Default */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              useDefault
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={handleUseDefault}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  useDefault ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}
              >
                {useDefault && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Keep Default Nickname
                </p>
                <p className="text-sm text-gray-500">
                  Use "
                  {deviceInfo.targetDeviceUsername || deviceInfo.senderUsername}
                  "
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Custom Nickname */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              !useDefault
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={handleCustomNickname}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  !useDefault
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {!useDefault && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Custom Nickname</p>
                <p className="text-sm text-gray-500">
                  Choose your own name for this device
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Nickname Input */}
        {!useDefault && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter a nickname..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 20 characters</p>
          </div>
        )}

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
            onClick={handleConfirm}
            disabled={isSubmitting || (!useDefault && !nickname.trim())}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameSelectionModal;
