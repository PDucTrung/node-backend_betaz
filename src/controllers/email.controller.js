require("dotenv").config();
const db = require("../models");
const nodemailer = require("nodemailer");
const emailConfig = require("../config/email.config");
const EmailSubscribe = db.email;

const adminEmail = emailConfig.ADMIN_EMAIL;
const adminEmailPass = emailConfig.ADMIN_EMAIL_PASS;

exports.sendEmail = async (req, res) => {
  const { email, subject, text } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: adminEmailPass,
    },
  });

  const mailOptions = {
    from: adminEmail,
    to: email,
    subject: subject,
    text: text,
  };

  const existingEmail = await EmailSubscribe.findOne({
    email: email,
  });
  if (!existingEmail) {
    await EmailSubscribe.create({ email });
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send({
        status: "OK",
        ret: {
          email: email,
        },
      });
    }
  });
};

exports.getSubcribeEmail = async (req, res) => {
  let limit = req.body.limit;
  let offset = req.body.offset;
  if (!limit) limit = 15;
  if (!offset) offset = 0;

  let data = await EmailSubscribe.find();

  let total = data.length;

  // pagination
  data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // format result
  const dataTable = data.map((data) => ({
    email: data.email,
    subcribeAt: data.createdAt,
  }));

  return res.send({ status: "OK", ret: dataTable, total: total });
};

exports.getEmailExist = async (req, res) => {
  const { email } = req.body;
  if (!req.body) return res.send({ status: "FAILED", message: "No Input" });

  const existingEmail = await EmailSubscribe.findOne({
    email: email,
  });

  return res.send({ status: "OK", ret: existingEmail?.email });
};
