import dotenv from "dotenv";
import { newInsecureConnector, TaiyiConnector } from "../src/index";
dotenv.config();

export async function getTestConnector(): Promise<TaiyiConnector> {
  const deviceID = "test-device";
  const connector = await newInsecureConnector(
    deviceID,
    process.env.ACCESS_STRING!,
    process.env.BACKEND_HOST!,
    Number(process.env.BACKEND_PORT)
  );
  return connector;
}
