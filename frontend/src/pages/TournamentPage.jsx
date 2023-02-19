import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../contexts/Web3Context";
import { BigNumber, ethers } from "ethers";

function TournamentPage() {
  const {
    getAllUserTokens,
    getInitialPrices,
    register,
    account,
    getTournamentInfo,
    update,
    retrieveReward,
  } = useWeb3Context();
  const [userPortfolio, setUserPortfolio] = useState(undefined);
  const [snapshotPrices, setSnapshotPrices] = useState(undefined);
  const [selectedTab, setSelectedTab] = useState(1);
  const [tournamentInfo, setTournamentInfo] = useState(undefined);
  const MyPortfolios = () => {
    if (!account) {
      return (
        <>
          <div className="w-full text-center text-white text-xl mt-32">
            You need to connect your wallet first
          </div>
        </>
      );
    }
    if (!userPortfolio) {
      return (
        <>
          <div className="w-full text-center text-white text-xl mt-32">
            Fetching your portfolio...
          </div>
        </>
      );
    }
    console.log(userPortfolio);
    if (Object.keys(userPortfolio).length == 0) {
      return (
        <>
          <div className="w-full text-center text-white text-xl mt-32">
            Looks like you don't have any portfolios. Click on Register to
            enter!
          </div>
        </>
      );
    }
    return (
      <>
        {Object.keys(userPortfolio || {}).map((token) => {
          return (
            <Option
              tokenId={token}
              snapshotPrice={snapshotPrices}
              portfolio={userPortfolio[token]}
            />
          );
        })}
      </>
    );
  };
  const Info = () => {
    return <></>;
  };
  const Option = ({ tokenId, portfolio, snapshotPrice }) => {
    const { buyToken } = useWeb3Context();
    const [expanded, setExpanded] = useState(false);
    const [buyEnabledIndex, setBuyEnabledIndex] = useState(-1);
    const [buyAmount, setBuyAmount] = useState(0);
    if (expanded) {
      return (
        <div
          className="bg-gray-800 m-2 rounded-md px-4 py-3 text-white flex flex-col justify-between transition-all duration-200"
          style={{ height: "590px" }}
        >
          <div className=" flex flex-col transition-all duration-200">
            <h1 onClick={() => setExpanded(false)} className="text-2xl">
              {" "}
              Portfolio #{tokenId}{" "}
            </h1>
            <button
              onClick={() => {
                retrieveReward(tokenId);
              }}
              className={`border w-32 my-8 text-sm rounded-md px-1 py-0.5 mx-2 hover:border-purple-600`}
            >
              Retrieve
            </button>
            <div className="text-md text-gray-400">
              Available Balance:{" "}
              {BigNumber.from(portfolio?.["8"] || "0")
                .div(BigNumber.from("100000000"))
                .toString()}
            </div>
            <div className="mt-2">
              Current Portfolio Value: {tokenId == "1" ? "0.005" : "0.0025"}{" "}
            </div>
            <div className="mt-2">Current token Balance: </div>
            <div className="flex flex-col">
              {Object.keys(portfolio).map((_, index) => {
                if (index >= 8) {
                  return <></>;
                }
                const buyEnabled = buyEnabledIndex === index;
                return (
                  <>
                    <div className="flex mt-4 cursor-pointer group">
                      <img
                        className={`h-6 mx-1 ${
                          BigNumber.from(portfolio[index.toString()]).gt(
                            BigNumber.from("0")
                          )
                            ? ""
                            : "opacity-20"
                        }`}
                        src="/c1.png"
                        alt=""
                      />
                      <div className="ml-2">
                        <span className="text-xl">
                          {parseFloat(
                            BigNumber.from(portfolio[index.toString()] || "0")
                              .div(BigNumber.from("10000"))
                              .toString()
                          ) / 10000}
                        </span>
                        <span className="ml-2 text-gray-500 text-sm">
                          {" "}
                          (Price: $
                          {parseFloat(
                            BigNumber.from(snapshotPrice[index])
                              .div(BigNumber.from("10000".toString()))
                              .toString()
                          ) / 10000}{" "}
                          )
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            parseInt(
                              parseInt(
                                new Date(
                                  (parseInt(tournamentInfo?.startTime || 0) +
                                    parseInt(tournamentInfo?.duration || 0)) *
                                    1000
                                ) - new Date()
                              )
                            ) > 0
                          ) {
                            setBuyEnabledIndex(index);
                          } else {
                            retrieveToken(tokenId, index);
                          }
                        }}
                        className={`hidden ${
                          buyEnabledIndex === index ? "" : "group-hover:block"
                        } border text-sm rounded-md px-1 py-0.5 mx-2 hover:border-purple-600`}
                      >
                        {parseInt(
                          parseInt(
                            new Date(
                              (parseInt(tournamentInfo?.startTime || 0) +
                                parseInt(tournamentInfo?.duration || 0)) *
                                1000
                            ) - new Date()
                          )
                        ) > 0
                          ? "Buy"
                          : "Retrieve"}
                      </button>
                      {buyEnabled && (
                        <>
                          <input
                            value={buyAmount}
                            onChange={(e) => {
                              setBuyAmount(e.target.value);
                            }}
                            type="number"
                            className="ml-4 bg-transparent border border-white"
                          />
                          <button
                            onClick={() => {
                              buyToken(tokenId, buyEnabledIndex, buyAmount);
                            }}
                            className={`block border text-sm rounded-md px-1 py-0.5 mx-2 hover:border-purple-600`}
                          >
                            Buy
                          </button>
                        </>
                      )}
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          onClick={() => setExpanded(true)}
          className="bg-gray-800 m-4 rounded-md px-4 py-3 h-12 text-white flex flex-col justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-row justify-between transition-all duration-200">
            <h1 className="text-md transition-all duration-200">
              Portfolio #{tokenId}{" "}
              <span className="text-md text-gray-400">
                {BigNumber.from(portfolio?.["8"] || "0")
                  .div(BigNumber.from("100000000"))
                  .toString()}
              </span>
            </h1>

            <div className="flex">
              {Object.keys(portfolio).map((_, index) => (
                <img
                  className={`${index >= 8 ? "hidden" : ""} h-6 mx-1 ${
                    BigNumber.from(portfolio[index.toString()] || "0").gt(
                      BigNumber.from("0")
                    )
                      ? ""
                      : "opacity-20"
                  }`}
                  src="/c1.png"
                  alt=""
                />
              ))}{" "}
            </div>
          </div>
        </div>
      );
    }
  };
  useEffect(() => {
    (async () => {
      const [_userPortfolio, _snaphsotPrices, _tournamentInfo] =
        await Promise.all([
          await getAllUserTokens(),
          await getInitialPrices(),
          await getTournamentInfo(),
        ]);
      setSnapshotPrices(_snaphsotPrices);
      setUserPortfolio(_userPortfolio);
      setTournamentInfo(_tournamentInfo);
    })();
  }, [account, update]);
  return (
    <div className="w-full pt-32 bg-gray-900 h-screen">
      <div className="container mx-auto ">
        <div className="bg-gray-800 rounded-md px-4 py-3 text-white">
          <div className="flex justify-between">
            <div className="flex">
              <div>
                <img src="/c1.png" alt="" className="h-14" />
              </div>
              <div className="ml-2">
                <h1 className="text-2xl font-bold">Sample Tournament</h1>
                <h1 className="text-md">
                  Entry Fee: <span className="text-purple-600">0.01 MATIC</span>
                </h1>
              </div>
            </div>
            <div>
              <button
                onClick={register}
                className="bg-gray-800 hover:bg-primary hover:text-white text-white text-on-primary ml-6 w-40 text-sm lg:text-base font-medium py-2 px-5 rounded-sm whitespace-nowrap truncate flex-shrink-0 focus:outline-none focus:border-transparent"
                style={{
                  borderRadius: "20px",
                  border: "1px solid #b488f5",
                  boxShadow:
                    "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
                }}
              >
                <div className="flex items-center text-akbar text-lg justify-center">
                  <span className>Register</span>
                </div>
              </button>
            </div>
          </div>
          <div className="mt-2">
            {account &&
            parseInt(
              parseInt(
                new Date(
                  (parseInt(tournamentInfo?.startTime || 0) +
                    parseInt(tournamentInfo?.duration || 0)) *
                    1000
                ) - new Date()
              ) / 60000
            ) > 0 ? (
              <>
                Registration starts in{" "}
                {JSON.stringify(
                  parseInt(
                    parseInt(
                      new Date(
                        (parseInt(tournamentInfo?.startTime || 0) +
                          parseInt(tournamentInfo?.duration || 0)) *
                          1000
                      ) - new Date()
                    ) / 60000
                  )
                )}{" "}
                minutes
              </>
            ) : (
              <>Registration Ended</>
            )}
          </div>
        </div>

        <ul class="flex mt-4 flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          {/* <li class="mr-2">
            <button
              onClick={() => setSelectedTab(0)}
              class={
                selectedTab == 0
                  ? `inline-block p-4 text-purple-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-purple-500`
                  : "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }
            >
              Info
            </button>
          </li> */}
          <li class="mr-2">
            <button
              onClick={() => setSelectedTab(1)}
              class={
                selectedTab == 1
                  ? `inline-block p-4 text-purple-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-purple-500`
                  : "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }
            >
              My Portfolios
            </button>
          </li>
        </ul>
        {selectedTab == 0 ? <Info /> : <MyPortfolios />}
      </div>
    </div>
  );
}

export default TournamentPage;
