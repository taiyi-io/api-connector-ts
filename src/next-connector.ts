/**
 * 适用于Nextjs的封装，安全存储TaiyiConnector
 * 已内部封装localstorage和cookie，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * getNextConnector() 基于后端服务地址获取稳定的connector
 */
import { TaiyiConnector } from "./connector";
import { AllocatedTokens } from "./data-defines";
import {
  getNextStore,
  retrieveAllocatedTokens,
  retrieveCriticalValues,
  setDeviceID,
  storeAllocatedTokens,
  handleStoreStatusChanged,
} from "./next-secure-store";
import { createId } from "@paralleldrive/cuid2";

const storageKeyDevice = "taiyi_device";

/**
 * 获取适配Nextjs框架，数据安全存储的TaiyiConnector实例
 * 自动分配设备标识并保持一致，无需手动干预。数据基于cookie和localstorage保存
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号，默认值为5851
 * @returns TaiyiConnector
 * @throws 令牌失效
 * @example
 * ...
 * const connector = await getNextConnector(
 *   process.env.BACKEND_HOST!,
 *   Number(process.env.BACKEND_PORT)
 * );
 * await connector.authenticateByToken(token);
 * await connector.getGuest(guestID);
 */
export async function getNextConnector(
  backendHost: string,
  backendPort: number = 5851
): Promise<TaiyiConnector> {
  const deviceID = await getDeviceFromBrowser();
  const store = await getNextStore(deviceID, backendHost, backendPort);
  const connector = new TaiyiConnector(
    store.backend_host,
    store.backend_port,
    store.device
  );
  connector.bindCallback(
    store.id,
    storeAllocatedTokens,
    retrieveAllocatedTokens,
    handleStoreStatusChanged
  );
  if (store.authenticated) {
    const values = await retrieveCriticalValues(store.id);
    if (values) {
      const tokens: AllocatedTokens = {
        access_token: store.access_token,
        access_expired_at: store.access_expired_at,
        refresh_token: values.refresh_token,
        refresh_expired_at: values.refresh_expire,
        csrf_token: values.csrf_token,
        public_key: store.public_key,
        algorithm: store.algorithm,
        roles: store.roles,
        user: store.user,
      };
      const result = connector.loadTokens(tokens);
      if (result.error) {
        throw new Error(`加载已分配令牌失败:${result.error}`);
      }
    }
  }
  return connector;
}

async function getDeviceFromBrowser(): Promise<string> {
  // 尝试从localStorage读取deviceID
  const storedDeviceID = localStorage.getItem(storageKeyDevice);
  if (storedDeviceID && storedDeviceID.trim() !== "") {
    await setDeviceID(storedDeviceID);
    return storedDeviceID;
  }
  // 获取浏览器类型，无法获取则使用默认值
  let browser = "browser";
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    if (navigator.userAgent.includes("Chrome")) {
      browser = "chrome";
    } else if (navigator.userAgent.includes("Firefox")) {
      browser = "firefox";
    } else if (navigator.userAgent.includes("Safari")) {
      browser = "safari";
    } else if (
      navigator.userAgent.includes("MSIE") ||
      navigator.userAgent.includes("Trident")
    ) {
      browser = "ie";
    } else if (navigator.userAgent.includes("Edge")) {
      browser = "edge";
    }
  } else {
    browser = "browser";
  }
  // 生成新的deviceID
  const id = createId();
  const deviceID = `${browser}-${id}`;
  // 保存到localStorage
  localStorage.setItem(storageKeyDevice, deviceID);
  await setDeviceID(deviceID);
  return deviceID;
}
