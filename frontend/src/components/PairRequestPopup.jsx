import React from "react";
import { pairRequestPopUpStore } from "../utils/store";

const PairRequestPopup = () => {
  const { pairRequests, removePairRequest } = pairRequestPopUpStore();

  const handleAccept = (request) => {
    console.log("Accepting pair request from:", request.senderUniqueUsername);
    // TODO: Implement accept logic here
    removePairRequest(request.senderUniqueRandomId);
  };

  const handleDecline = (request) => {
    console.log("Declining pair request from:", request.senderUniqueUsername);
    // TODO: Implement decline logic here
    removePairRequest(request.senderUniqueRandomId);
  };

  if (pairRequests.length === 0) {
    return null;
  }

  return (
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
                <span>{request.senderUniqueUsername}</span>
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleAccept(request)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(request)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PairRequestPopup;
