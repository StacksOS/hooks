import * as dotenv from "dotenv";
import fetch from "node-fetch";
import yaml from "js-yaml";
import fs from "fs";
import { io } from "socket.io-client";
import { connectWebSocketClient } from "@stacks/blockchain-api-client";
import { addSubmission } from "./api.js";

dotenv.config();

const client = await connectWebSocketClient(process.env.STACKS_WSS_URL);
const config = yaml.load(fs.readFileSync("./hooks.yaml", "utf8"));
const chainhook = config.networks[process.env.NETWORK];

console.info(`Listening to ${chainhook.event.contractAddress}`);

await client.subscribeAddressTransactions(
  chainhook?.event?.contractAddress,
  async (event) => {
    try {
      const response = await fetch(
        `${process.env.STACKS_API_URL}/extended/v1/tx/${event.tx_id}`
      );
      const data = await response.json();
      if (data?.contract_call?.function_name === chainhook?.event?.action) {
        if (data?.tx_status === "success") {
          addSubmission({
            proposed_by: data?.sender_address,
            tx_id: data.tx_id,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
);
