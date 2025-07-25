import { create } from "zustand";

export const metaInfoStore = create((set) => ({
  uniqueRandomId: "",
  qrCodeUrl: "",
  pairedDevices: [],
  username: "",
  setPairedDevices: (pairedDevices) => set({ pairedDevices }),
  setQrCodeUrl: (qrCodeUrl) => set({ qrCodeUrl }),
  setUniqueRandomId: (uniqueRandomId) => set({ uniqueRandomId }),
  setUsername: (username) => set({ username }),
}));

export const clientSocketStore = create((set) => ({
  socketInstance: null,
  isConnected: false,
  setSocketInstance: (socketInstance) => set({ socketInstance }),
  addSocketEvents: (socketInstance) => {
    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      set({ isConnected: false });
    });

    socketInstance.on("QR_CODE_IMAGE_URL", (qrCodeUrl) => {
      console.log("Received QR code URL");
      metaInfoStore.getState().setQrCodeUrl(qrCodeUrl);
    });

    socketInstance.on("DEVICE_CONNECTED", (data) => {
      console.log("Received DEVICE_CONNECTED", data);
      metaInfoStore.getState().setUniqueRandomId(data.uniqueRandomId);
      metaInfoStore.getState().setUsername(data.username);
      localStorage.setItem("_uniqueRandomId", data.uniqueRandomId);
      set({ isConnected: true });
    });

    socketInstance.on("PAIRED_DEVICES", (data) => {
      console.log("Received PAIRED_DEVICES", data);
      // Add the paired devices to the popup store
      metaInfoStore.getState().setPairedDevices(data);
    });

    socketInstance.on("PAIR_REQUEST", (data) => {
      console.log("Received PAIR_REQUEST", data);
      // Add the pair request to the popup store
      pairRequestPopUpStore.getState().addPairRequest(data);
    });

    socketInstance.on("PAIR_REQUEST_REPLY", (data) => {
      console.log("Received PAIR_REQUEST_REPLY", data);
      // Remove the pending request
      notificationStore
        .getState()
        .removePendingRequest(data.senderDeviceUniqueRandomId);

      // Only add notification for successful replies
      if (data.isAccepted) {
        notificationStore.getState().addNotification({
          message: "Device paired successfully!",
          type: "success",
        });
      }
    });

    socketInstance.on("PAIR_REQUEST_ERROR", (data) => {
      console.log("Received PAIR_REQUEST_ERROR", data);
      // Remove pending request and add error notification
      notificationStore
        .getState()
        .removePendingRequest(data.senderDeviceUniqueRandomId);
      notificationStore.getState().addNotification({
        message: data.message,
        type: "error",
        errorType: data.errorType,
      });
    });

    socketInstance.on("NEW_FILE_RECEIVED", (data) => {
      console.log("Received NEW_FILE_RECEIVED", data);
      // Set the received file data for the modal
      notificationStore.getState().setReceivedFile({
        fileName: data.fileName,
        url: data.url,
        mime: data.mime,
        fileSize: data.fileSize,
        senderDeviceUniqueRandomId: data.senderDeviceUniqueRandomId,
        senderUsername: data.senderUsername,
        timestamp: new Date(),
      });
    });

    socketInstance.on("NEW_TEXT_RECEIVED", (data) => {
      console.log("Received NEW_TEXT_RECEIVED", data);
      // Set the received text data for the modal
      notificationStore.getState().setReceivedText({
        text: data.text,
        isLink: data.isLink,
        senderDeviceUniqueRandomId: data.senderDeviceUniqueRandomId,
        senderUsername: data.senderUsername,
        timestamp: new Date(),
      });
    });
  },
}));

export const pairRequestPopUpStore = create((set, get) => ({
  pairRequests: [],
  addPairRequest: (request) => {
    const { pairRequests } = get();
    set({ pairRequests: [...pairRequests, request] });
  },
  removePairRequest: (requestId) => {
    const { pairRequests } = get();
    set({
      pairRequests: pairRequests.filter(
        (request) => request.senderUniqueRandomId !== requestId
      ),
    });
  },
}));

export const notificationStore = create((set, get) => ({
  notifications: [],
  pendingRequests: new Set(),
  receivedFile: null,
  receivedText: null,
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
    };
    set({ notifications: [...notifications, newNotification] });
  },
  addPendingRequest: (requestId) => {
    const { pendingRequests } = get();
    const newPendingRequests = new Set(pendingRequests);
    newPendingRequests.add(requestId);
    set({ pendingRequests: newPendingRequests });
  },
  removePendingRequest: (requestId) => {
    const { pendingRequests } = get();
    const newPendingRequests = new Set(pendingRequests);
    newPendingRequests.delete(requestId);
    set({ pendingRequests: newPendingRequests });
  },
  removeNotification: (notificationId) => {
    const { notifications } = get();
    set({
      notifications: notifications.filter(
        (notification) => notification.id !== notificationId
      ),
    });
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
  setReceivedFile: (fileData) => {
    set({ receivedFile: fileData });
  },
  clearReceivedFile: () => {
    set({ receivedFile: null });
  },
  setReceivedText: (textData) => {
    set({ receivedText: textData });
  },
  clearReceivedText: () => {
    set({ receivedText: null });
  },
}));
