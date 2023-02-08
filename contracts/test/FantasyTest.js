const {
  time,
  loadFixture,
  setCode,
} = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, waffle } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { smock } = require("@defi-wonderland/smock");
describe("Fantasy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  let registry;
  let fantasy;
  let BTC, DAI, ETH, LINK, MATIC, SAND, SOL, USDC;

  before(async function () {
    [owner, ace, acadia] = await ethers.getSigners();

    const registryFactory = await ethers.getContractFactory("AddressRegistry");
    registry = await registryFactory.deploy();

    const fantasyFactory = await ethers.getContractFactory("CryptoFantasy");
    fantasy = await fantasyFactory.deploy();

    BTC = await smock.fake("AggregatorV3Interface", {
      address: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
    });
    BTC.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    DAI = await smock.fake("AggregatorV3Interface", {
      address: "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
    });
    DAI.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    ETH = await smock.fake("AggregatorV3Interface", {
      address: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    });
    ETH.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    LINK = await smock.fake("AggregatorV3Interface", {
      address: "0x1C2252aeeD50e0c9B64bDfF2735Ee3C932F5C408",
    });
    LINK.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    MATIC = await smock.fake("AggregatorV3Interface", {
      address: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
    });
    MATIC.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    SAND = await smock.fake("AggregatorV3Interface", {
      address: "0x9dd18534b8f456557d11B9DDB14dA89b2e52e308",
    });
    SAND.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    SOL = await smock.fake("AggregatorV3Interface", {
      address: "0xEB0fb293f368cE65595BeD03af3D3f27B7f0BD36",
    });
    SOL.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    USDC = await smock.fake("AggregatorV3Interface", {
      address: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
    });
    USDC.latestRoundData.returns({
      roundId: 0,
      answer: 10 ** 8,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    });
    await fantasy.init(0, registry.address);
  });

  describe("Test", function () {
    it("Should return value", async function () {
      console.log(await fantasy.getSnapshot(0));
    });
  });
});
