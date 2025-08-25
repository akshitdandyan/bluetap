import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    uniqueUsername: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    _uniqueRandomId: {
      type: String,
      required: true,
    },
    connectionCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
