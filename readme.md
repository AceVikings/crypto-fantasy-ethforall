## Description

Crypto trading can be fun but new users getting started are actively discouraged by the investment required and market volatility.

### How do we solve it ?

Our project is a fantasy league game where users can desposit a minimal entry fee to start a portfolio which is **minted as an NFT** with added benefit of being able to be traded freely in the open market. <br>
Each portfolio starts with a base balance of 20,000$ using which users can buy tokens from a curated list. At the start of the tournament our contract takes a price snapshot of these tokens using **Chainlink feeds**. Users can then proceed to buy tokens at these prices and setup their portfolios. <br>
After the buy period is over, users wait for tournament to end which can be automated using **Chainlink Keepers**. We then calculate a delta value difference in initial and final prices and order the tokens. Top 6 tokens are then distributed rewards based on pre-defined weightage and users can collect these rewards.<br>
Further, our onboarding process is boosted by **arcana wallets** making it easier for new users to try out our platform.

Contract on Mumbai Testnet: 0x66b072290Bf5E4a695755b16AfbeDb9D0A566137 <br>
Registry on Mumbai Testnet:
0xB607F90E9b7317f519f8A2dFa2C709560171C36e
