import React from "react";
import { useWeb3Context } from "../contexts/Web3Context";

function WrongNetwork() {
  const { promptChain } = useWeb3Context();
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <button
        onClick={() => {
          console.log("k");
          promptChain();
        }}
      >
        Wrong Network, click to switch
      </button>
    </div>
  );
}

export default WrongNetwork;
