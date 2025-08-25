import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT as string,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});

const BUCKET_NAME = "bluetap";

async function getSignedUrl(fileName: string) {
  const url = await minioClient.presignedGetObject(
    BUCKET_NAME,
    fileName,
    2 * 60 * 60 // 1 hour
  );
  return url;
}

export async function uploadFileToMinio(fileName: string, buffer: Buffer) {
  try {
    // check if file size is less than 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error("File size is greater than 10MB");
    }

    const res = await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      buffer,
      buffer.length
    );
    console.log("[uploadFileToMinio] res -", res);
    const url = await getSignedUrl(fileName);
    console.log("[uploadFileToMinio] url -", url);
    return { url, fileName };
  } catch (error) {
    console.log("Error uploading file to minio -", error);
    return { url: "", fileName: "" };
  }
}

export default minioClient;
