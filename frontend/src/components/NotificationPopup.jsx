import React, { useEffect } from "react";
import { notificationStore } from "../utils/store";

const NotificationPopup = () => {
  const { notifications, removeNotification, pendingRequests } =
    notificationStore();

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0 && pendingRequests.size === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {/* Pending Requests */}
      {Array.from(pendingRequests).map((requestId) => (
        <div
          key={requestId}
          className="bg-white rounded-lg shadow-lg border-l-4 border-l-blue-500 p-4 max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100">
                <svg
                  className="w-5 h-5 text-blue-600 animate-spin"
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
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  Pair Request Sent
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Waiting for device to respond...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm animate-slide-in-right ${
            notification.isAccepted ? "border-l-green-500" : "border-l-red-500"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  notification.isAccepted ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {notification.type === "file_sent" ||
                notification.type === "file_downloaded" ||
                notification.type === "text_copied" ? (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                ) : notification.isAccepted ? (
                  <svg
                    className="w-5 h-5 text-green-600"
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
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.type === "file_sent"
                    ? "File Sent Successfully"
                    : notification.type === "file_downloaded"
                    ? "File Downloaded Successfully"
                    : notification.type === "text_copied"
                    ? "Text Copied Successfully"
                    : notification.isAccepted
                    ? "Pair Request Accepted"
                    : "Pair Request Declined"}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.type === "file_sent"
                    ? notification.message
                    : notification.type === "file_downloaded"
                    ? notification.message
                    : notification.type === "text_copied"
                    ? notification.message
                    : notification.isAccepted
                    ? "Your device is now paired successfully!"
                    : "Your pair request was declined by the device."}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
