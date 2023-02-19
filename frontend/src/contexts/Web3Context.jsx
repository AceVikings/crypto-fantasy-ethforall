import { createContext, useContext, useEffect, useState } from "react";
import { BigNumber, Contract, ethers, utils } from "ethers";
import nftAbi from "./NFTabi.json";
import { AuthProvider } from "@arcana/auth";
import {
  Provider as MulticallProvider,
  Contract as MulticallContract,
} from "ethers-multicall";
import { toast } from "react-toastify";
import NETWORK_DETAILS from "./networkDetails.json";
// import ethers from "ethers";
const Web3Context = createContext();
const supportedChains = Object.keys(NETWORK_DETAILS);
console.log(supportedChains);
const BASE_URL = "https://escrow.onrender.com" || "http://localhost:5000";
const auth = new AuthProvider(`cdc310cc4f22e3a3e50c9cee8bb75ccfe22378ee`);

export const Web3Provider = (props) => {
  const [account, setAccount] = useState(false);
  const [signer, setSigner] = useState();
  const [contractObjects, setContractObjects] = useState();
  const [update, setUpdate] = useState(0);

  const [presentNetwork, setPresentNetwork] = useState("80001");
  // const [currentNetwork, setCurrentNetwork] = useState(
  //   NETWORK_DETAILS["80001"]
  // );
  const currentNetwork = NETWORK_DETAILS[presentNetwork?.toString()] || {};

  const { FANTASY_ADDRESS, MULTI_CALL_ADDRESS } = currentNetwork;
  const {
    RPC_URL,
    CHAIN_ID,
    NATIVE_CURRENCY,
    name: CHAIN_NAME,
  } = currentNetwork;

  const functionsToExport = {};
  const onAccountsChanged = async (accounts) => {
    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner();
    setSigner(_signer);
  };
  const isWrongNetwork = !supportedChains.find(
    (e) => e == presentNetwork?.toString()
  );

  useEffect(() => {
    try {
      const _signer =
        signer || new ethers.providers.Web3Provider(window.ethereum, "any");
      signer?.getChainId().then((chainId) => setPresentNetwork(chainId));
      if (FANTASY_ADDRESS) {
        const escrowContract = new ethers.Contract(
          FANTASY_ADDRESS,
          nftAbi,
          _signer
        );
        const _contractObjects = {
          escrowContract,
        };
        setContractObjects(_contractObjects);
      }
    } catch (e) {
      console.log(e);
    }
  }, [signer, presentNetwork]);
  const addNewChain = async () => {
    const {
      RPC_URL,
      CHAIN_ID,
      NATIVE_CURRENCY,
      name: CHAIN_NAME,
    } = currentNetwork;
  };
  useEffect(() => {
    // promptChain();
  }, [currentNetwork]);
  const setupContracts = async (signer, _contractAddresses) => {};

  const promptChain = async (chainID = undefined) => {
    chainID = 80001;
    const { CHAIN_ID, RPC_URL, name, NATIVE_CURRENCY } =
      NETWORK_DETAILS[chainID?.toString()];
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${CHAIN_ID.toString(16)}`,
            rpcUrls: [RPC_URL],
            chainName: name,
            nativeCurrency: NATIVE_CURRENCY,
          },
        ],
      });
    } catch (e) {
      toast.error(e?.message || "Couldn't Switch Network");

      console.log(e);
      // await switchCain();
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner();
    setSigner(_signer);
  };
  const onChainChanged = async (chainID) => {
    setPresentNetwork(parseInt(chainID, 16));

    // await promptChain();
  };
  const setupMultiCallContract = async (contractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const ethcallProvider = new MulticallProvider(provider);
    await ethcallProvider.init();
    ethcallProvider._multicallAddress = MULTI_CALL_ADDRESS;
    const multicallContract = new MulticallContract(contractAddress, nftAbi);
    return [ethcallProvider, multicallContract];
  };
  const setupMultiCallEscrowContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const ethcallProvider = new MulticallProvider(provider);
    await ethcallProvider.init();
    ethcallProvider._multicallAddress = MULTI_CALL_ADDRESS;
    const multicallContract = new MulticallContract(
      ESCROW_CONTRACT_ADDRESS,
      escrewAbi
    );
    return [ethcallProvider, multicallContract];
  };
  functionsToExport.deListToken = async (contract, token) => {
    try {
      toast.loading("Placing Transaction");
      const tx = await contractObjects.escrowContract.deListToken(
        contract,
        token
      );
      await tx.wait();
      toast.dismiss();
      toast.success(`${token} Delisted successfully`);
    } catch (e) {
      toast.dismiss();
      console.log(e.message);
    }
  };
  console.log(presentNetwork);
  functionsToExport.changeNetwork = (chainID) => {};
  functionsToExport.initContract = (contract) => {
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let _signer = provider.getSigner();
      let nftContract = new ethers.Contract(contract, nftAbi, _signer);
      return nftContract;
    } catch (error) {
      console.log(error);
    }
  };

  functionsToExport.availableForMe = async (contract, onlyForMe = false) => {
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let _signer = provider.getSigner();
      let nftContract = new ethers.Contract(contract, nftAbi, _signer);
      const userBalance = parseInt(
        (await nftContract.balanceOf(ESCROW_CONTRACT_ADDRESS)).toString()
      );
      let [nftMulticallProvider, nftMulticallContract] =
        await setupMultiCallContract(contract);
      let temp = [],
        listingInfo = [],
        tokensAvailableForMe = [],
        price = [],
        tokenSymbol = [],
        tokenAddress = [];
      if (userBalance)
        for (let i = 0; i < userBalance; i++) {
          temp.push(
            nftMulticallContract.tokenOfOwnerByIndex(ESCROW_CONTRACT_ADDRESS, i)
          );
        }
      temp = (await nftMulticallProvider?.all(temp)).map((e) => e.toString());
      let [multicallProvider, multicallContract] =
        await setupMultiCallEscrowContract();
      temp.forEach((item) =>
        listingInfo.push(multicallContract.listingInfo(contract, item))
      );
      listingInfo = await multicallProvider?.all(listingInfo);

      for (let i = 0; i < listingInfo.length; i++) {
        if (
          onlyForMe &&
          listingInfo[i][1].toUpperCase() == account.toUpperCase()
        ) {
          tokensAvailableForMe.push(temp[i]);
          price.push(listingInfo[i][3]);
          const payToken = listingInfo[i][5];
          if (payToken === "0x0000000000000000000000000000000000000000") {
            tokenSymbol.push(NATIVE_CURRENCY.symbol);
            tokenAddress.push("0x0000000000000000000000000000000000000000");
          } else {
            const tokenDetails = await functionsToExport.contractDetails(
              payToken
            );
            const symbol = tokenDetails.symbol;
            const address = tokenDetails.address;
            tokenSymbol.push(symbol);
            tokenAddress.push(address);
          }
        } else if (
          onlyForMe == false &&
          listingInfo[i][0].toUpperCase() != account.toUpperCase() &&
          listingInfo[i][1].toUpperCase() ==
            "0X0000000000000000000000000000000000000000"
        ) {
          tokensAvailableForMe.push(temp[i]);
          price.push(listingInfo[i][3]);
          const payToken = listingInfo[i][5];
          if (payToken === "0x0000000000000000000000000000000000000000") {
            tokenSymbol.push(NATIVE_CURRENCY.symbol);
            tokenAddress.push("0x0000000000000000000000000000000000000000");
          } else {
            const tokenDetails = await functionsToExport.contractDetails(
              payToken
            );
            const symbol = tokenDetails.symbol;
            const address = tokenDetails.address;
            tokenSymbol.push(symbol);
            tokenAddress.push(address);
          }
        }
      }
      console.log([tokensAvailableForMe, price, tokenSymbol, tokenAddress]);
      return [tokensAvailableForMe, price, tokenSymbol, tokenAddress];
    } catch (e) {
      console.log(e.message);
    }
  };
  functionsToExport.getInitialPrices = async () => {
    const prices = (await contractObjects?.escrowContract?.getSnapshot(0))?.map(
      (e) => e.toString()
    );
    return prices;
  };
  functionsToExport.getAllUserTokens = async (contractAddress) => {
    // return {
    //   1: { 0: "0", 1: "0", 2: "0", 3: "0", 4: "0", 5: "0", 6: "0", 7: "0" },
    //   2: { 0: "0", 1: "0", 2: "0", 3: "0", 4: "0", 5: "0", 6: "0", 7: "0" },
    // };
    contractAddress = contractAddress || currentNetwork.FANTASY_ADDRESS;
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let _signer = provider.getSigner();
      let nftContract = new ethers.Contract(contractAddress, nftAbi, _signer);
      const userBalance = parseInt(
        (await nftContract.balanceOf(account)).toString()
      );
      const [multicallProvider, multicallContract] =
        await setupMultiCallContract(contractAddress);
      let tokens = [];
      if (userBalance)
        for (let i = 0; i < userBalance; i++) {
          tokens.push(multicallContract.tokenOfOwnerByIndex(account, i));
        }
      tokens = (await multicallProvider?.all(tokens)).map((e) => e.toString());
      //Kinda inefficient but ok
      let allPortfolioCalls = [];
      tokens.map((tokenId) => {
        for (let i = 0; i <= 9; i++) {
          if (i === 8) {
            allPortfolioCalls.push(multicallContract.userBalance(tokenId));
            return;
          }
          if (i === 9) {
            allPortfolioCalls.push(multicallContract.getReward(tokenId));
            return;
          }
          allPortfolioCalls.push(multicallContract.userPortfolio(tokenId, i));
        }
      });
      console.log(allPortfolioCalls);
      allPortfolioCalls = (await multicallProvider?.all(allPortfolioCalls)).map(
        (e) => e.toString()
      );
      console.log(allPortfolioCalls);
      const finalPortfolioObject = {};
      console.log(allPortfolioCalls);
      tokens.map((token, index) => {
        for (let i = 0; i <= 9; i++) {
          let portfolioIndex = parseInt(index) * 10 + i;
          if (finalPortfolioObject[token.toString()] == undefined) {
            finalPortfolioObject[token.toString()] = {};
          }
          finalPortfolioObject[token.toString()][i.toString()] =
            allPortfolioCalls[portfolioIndex];
        }
      });
      return finalPortfolioObject;
    } catch (e) {
      console.log(e.message);
      return [];
    }
  };
  functionsToExport.logout = async () => {
    await auth.logout();
  };
  functionsToExport.connectArcana = async () => {
    await auth.init();
    const arcanaProvider = await auth.connect();
    const provider = new ethers.providers.Web3Provider(arcanaProvider);
    if (!provider) {
      toast.error("You need a wallet to continue!");
      return;
    }

    if (provider) {
      await arcanaProvider.request({ method: "eth_requestAccounts" });
      const accounts = await arcanaProvider.request({ method: "eth_accounts" });
      // await promptChain();
      arcanaProvider?.on("chainChanged", onChainChanged);
      arcanaProvider?.on("accountsChanged", onAccountsChanged);
      setAccount(accounts[0]);
      toast.success("Wallet Connected!");
      const _signer = provider.getSigner();
      setSigner(_signer);
      console.log("don");
    }
  };

  functionsToExport.connectWallet = async (defaultAccount = -1) => {
    const { ethereum } = window;
    if (!ethereum) {
      toast.error("You need a wallet to continue!");
      return;
    }

    if (ethereum) {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      // await promptChain();
      ethereum?.on("chainChanged", onChainChanged);
      ethereum?.on("accountsChanged", onAccountsChanged);
      setAccount(accounts[0]);
      toast.success("Wallet Connected!");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = provider.getSigner();
      setSigner(_signer);
      console.log("don");
    }
  };
  functionsToExport.withdrawBalance = async () => {
    try {
      toast.loading("Placing Transaction");
      const balance = await contractObjects.escrowContract.balance(account);

      if (balance == 0) {
        toast.dismiss();
        toast.error(`Your Balance is ${ethers.utils.formatEther(balance)}`);
      } else {
        const tx = await contractObjects.escrowContract.withdrawBalance();
        await tx.wait();
        toast.dismiss();
        toast.success("Balance Withdrwal");
      }
    } catch (e) {
      console.log(e.message);
      toast.dismiss();
    }
  };
  functionsToExport.balance = async () => {
    try {
      const balance = await contractObjects.escrowContract.balance(account);
      return [ethers.utils.formatEther(balance), NATIVE_CURRENCY.symbol];
    } catch (e) {
      console.log(e.message);
      toast.dismiss();
    }
  };
  functionsToExport.buyToken = async (
    contractAddress,
    tokenid,
    price,
    address
  ) => {
    try {
      if (!account) {
        toast.error("Wallet not connected!");
        return;
      }

      if (address === "0x0000000000000000000000000000000000000000") {
        const balance = await signer.getBalance();
        if (parseInt(price) > parseInt(balance)) {
          toast.error("Insufficient Balance!");
        } else {
          toast.loading("Placing transaction");
          const tx = await contractObjects.escrowContract.buyToken(
            contractAddress,
            tokenid,
            { value: price }
          );
          await tx.wait();
          toast.dismiss();
          toast.success("Purchase Complete");
        }
      } else {
        let paytokenContract = new Contract(address?.trim(), erc20Abi, signer);

        const tokenBalance = await paytokenContract?.balanceOf(account);

        // console.log(tokenBalance);
        const allowance = await paytokenContract?.allowance(
          account,
          ESCROW_CONTRACT_ADDRESS
        );
        if (parseInt(price) > parseInt(tokenBalance)) {
          toast.error("Insufficient Balance!");
        } else {
          if (parseInt(price) > parseInt(allowance)) {
            // const incAllowanceAmmount = parseInt(price) - parseInt(allowance);
            // toast.warn("Not enough Allowance", { autoClose: 1000 });
            toast.loading("Increasing Allowance");

            await paytokenContract?.increaseAllowance(
              ESCROW_CONTRACT_ADDRESS,
              price.toString()
            );

            toast.dismiss();
            toast.success("Increased your allowance");
            toast.loading("Placing transaction");
            const tx = await contractObjects.escrowContract.buyToken(
              contractAddress,
              tokenid
            );
            await tx.wait();
            toast.dismiss();
            toast.success("Purchase Complete");
          } else {
            toast.loading("Placing transaction");
            const tx = await contractObjects.escrowContract.buyToken(
              contractAddress,
              tokenid
            );
            await tx.wait();
            toast.dismiss();
            toast.success("Purchase Complete");
          }
        }
      }
    } catch (e) {
      toast.dismiss();
      console.log(e);
      toast.error(e.reason);
    }
    try {
      await get(BASE_URL + `/deletelink/${contractAddress}/${tokenid}`);
    } catch {}
  };
  functionsToExport.listingInfo = async (contract, tokenId) => {
    let listinginfo, nftData, tokenSymbol;
    try {
      // console.log(contractObjects);
      listinginfo = await contractObjects?.escrowContract?.listingInfo(
        contract,
        tokenId
      );
      tokenSymbol = NATIVE_CURRENCY.symbol;
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let _signer = provider.getSigner();
      let nftContract = new ethers.Contract(contract, nftAbi, _signer);
      // console.log("nftwsuxdj", nftContract);
      let uri = await nftContract.tokenURI(tokenId);
      console.log(uri);
      uri = uri?.replace("ipfs://", "https://puffs.mypinata.cloud/ipfs/");
      // console.log(listinginfo[5], "0x0000000000000000000000000000000000000000");
      if (listinginfo[5] !== "0x0000000000000000000000000000000000000000") {
        console.log(listinginfo);
        const tokenDetails = await functionsToExport.contractDetails(
          listinginfo[5]
        );

        tokenSymbol = tokenDetails.symbol;
      }

      const { data } = await get(uri);
      nftData = data;
    } catch (e) {
      console.log(e.message);
    }
    return [listinginfo, nftData, tokenSymbol];
  };
  functionsToExport.getUserListing = async (contract) => {
    try {
      const data = await contractObjects.escrowContract.getUserListing(account);
      const [multicallProvider, multicallContract] =
        await setupMultiCallEscrowContract();
      let tokens = [],
        contractcall = [];
      data
        .filter((item) => item[0] == contract)
        .forEach((item) => {
          tokens.push(parseInt(item[1]));
          contractcall.push(
            multicallContract.listingInfo(contract, parseInt(item[1]))
          );
        });
      contractcall = await multicallProvider?.all(contractcall);
      return [tokens, contractcall];
    } catch (e) {
      console.log(e.message);
    }
  };
  functionsToExport.generateLink = async (
    contractAddress,
    token,
    price,
    receiver,
    paymentToken
  ) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, nftAbi, _signer);
      let decimals;
      if (paymentToken !== "0x0000000000000000000000000000000000000000") {
        const tokenDetails = await functionsToExport.contractDetails(
          paymentToken
        );
        decimals = tokenDetails.decimals;
      }

      const isApproved = await nftContract.isApprovedForAll(
        account,
        ESCROW_CONTRACT_ADDRESS
      );
      if (!isApproved) {
        toast(`Approving Escrow Contract`);
        const approveIt = await nftContract.setApprovalForAll(
          ESCROW_CONTRACT_ADDRESS,
          true
        );

        const t = await approveIt.wait();
        toast(`Escrow Contract Approved!`);
      }
      toast.loading("Placing Transaction");
      console.log(contractAddress, token, price, receiver, paymentToken);
      const n = await contractObjects.escrowContract.listToken(
        contractAddress,
        token,
        ethers.utils.parseUnits(price, decimals),
        receiver,
        paymentToken
      );
      let success = await n.wait();
      console.log(success);
      // const { data } = await post(
      //   BASE_URL + `/createlink/${success.transactionHash}`
      // );
      toast.dismiss();
      toast.success("Transaction Successful");
      // console.log(data);
      return success;
    } catch (e) {
      console.log(e.message);
      toast.dismiss();
      return false;
    }
  };

  functionsToExport.contractDetails = async (contract) => {
    try {
      let ContractObject = new Contract(contract?.trim(), erc20Abi, signer);
      const [name, symbol, decimals] = await Promise.all([
        ContractObject.name(),
        ContractObject.symbol(),
        ContractObject.decimals(),
      ]);
      return { name, symbol, decimals, address: contract };
    } catch (e) {
      console.log(e);

      // NotificationManager.error("Contract", "Invalid Contract");
    }
  };
  functionsToExport.register = async () => {
    try {
      const txn = await contractObjects.escrowContract.register({
        value: utils.parseEther("0.01"),
      });
      toast.info("Registering in Tournament");
      await txn.wait();
      toast.success("Registration Successful!");
      setUpdate((u) => u + 1);
    } catch (e) {
      console.log(e);
    }
  };
  functionsToExport.buyToken = async (tokenId, index, amount) => {
    try {
      const txn = await contractObjects.escrowContract.buyToken(
        tokenId,
        index,
        BigNumber.from(amount).mul(BigNumber.from((10 ** 8).toString()))
      );
      toast.info(`Purchasing tokens for portfolio #${tokenId}`);
      await txn.wait();
      toast.success(`Transaction Successful`);
      setUpdate((u) => u + 1);
    } catch (e) {
      console.log(e);
    }
  };
  functionsToExport.retrieveReward = async (tokenId) => {
    try {
      const txn = await contractObjects.escrowContract.retrieveReward(tokenId);
      toast.info(`Retrieving reward for portfolio #${tokenId}`);
      await txn.wait();
      toast.success(`Transaction Successful`);
      setUpdate((u) => u + 1);
    } catch (e) {
      console.log(e);
    }
  };
  functionsToExport.getTournamentInfo = async () => {
    let data = await Promise.all([
      await contractObjects.escrowContract.startTime(),
      await contractObjects.escrowContract.duration(),
      await contractObjects.escrowContract.totalSupply(),
    ]);
    data = data.map((e) => e.toString());
    const [startTime, duration, totalSupply] = data;
    return { startTime, duration, totalSupply };
  };
  // functionsToExport.getReward = async ()=>{

  // }

  return (
    <Web3Context.Provider
      value={{
        account,
        signer,
        BASE_URL,
        contractObjects,
        presentNetwork,
        currentNetwork,
        isWrongNetwork,
        promptChain,
        update,
        ...functionsToExport,
      }}
    >
      {props.children}
    </Web3Context.Provider>
  );
};
export default Web3Context;
export const useWeb3Context = () => useContext(Web3Context);
