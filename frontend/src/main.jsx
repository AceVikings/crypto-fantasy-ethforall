import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Web3Provider } from "./contexts/Web3Context";
import Navbar from "./components/Navbar";
import TournamentPage from "./pages/TournamentPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
      <Navbar />
      <TournamentPage />
    </Web3Provider>
  </React.StrictMode>
);
