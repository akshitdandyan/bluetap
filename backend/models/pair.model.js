import mongoose from "mongoose";

const pairSchema = new mongoose.Schema(
  {
    senderDeviceUniqueRandomId: {
      type: String,
      required: true,
    },
    receiverDeviceUniqueRandomId: {
      type: String,
      required: true,
    },
    senderDeviceUsername: String,
    receiverDeviceUsername: String,
    senderDeviceBrand: String,
    receiverDeviceBrand: String,
    senderDeviceNickname: String, // Custom nickname for sender device
    receiverDeviceNickname: String, // Custom nickname for receiver device
  },
  {
    timestamps: true,
  }
);

const Pair = mongoose.model("Pair", pairSchema);

export default Pair;
