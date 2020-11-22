require("dotenv").config();
const Web3 = require("web3");
const Twit = require("twit");
const numeral = require("numeral");
const ABI = require("./constants/aggregatorV3InterfaceABI.json");
const {
  ETH_ADDR,
  BTC_ADDR,
  EUR_ADDR,
  GBP_ADDR,
  JPY_ADDR,
  CHF_ADDR,
  XAU_ADDR,
  FTSE_ADDR,
  NKY_ADDR,
  LINK_ADDR,
} = require("./constants/addresses");

const web3 = new Web3(
  "https://mainnet.infura.io/v3/7ba1a9b1c3d44e739244cd96a174c445"
);

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

// PRICE ALERTS

// tweet every time bitcoin moves $1000

// get initial bitcoin price
// divide by mod 1000
// store as starting price

// MENTIONS
// filter the twitter stream by tweets containing "@defipricebot"
const stream = T.stream("statuses/filter", { track: "@defipricebot" });

stream.on("tweet", async function (tweet) {
  console.log("tweet: ", tweet);
  let txt;

  // get tweet text
  if (tweet.truncated) {
    if (tweet.extended_tweet.display_text_range) {
      txt = tweet.extended_tweet.full_text.slice(
        tweet.extended_tweet.display_text_range[0]
      );
    } else {
      txt = tweet.extended_tweet.full_text;
    }
  } else {
    if (tweet.display_text_range) {
      // splice new str only with display text
      txt = tweet.text.slice(tweet.display_text_range[0]);
    } else {
      txt = tweet.text;
    }
  }

  // regex for match of @defipricebot in the text
  const re = /\bdefipricebot\b/;

  let t = `Thanks for the mention @${tweet.user.screen_name}! Follow me for the latest round pricing data of major assets via the decentralized web. #poweredbychainlink`;

  if (txt === "hey @defipricebot where we at?") {
    console.log("in if");

    // return latest bitcoin price
    const btcusd = await btcPriceFeed.methods.latestRoundData().call();
    const btcprice = numeral(btcusd.answer / 100000000).format("0,0.00");

    const t = `The latest round pricing data for BTCUSD is ${btcprice}\n\n#poweredbychainlink`;

    console.log("tweet.id_str : ", tweet.id_str);

    T.post(
      "statuses/update",
      { status: t, in_reply_to_status_id: tweet.id_str },
      function (err, data, response) {
        console.log(data);
      }
    );
  } else {
    console.log("in else");
    if (re.exec(txt)) {
      // do not reply to self
      if (tweet.user.screen_name !== "defipricebot") {
        // T.post(
        //   "statuses/update",
        //   { status: t, in_reply_to_status_id: tweet.id_str },
        //   function (err, data, response) {
        //     console.log(data);
        //   }
        // );
      }
    }
  }
});

// PRICE FEEDS
const btcPriceFeed = new web3.eth.Contract(ABI, BTC_ADDR);
const ethPriceFeed = new web3.eth.Contract(ABI, ETH_ADDR);
const linkPriceFeed = new web3.eth.Contract(ABI, LINK_ADDR);
const eurPriceFeed = new web3.eth.Contract(ABI, EUR_ADDR);
const gbpPriceFeed = new web3.eth.Contract(ABI, GBP_ADDR);
const jpyPriceFeed = new web3.eth.Contract(ABI, JPY_ADDR);
const chfPriceFeed = new web3.eth.Contract(ABI, CHF_ADDR);
const xauPriceFeed = new web3.eth.Contract(ABI, XAU_ADDR);
const ftsePriceFeed = new web3.eth.Contract(ABI, FTSE_ADDR);
const nkyPriceFeed = new web3.eth.Contract(ABI, NKY_ADDR);

setInterval(async () => {
  const btcusd = await btcPriceFeed.methods.latestRoundData().call();
  const ethusd = await ethPriceFeed.methods.latestRoundData().call();
  const linkusd = await linkPriceFeed.methods.latestRoundData().call();
  const eurusd = await eurPriceFeed.methods.latestRoundData().call();
  const gbpusd = await gbpPriceFeed.methods.latestRoundData().call();
  const jpyusd = await jpyPriceFeed.methods.latestRoundData().call();
  const chfusd = await chfPriceFeed.methods.latestRoundData().call();
  const xauusd = await xauPriceFeed.methods.latestRoundData().call();
  const ftse = await ftsePriceFeed.methods.latestRoundData().call();
  const nky = await nkyPriceFeed.methods.latestRoundData().call();

  const btcprice = numeral(btcusd.answer / 100000000).format("0,0.00");
  const ethprice = numeral(ethusd.answer / 100000000).format("0,0.00");
  const linkprice = numeral(linkusd.answer / 100000000).format("0,0.00");
  const eurprice = numeral(eurusd.answer / 100000000).format("0,0.0000");
  const gbpprice = numeral(gbpusd.answer / 100000000).format("0,0.0000");
  const jpyprice = numeral(1 / (jpyusd.answer / 100000000)).format("0,0.00");
  const chfprice = numeral(chfusd.answer / 100000000).format("0,0.0000");
  const xauprice = numeral(xauusd.answer / 10000000).format("0,0.00");
  const ftseprice = numeral(ftse.answer / 100000000).format("0,0.00");
  const nkyprice = numeral(nky.answer / 100000000).format("0,0.00");

  const t = `BTCUSD : ${btcprice}\nETHUSD : ${ethprice}\nLINKUSD : ${linkprice}\nEURUSD : ${eurprice}\nGBPUSD : ${gbpprice}\nJPYUSD : ${jpyprice}\nCHFUSD : ${chfprice}\nXAU : ${xauprice}\nFTSE (GBP) : ${ftseprice}\nNKY (JPY) : ${nkyprice}\n\nprices brought to you by the decentralized web`;

  console.log(t);

  T.post("statuses/update", { status: t }, function (err, data, response) {
    console.log(data);
  });
}, 1000 * 60 * 60 * 4);

const express = require("express");
const server = express();

server.get("/", (req, res) => {
  res.status(200).json({ server: "server running" });
});

const port = process.env.PORT || 5001;
server.listen(port, () =>
  console.log(`\n*** server running on port ${port}***\n`)
);
