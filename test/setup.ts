import * as dotenv from "dotenv";
import * as path from "path";
import { TaiyiConnector } from "../src/connector";
import { getInsecureConnector } from "../src/insecure-store";

// 加载 .env.test 文件
dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });

const REQUIRED_VARS = ["BACKEND_HOST", "BACKEND_PORT", "ACCESS_STRING", "DEVICE_ID"] as const;

function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `缺少必要的环境变量：${missing.join(", ")}。请创建 .env.test 文件，参考 .env.test.example`
    );
  }
}

let _connector: TaiyiConnector | null = null;

export async function getTestConnector(): Promise<TaiyiConnector> {
  if (_connector) {
    return _connector;
  }
  validateEnv();
  const host = process.env.BACKEND_HOST!;
  const port = Number(process.env.BACKEND_PORT!);
  const accessString = process.env.ACCESS_STRING!;
  const deviceID = process.env.DEVICE_ID!;

  const connector = await getInsecureConnector(deviceID, host, port);
  const result = await connector.authenticateByToken(accessString);
  if (result.error) {
    throw new Error(`认证失败: ${result.error}`);
  }
  if (result.unauthenticated) {
    throw new Error(`未认证: ${result.unauthenticated}`);
  }
  _connector = connector;
  return connector;
}
