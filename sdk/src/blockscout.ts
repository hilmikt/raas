import axios from "axios";
import { z } from "zod";

const txSchema = z.object({
  hash: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  value: z.string().optional(),
});

export async function getTx(baseUrl: string, txHash: string) {
  const url = `${baseUrl}/api/v2/transactions/${txHash}`;
  const { data } = await axios.get(url, { timeout: 10000 });
  return txSchema.parse(data);
}
