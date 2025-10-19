import { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const pk = process.env.PRIVATE_KEY ?? "";
const accounts = pk ? [`0x${pk.replace(/^0x/, "")}`] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC || "",
      accounts
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC || "",
      accounts
    }
  },
  plugins: [hardhatEthers]
};
export default config;
