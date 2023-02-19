import React from "react";
import { useWeb3Context } from "../contexts/Web3Context";

function Navbar() {
  const { account, connectWallet, connectArcana, logout } = useWeb3Context();
  return (
    <div className="z-50 text-gray-100 fixed top-0 w-full">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 xl:justify-start xl:space-x-10 bg-gray-800">
        <div>
          <a className="flex" href="/">
            <span className="sr-only">Crypto Fantasy</span>
            <div
              className="text-akbar text-xl sm:text-2xl text-center"
              style={{ marginTop: "0px" }}
            >
              Crypto Fantasy
            </div>
          </a>
        </div>
        <div className="-mr-2 -my-2 flex items-center xl:hidden">
          <button
            className="bg-gray-900 hover:bg-primary-hover rounded-md p-2 inline-flex items-center justify-center focus:outline-none"
            id="headlessui-popover-button-1"
            type="button"
          >
            <span className="sr-only">Connect Wallet</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="hidden xl:flex-1 xl:flex xl:items-center xl:justify-between">
          <nav className="flex space-x-10">
            <div className="relative rounded-lg text-center hover:bg-purple-800 ">
              <a
                className="text-base font-medium text-gray-100 hover:text-white p-1 rounded-lg text-white"
                style={{ cursor: "pointer" }}
              >
                Explore
              </a>
            </div>
            <div className="relative rounded-lg text-center items-center justify-center hover:bg-purple-800 ">
              <a
                className="text-base font-medium text-gray-100 hover:text-white p-1 rounded-lg "
                style={{ cursor: "pointer" }}
              >
                My Tournaments
              </a>
            </div>
          </nav>
          <div className="flex items-center xl:ml-12">
            <button
              onClick={!account ? connectArcana : logout}
              className="bg-gray-800 hover:bg-primary hover:text-white text-white text-on-primary ml-6 w-40 text-sm lg:text-base font-medium py-2 px-5 rounded-sm whitespace-nowrap truncate flex-shrink-0 focus:outline-none focus:border-transparent"
              style={{
                borderRadius: "20px",
                border: "1px solid #b488f5",
                boxShadow:
                  "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
              }}
            >
              <div className="flex items-center text-akbar text-lg justify-center">
                <span className>{!account ? "Connect Arcana" : `Logout`}</span>
              </div>
            </button>
            <button
              onClick={!account ? connectWallet : () => {}}
              className="bg-gray-800 hover:bg-primary hover:text-white text-white text-on-primary ml-6 w-40 text-sm lg:text-base font-medium py-2 px-5 rounded-sm whitespace-nowrap truncate flex-shrink-0 focus:outline-none focus:border-transparent"
              style={{
                borderRadius: "20px",
                border: "1px solid #b488f5",
                boxShadow:
                  "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
              }}
            >
              <div className="flex items-center text-akbar text-lg justify-center">
                <span className>
                  {!account
                    ? "Connect Wallet"
                    : `${account.slice(0, 4)}...${account.slice(-4)}`}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
