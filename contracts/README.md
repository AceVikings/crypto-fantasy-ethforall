# Crypto Fantasy Contract

## Algorithm

### Snapshot

Price snapshots are requested via registry contract at contract init and at tourney end.

```
function takeSnapshot() private {
    uint[] memory prices = REGISTRY.getAllPrices();
    priceSnapshot.push(prices);
}
```

### User Registration

When a user registers, we mint an NFT per registration and allot 20_000e8 balance to them (e8 is used to match price feed decimals).

### Balance and Token Purchase

Users can now use this balance to purchase tokens based on the snapshot price. Each purchase deduct from user balance and adds tokens to user portfolio and total portfolio.

### Tournament End and Winning Calculation

When the tournament ends we expect chainlink keepers to call

```
function endCompetition() external
```

This does quite a few things, starting with taking a snapshot at the end of compeition. <br>
Using this we do 2 things:

1. Calculate Price Delta for each token (i.e final snapshot price - initial snapshot price)
2. Sort token index based on this delta

Price delta can be both positive and negative and after receiving delta we sort token index from lowest gain/highest loss to highest gair/lowest loss tokens.

After this we store these index values in state

```
uint[] sortedIndex;
```

We can now take the contract balance and assing different weights to different portfolio tokens based on this index. So for example let's say we have 4 tokens and the indexes turned out

```
Index = [0,2,3,1]
```

We can assign
