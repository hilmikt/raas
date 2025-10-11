// sdk/index.ts
import axios from "axios";

export class BlockscoutClient {
  constructor(public baseUrl: string) {}

  async getContractTxs(address: string) {
    const res = await axios.get(`${this.baseUrl}/api/v2/addresses/${address}/transactions`);
    return res.data;
  }

  async getTokenTransfers(address: string) {
    const res = await axios.get(`${this.baseUrl}/api/v2/addresses/${address}/token-transfers`);
    return res.data;
  }
}

// Example usage:
// const blockscout = new BlockscoutClient("https://eth.blockscout.com");
// blockscout.getContractTxs("0x1234...");
