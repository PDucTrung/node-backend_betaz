require("dotenv").config();
const db = require("../models");
const WinEvent = db.winEvent;
const LoseEvent = db.loseEvent;

exports.getEventsByPlayer = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  let player = req.body.player;
  let limit = req.body.limit;
  let offset = req.body.offset;
  let sort = req.body.sort;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!sort) sort = -1;
  if (!player) {
    return res.send({ status: "FAILED", message: "Invalid Address" });
  }

  let winData = await WinEvent.find({ player: player });
  let loseData = await LoseEvent.find({ player: player });

  var result = winData.concat(loseData);
  let total = result.length;

  // sort
  result.sort(
    (a, b) => (parseInt(a.blockNumber) - parseInt(b.blockNumber)) * sort
  );

  // pagination
  result = result.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = result.map((result) => ({
    player: result.player,
    blockNumber: result.blockNumber,
    betAmount: result.bet_amount,
    type: result.is_over,
    prediction: result.bet_number,
    randomNumber: result.random_number,
    wonAmount: result?.win_amount - result.bet_amount || 0,
    rewardAmount: result.reward_amount,
    oracleRound: result.oracle_round,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};

exports.getEvents = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  let limit = req.body.limit;
  let offset = req.body.offset;
  let sort = req.body.sort;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!sort) sort = -1;

  let winData = await WinEvent.find();
  let loseData = await LoseEvent.find();

  var result = winData.concat(loseData);
  let total = result.length;
  //console.log(player,result);

  // sort
  result.sort(
    (a, b) => (parseInt(a.blockNumber) - parseInt(b.blockNumber)) * sort
  );

  // pagination
  result = result.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = result.map((result) => ({
    player: result.player,
    blockNumber: result.blockNumber,
    betAmount: result.bet_amount,
    type: result.is_over,
    prediction: result.bet_number,
    randomNumber: result.random_number,
    wonAmount: result?.win_amount - result.bet_amount || 0,
    rewardAmount: result.reward_amount,
    oracleRound: result.oracle_round,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};

exports.getRareWins = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  let limit = req.body.limit;
  let offset = req.body.offset;
  let sort = req.body.sort;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!sort) sort = -1;

  let data = await WinEvent.find({
    $where: "this.win_amount > 10 * this.bet_amount",
  });

  let total = data.length;

  // sort
  data.sort(
    (a, b) => (parseInt(a.blockNumber) - parseInt(b.blockNumber)) * sort
  );

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    player: data.player,
    blockNumber: data.blockNumber,
    betAmount: data.bet_amount,
    type: data.is_over,
    prediction: data.bet_number,
    randomNumber: data.random_number,
    wonAmount: data?.win_amount - data.bet_amount || 0,
    rewardAmount: data.reward_amount,
    oracleRound: data.oracle_round,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};
