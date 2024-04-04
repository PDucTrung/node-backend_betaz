require("dotenv").config();
const db = require("../models");
const StakeManager = db.stakeManager;
const HistoryStaking = db.historyStaking;
const ClaimEvent = db.claimEvent;
const {
  getTotalPendingUnstakedByAccount,
  getRequestUnstakeTime,
  getPendingUnstakingAmount,
  getLimitUnstakeTime,
} = require("../contracts/staking_contract_calls");
let { convertTimeStampToNumber } = require("../utils/utils");

exports.updatePendingUnstake = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  const { caller } = req.body;

  let limitTime = await getLimitUnstakeTime();
  let total = await getTotalPendingUnstakedByAccount(caller);
  let pendingUnstakeList = [];

  await StakeManager.deleteMany({ caller });

  for (let i = 0; i < parseInt(total); i++) {
    let [amount, time] = await Promise.all([
      getPendingUnstakingAmount(caller, i),
      getRequestUnstakeTime(caller, i),
    ]);

    const pendingUnstakeInfo = {};

    pendingUnstakeInfo.caller = caller;
    pendingUnstakeInfo.callerIndex = i;
    pendingUnstakeInfo.amount = amount.replace(/\,/g, "") / 10 ** 12;
    pendingUnstakeInfo.time =
      convertTimeStampToNumber(time) + convertTimeStampToNumber(limitTime);

    pendingUnstakeList.push(pendingUnstakeInfo);
  }

  // console.log({ pendingUnstakeList });

  await StakeManager.insertMany(pendingUnstakeList)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot updatePendingUnstake. Maybe data was not found!`,
        });
      } else {
        res.send({
          message: "updated successfully!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not update",
      });
    });
};

exports.getPendingUnstake = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  let { caller, limit, offset, status } = req.body;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!status) status = 0;
  if (!caller) {
    return res.send({ status: "FAILED", message: "Invalid Address" });
  }

  let data = await StakeManager.find({ caller: caller });

  let total = data.length;
  if (status == 1) {
    data = data.filter((e) => {
      return +new Date() < e.time;
    });
    total = data.length;
  } else if (status == 2) {
    data = data.filter((e) => {
      return +new Date() >= e.time;
    });
    total = data.length;
  }

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    index: data.callerIndex,
    caller: data.caller,
    amount: data.amount,
    time: data.time,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};

exports.updateHistoryStaking = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  const { caller, amount, currentTime, status } = req.body;

  const historyOptions = {
    caller: caller,
    amount: amount,
    currentTime: currentTime,
    status: status,
  };

  await HistoryStaking.create(historyOptions)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot add history staking. Maybe data was not found!`,
        });
      } else {
        res.send({
          message: "add history staking successfully!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not added",
      });
    });
};

exports.getHistoryStaking = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  let { caller, limit, offset, status } = req.body;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!status) status = 0;
  if (!caller) {
    return res.send({ status: "FAILED", message: "Invalid Address" });
  }

  let data = await HistoryStaking.find({ caller: caller }).sort({
    currentTime: -1,
  });

  let total = data.length;

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    caller: data.caller,
    amount: data.amount,
    currentTime: data.currentTime,
    status: data.status,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};

exports.getRewardByCaller = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  const { caller, limit, offset } = req.body;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!caller) {
    return res.send({ status: "FAILED", message: "Invalid caller" });
  }

  let data = await ClaimEvent.find({ staker: caller });

  let total = data.length;

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    staker: data.staker,
    time: data.time,
    reward_amount: data.reward_amount,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};
