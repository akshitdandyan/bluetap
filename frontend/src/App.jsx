import { Routes, Route, BrowserRouter } from "react-router";
import Home from "./pages/Home";
import PairRequestPopup from "./components/PairRequestPopup";
import NotificationPopup from "./components/NotificationPopup";
import FileReceivedModal from "./components/FileReceivedModal";
import TextReceivedModal from "./components/TextReceivedModal";
import { notificationStore } from "./utils/store";

function App() {
  const receivedFile = notificationStore((s) => s.receivedFile);
  const clearReceivedFile = notificationStore((s) => s.clearReceivedFile);
  const receivedText = notificationStore((s) => s.receivedText);
  const clearReceivedText = notificationStore((s) => s.clearReceivedText);

  const handleDownload = async (fileData) => {
    try {
      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = fileData.url;
      link.download = fileData.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add success notification
      notificationStore.getState().addNotification({
        isAccepted: true,
        type: "file_downloaded",
        fileName: fileData.fileName,
        message: `File "${fileData.fileName}" downloaded successfully!`,
      });

      clearReceivedFile();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };

  const handleIgnore = () => {
    clearReceivedFile();
  };

  const handleTextCopy = () => {
    // Add success notification
    notificationStore.getState().addNotification({
      isAccepted: true,
      type: "text_copied",
      message: "Text copied to clipboard!",
    });
    clearReceivedText();
  };

  const handleTextIgnore = () => {
    clearReceivedText();
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <PairRequestPopup />
      <NotificationPopup />
      {receivedFile && (
        <FileReceivedModal
          fileData={receivedFile}
          onDownload={() => handleDownload(receivedFile)}
          onIgnore={handleIgnore}
        />
      )}
      {receivedText && (
        <TextReceivedModal
          textData={receivedText}
          onCopy={handleTextCopy}
          onIgnore={handleTextIgnore}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
