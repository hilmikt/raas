import { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PK = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const accounts = PK ? [`0x${PK}`] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    sepolia: {
      type: "http",                      // explicit to silence HHE15
      url: process.env.SEPOLIA_RPC || "",
      chainId: 11155111,
      accounts,
    },
  },
  plugins: [hardhatEthers],
};

export default config;
