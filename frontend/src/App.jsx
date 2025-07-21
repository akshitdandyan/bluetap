import { Routes, Route, BrowserRouter } from "react-router";
import Home from "./pages/Home";
import PairRequestPopup from "./components/PairRequestPopup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <PairRequestPopup />
    </BrowserRouter>
  );
}

export default App;
