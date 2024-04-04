require("dotenv").config();
const db = require("../models");
const WhitelistManager = db.whitelistManager;

exports.addWhitelist = async (req, res) => {
  const { poolType, buyer, amount, price } = req.body;
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });

  const whitelistOptions = {
    poolType: poolType,
    buyer: buyer,
    amount: amount,
    price: price,
  };

  await WhitelistManager.create(whitelistOptions)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot add whitelist. Maybe data was not found!`,
        });
      } else {
        res.send({
          message: "add whitelist successfully!",
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

exports.updateWhitelist = async (req, res) => {
  const { poolType, buyer, amount, price } = req.body;
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });

  const filter = {
    poolType: poolType,
    buyer: buyer,
  };

  const update = {
    amount: amount,
    price: price,
  };

  await WhitelistManager.findOneAndUpdate(filter, update)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update whitelist. Maybe data was not found!`,
        });
      } else {
        res.send({
          message: "update whitelist successfully!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Could not updated",
      });
    });
};

exports.getWhitelist = async (req, res) => {
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });
  const { poolType, limit, offset } = req.body;
  if (!limit) limit = 15;
  if (!offset) offset = 0;
  if (!poolType) {
    return res.send({ status: "FAILED", message: "Invalid pool type" });
  }

  let data = await WhitelistManager.find({ poolType: poolType });

  let total = data.length;

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    // poolType: data.poolType,
    buyer: data.buyer,
    amount: data.amount,
    price: data.price,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};
