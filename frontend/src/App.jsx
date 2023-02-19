import { useContext, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useWeb3Context } from "./contexts/Web3Context";
import WrongNetwork from "./pages/WrongNetwork";
import { Auth, useAuth } from "@arcana/auth-react";

function App() {
  const auth = useAuth();
  const [count, setCount] = useState(0);
  const [userData, setUserData] = useState([]);
  const [initialPrices, setInitialPrices] = useState([]);
  const {
    connectWallet,
    account,
    getAllUserTokens,
    isWrongNetwork,
    register,
    getInitialPrices,
  } = useWeb3Context();
  useEffect(() => {
    (async () => {
      const data = await Promise.all([
        await getAllUserTokens(),
        await getInitialPrices(),
      ]);
      setUserData(data);
    })();
  }, [account]);

  if (account && isWrongNetwork) {
    return (
      <>
        {account}
        <WrongNetwork />
      </>
    );
  }
  if (account) {
    return (
      <div>
        <button onClick={register}>register</button>
        {JSON.stringify(userData)}
        {JSON.stringify(initialPrices)}
      </div>
    );
  }
  return (
    <div className="">
      <div className="button" onClick={connectWallet}>
        Connect Wallet
      </div>
      <div className="address">{account}</div>
    </div>
  );
}

export default App;
