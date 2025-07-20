import axios from "./axios";

async function getIpAddress() {
  const response = await axios.get("https://ip.guide");
  return response.data.ip;
}

export default getIpAddress;
