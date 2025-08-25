import React from "react";
import { pairRequestPopUpStore } from "../utils/store";
import axiosInstance from "../utils/axios";
import NicknameSelectionModal from "./NicknameSelectionModal";

const PairRequestPopup = () => {
  const {
    pairRequests,
    removePairRequest,
    nicknameSelection,
    setNicknameSelection,
    clearNicknameSelection,
  } = pairRequestPopUpStore();

  const handleReply = async (request, isAccepted) => {
    try {
      removePairRequest(request.senderUniqueRandomId);

      // Send the pair request reply
      await axiosInstance.post("/pair-request-reply", {
        isAccepted,
        uniqueRandomId: localStorage.getItem("_uniqueRandomId"),
        senderDeviceUniqueRandomId: request.senderUniqueRandomId,
      });
    } catch (error) {
      console.error("Error replying to pair request:", error);
    }
  };

  if (pairRequests.length === 0 && !nicknameSelection) {
    return null;
  }

  return (
    <>
      {/* Pair Request Popups */}
      {pairRequests.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          {pairRequests.map((request, index) => (
            <div
              key={request.senderUniqueRandomId}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-3 animate-slide-up"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pair Request
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{request.senderBrand}</span>
                    <span className="mx-2">•</span>
                    <span>{request.senderUsername}</span>
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleReply(request, true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReply(request, false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nickname Selection Modal */}
      {nicknameSelection && (
        <NicknameSelectionModal
          deviceInfo={nicknameSelection.deviceInfo}
          onConfirm={nicknameSelection.onConfirm}
          onClose={nicknameSelection.onClose}
        />
      )}
    </>
  );
};

export default PairRequestPopup;
