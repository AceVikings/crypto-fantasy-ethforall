import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Web3Provider } from "./contexts/Web3Context";
import Navbar from "./components/Navbar";
import TournamentPage from "./pages/TournamentPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { AuthProvider } from "@arcana/auth";
import { ProvideAuth } from "@arcana/auth-react";

const provider = new AuthProvider(
  `${"cdc310cc4f22e3a3e50c9cee8bb75ccfe22378ee"}`
); // required
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastContainer />
    <ProvideAuth provider={provider}>
      <Web3Provider>
        <App />
        <Navbar />
        <TournamentPage />
      </Web3Provider>
    </ProvideAuth>
  </React.StrictMode>
);
