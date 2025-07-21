import { create } from "zustand";

export const metaInfoStore = create((set) => ({
  uniqueRandomId: "",
  qrCodeUrl: "",
  setQrCodeUrl: (qrCodeUrl) => set({ qrCodeUrl }),
  setUniqueRandomId: (uniqueRandomId) => set({ uniqueRandomId }),
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
      set({ isConnected: true });
    });

    socketInstance.on("PAIR_REQUEST", (data) => {
      console.log("Received PAIR_REQUEST", data);
      // Add the pair request to the popup store
      pairRequestPopUpStore.getState().addPairRequest(data);
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
