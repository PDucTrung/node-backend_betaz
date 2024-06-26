require("dotenv").config();

module.exports = {
  AZ_PROVIDER: process.env.AZ_PROVIDER_URL,
  ETH_PROVIDER: process.env.ETH_PROVIDER_URL,
  POLKADOT_WALLET_ADDRESS: process.env.POLKADOT_WALLET_ADDRESS,
  POLKADOT_WALLET_PHRASE: process.env.POLKADOT_WALLET_PHRASE,
  METAMASK_WALLET_ADDRESS: process.env.METAMASK_PRIVATE_ADDRESS,
  METAMASK_WALLET_PRIVATE_KEY: process.env.METAMASK_PRIVATE_KEY,
};
