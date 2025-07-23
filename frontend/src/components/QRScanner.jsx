import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import axiosInstance from "../utils/axios";
import { metaInfoStore, notificationStore } from "../utils/store";

const QRScanner = ({ onQRCodeDetected, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);

  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera permission...");

      // Try different camera constraints for better compatibility
      const constraints = {
        video: {
          facingMode: "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          aspectRatio: { ideal: 1.7777777778 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log("Camera permission granted, stream:", stream);
      console.log("Stream tracks:", stream.getTracks());

      setHasPermission(true);
      streamRef.current = stream;

      console.log("Video ref:", videoRef.current);

      // Wait for the video element to be available
      const waitForVideo = () => {
        if (videoRef.current) {
          console.log("Video element found, setting up...");
          setupVideo(stream);
        } else {
          console.log("Video element not ready, waiting...");
          setTimeout(waitForVideo, 100);
        }
      };

      waitForVideo();
    } catch (err) {
      console.error("Camera permission error:", err);

      // Try fallback constraints
      try {
        console.log("Trying fallback camera constraints...");
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        console.log("Fallback camera permission granted");
        setHasPermission(true);
        streamRef.current = fallbackStream;

        const waitForVideo = () => {
          if (videoRef.current) {
            console.log("Video element found, setting up fallback...");
            setupVideo(fallbackStream);
          } else {
            console.log("Video element not ready, waiting...");
            setTimeout(waitForVideo, 100);
          }
        };

        waitForVideo();
      } catch (fallbackErr) {
        console.error("Fallback camera also failed:", fallbackErr);
        setError(
          "Camera permission denied. Please allow camera access to scan QR codes."
        );
        setHasPermission(false);
      }
    }
  };

  const setupVideo = (stream) => {
    if (!videoRef.current) {
      console.error("Video ref is still null");
      return;
    }

    console.log("Setting video srcObject...");
    videoRef.current.srcObject = stream;

    // Force video to load and play
    videoRef.current.load();

    // Wait for video to be ready
    videoRef.current.onloadedmetadata = () => {
      console.log(
        "Video metadata loaded, dimensions:",
        videoRef.current.videoWidth,
        "x",
        videoRef.current.videoHeight
      );
      setIsVideoReady(true);

      // Ensure video plays
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video started playing successfully");
            setIsScanning(true);
            isScanningRef.current = true;
            console.log("isScanning set to true");
            startScanning();
          })
          .catch((err) => {
            console.error("Error playing video:", err);
            setError("Failed to start camera. Please try again.");
          });
      }
    };

    // Additional event listeners for debugging
    videoRef.current.oncanplay = () => {
      console.log("Video can play");
    };

    videoRef.current.oncanplaythrough = () => {
      console.log("Video can play through");
    };

    videoRef.current.onerror = (e) => {
      console.error("Video error:", e);
    };
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("Video or canvas ref not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    console.log("Starting scan frame loop...");

    const scanFrame = () => {
      console.log("Scanning frame...", isScanningRef.current);
      if (!isScanningRef.current) {
        console.log("isScanning is false, stopping scan");
        return;
      }
      console.log("isScanning", isScanningRef.current);

      try {
        // Check if video is ready and has data
        if (
          video.readyState === video.HAVE_ENOUGH_DATA &&
          video.videoWidth > 0
        ) {
          console.log(
            "Video ready, scanning frame...",
            video.videoWidth,
            "x",
            video.videoHeight
          );

          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data for QR detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Use jsQR to detect QR codes
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            console.log("QR code detected:", code.data);
            // QR code detected!
            setScannedValue(code.data);
            setIsScanning(false);
            isScanningRef.current = false;
            onQRCodeDetected?.(code.data);

            const senderDeviceUniqueRandomId =
              metaInfoStore.getState().uniqueRandomId;

            // Add pending request notification
            notificationStore
              .getState()
              .addPendingRequest(senderDeviceUniqueRandomId);

            axiosInstance.post("/send-pair-request", {
              uniqueRandomId: code.data,
              senderDeviceUniqueRandomId,
            });

            // Stop the camera stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
            return;
          }
        } else {
          console.log(
            "Video not ready yet, readyState:",
            video.readyState,
            "videoWidth:",
            video.videoWidth
          );
        }

        // Continue scanning
        requestAnimationFrame(scanFrame);
      } catch (err) {
        console.error("Scanning error:", err);
        // Continue scanning even if there's an error
        requestAnimationFrame(scanFrame);
      }
    };

    // Start scanning when video is ready
    if (video.readyState >= video.HAVE_METADATA) {
      scanFrame();
      console.log("Video metadata loaded, starting scan...");
    } else {
      video.addEventListener("loadedmetadata", () => {
        console.log("Video metadata loaded, starting scan...");
        scanFrame();
      });
      console.log("Added event listener for loadedmetadata");
    }
  };

  const stopScanning = () => {
    console.log("Stopping scan...");
    setIsScanning(false);
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (scannedValue) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
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
              QR Code Detected!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Device connection ID found
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Connection ID
              </p>
              <p className="text-sm font-mono text-gray-800 break-all">
                {scannedValue}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setScannedValue("");
                  setError("");
                  requestCameraPermission();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Scan Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">QR Code Scanner</h3>
              <p className="text-blue-100 text-sm">
                Scan a device QR code to connect
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <svg
                className="w-5 h-5"
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

        {/* Camera Section */}
        <div className="p-6">
          {!hasPermission && !error && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Camera Access Required
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                We need camera permission to scan QR codes. Please allow access
                when prompted.
              </p>

              <button
                onClick={requestCameraPermission}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Allow Camera Access
              </button>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Camera Access Denied
              </h4>
              <p className="text-gray-600 text-sm mb-6">{error}</p>

              <button
                onClick={() => {
                  setError("");
                  requestCameraPermission();
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {hasPermission && !error && (
            <div className="relative">
              {/* Video Container */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    console.log("Video metadata loaded");
                  }}
                  onCanPlay={() => {
                    console.log("Video can play");
                  }}
                  onCanPlayThrough={() => {
                    console.log("Video can play through");
                  }}
                  onError={(e) => {
                    console.error("Video error:", e);
                  }}
                  style={{
                    width: "100%",
                    height: "256px",
                    objectFit: "cover",
                    backgroundColor: "black",
                  }}
                />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-opacity-50 rounded-lg relative">
                    {/* Corner Indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-blue-500"></div>

                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Scanning for QR code...
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Position the QR code within the frame
                </p>
              </div>

              {/* Hidden Canvas for Processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
