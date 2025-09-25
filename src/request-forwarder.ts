/**
 * 向API服务发送请求的转发器
 * **仅限服务端组件使用**
 */
"use server";
import * as ed25519 from "@noble/ed25519";
import { controlCommandEnum, SignatureAlgorithm } from "./enums";
import {
  BackendResult,
  AllocatedTokens,
  BackendResponse,
  SystemStatus,
  MonitorResponse,
} from "./data-defines";
import { generateNonce } from "./helper";
import {
  ControlAuthBySecretParams,
  ControlAuthRefreshParams,
  ControlAuthByTokenParams,
  ControlCommandRequest,
  ControlCommandResponse,
  ControlResponse,
} from "./request-params";
const headerCSRFToken = "X-CSRF-Token";

/**
 * 控制命令URL
 * @param {string} backendURL 后端URL
 * @returns {string} 控制命令URL
 */
function commandURL(backendURL: string): string {
  return `${backendURL}commands/`;
}
async function signEd25519(
  payload: string,
  privateKey: string
): Promise<string> {
  const key = ed25519.etc.hexToBytes(privateKey).slice(0, 32);
  const msg = Buffer.from(payload, "utf-8");
  const signature = await ed25519.signAsync(msg, key);
  const hex = Buffer.from(signature).toString("hex");
  return hex;
}
/**
 * 解析控制命令响应
 * @param {Response} response 响应
 * @returns {Promise<BackendResult<ControlCommandResponse>>} 控制命令响应
 */
async function parseCommandResponse(
  response: Response
): Promise<BackendResult<ControlCommandResponse>> {
  let result: BackendResult<ControlCommandResponse> = {};
  //if 401 unauthenticated
  if (response.status === 401) {
    result = {
      unauthenticated: true,
    };
    return result;
  }
  //if 200 success
  if (response.status != 200) {
    result = {
      error: response.statusText,
    };
    return result;
  }
  const payload: BackendResponse<ControlCommandResponse> =
    await response.json();
  if (payload.error) {
    result = {
      error: payload.error,
    };
    return result;
  }
  if (!payload.data) {
    result = {
      error: "no data in task response",
    };
    return result;
  }
  result = {
    data: payload.data,
  };
  return result;
}
/**
 * 解析控制命令结果
 * @param {Response} response 响应
 * @returns {Promise<BackendResult>} 控制命令响应
 */
async function parseCommandResult(response: Response): Promise<BackendResult> {
  let result: BackendResult = {};
  //if 401 unauthenticated
  if (response.status === 401) {
    result = {
      unauthenticated: true,
    };
    return result;
  }
  //if 200 success
  if (response.status != 200) {
    result = {
      error: response.statusText,
    };
    return result;
  }
  const payload: BackendResponse<ControlCommandResponse> =
    await response.json();
  if (payload.error) {
    result = {
      error: payload.error,
    };
    return result;
  }
  return result;
}
/**
 * 解析认证令牌
 * @param {Response} response 响应
 * @returns {Promise<BackendResult<AllocatedTokens>>} 认证令牌
 */
async function parseAuthoriedToken(
  response: Response
): Promise<BackendResult<AllocatedTokens>> {
  let result: BackendResult<AllocatedTokens> = {};
  //if 401 unauthenticated
  if (response.status === 401) {
    result = {
      unauthenticated: true,
    };
    return result;
  }
  //if 200 success
  if (response.status != 200) {
    result = {
      error: response.statusText,
    };
    return result;
  }
  const payload: BackendResponse<AllocatedTokens> = await response.json();
  if (payload.error) {
    result = {
      error: payload.error,
    };
    return result;
  }
  if (!payload.data) {
    result = {
      error: "no data in task response",
    };
    return result;
  }
  const tokens: AllocatedTokens = payload.data;
  result = {
    data: tokens,
  };
  return result;
}
/**
 * 发送控制命令，获取标准结果
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 授权令牌
 * @param {string} csrfToken CSRF令牌
 * @param {ControlCommandRequest} command 控制命令请求
 * @returns {Promise<BackendResult<Response>>} 控制命令响应
 */
async function postAuthenticatedCommand(
  backendURL: string,
  accessToken: string,
  csrfToken: string,
  command: ControlCommandRequest
): Promise<BackendResult<Response>> {
  const url = commandURL(backendURL);
  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  if (csrfToken) {
    headers[headerCSRFToken] = csrfToken;
  }
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(command),
    });
    return {
      data: resp,
    };
  } catch (error) {
    //如果是具体错误
    if (error instanceof Error) {
      return {
        error: `请求${url}失败:${error.message}`,
      };
    } else {
      return {
        error: `请求${url}时发生未知错误`,
      };
    }
  }
}
/**
 * 发送原始请求
 * @param {string} url 请求URL
 * @param {HeadersInit} headers 请求头
 * @param {string} body 请求体
 * @returns {Promise<BackendResult<Response>>} 响应
 */
async function postRawRequest(
  url: string,
  headers: HeadersInit,
  body: string
): Promise<BackendResult<Response>> {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    return {
      data: resp,
    };
  } catch (error) {
    //如果是具体错误
    if (error instanceof Error) {
      return {
        error: `请求${url}失败:${error.message}`,
      };
    } else {
      return {
        error: `请求${url}时发生未知错误`,
      };
    }
  }
}
/**
 * 发送控制命令，解析响应内容
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 授权令牌
 * @param {string} csrfToken CSRF令牌
 * @param {ControlCommandRequest} command 控制命令请求
 * @returns {Promise<BackendResult<ControlCommandResponse>>} 控制命令响应
 */
export async function fetchCommandResponse(
  backendURL: string,
  accessToken: string,
  csrfToken: string,
  command: ControlCommandRequest
): Promise<BackendResult<ControlCommandResponse>> {
  const response = await postAuthenticatedCommand(
    backendURL,
    accessToken,
    csrfToken,
    command
  );
  if (response.error) {
    return { error: response.error };
  }
  const result = await parseCommandResponse(response.data!);
  return result;
}
/**
 * 发送控制命令，检查是否成功
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 授权令牌
 * @param {string} csrfToken CSRF令牌
 * @param {ControlCommandRequest} command 控制命令请求
 * @returns {Promise<BackendResult>} 控制命令响应
 */
export async function sendCommand(
  backendURL: string,
  accessToken: string,
  csrfToken: string,
  command: ControlCommandRequest
): Promise<BackendResult> {
  const response = await postAuthenticatedCommand(
    backendURL,
    accessToken,
    csrfToken,
    command
  );
  if (response.error) {
    return { error: response.error };
  }
  const result: BackendResult = await parseCommandResult(response.data!);
  return result;
}

/**
 * 获取系统状态
 * @param {string} backendURL 后端URL
 * @returns {Promise<BackendResult<SystemStatus>>} 系统状态
 */
export async function checkSystemStatus(
  backendURL: string
): Promise<BackendResult<SystemStatus>> {
  const url = commandURL(backendURL);
  const cmd: ControlCommandRequest = {
    type: controlCommandEnum.GetSystemStatus,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(cmd);
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  const result = await parseCommandResponse(resp.data!);
  if (result.unauthenticated) {
    return {
      unauthenticated: true,
    };
  }
  if (result.error) {
    return {
      error: result.error,
    };
  }
  if (result.data && result.data.system_status) {
    return {
      data: result.data.system_status,
    };
  }
  return {
    error: "no system status in response",
  };
}
/**
 * 初始化系统
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} password 认证密钥
 * @returns {Promise<BackendResult>} 初始化结果
 */
export async function initialSystem(
  backendURL: string,
  user: string,
  password: string
): Promise<BackendResult> {
  const cmd: ControlCommandRequest = {
    type: controlCommandEnum.InitializeSystem,
    initialize_system: {
      user,
      password,
    },
  };
  const url = commandURL(backendURL);
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(cmd);
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  const result = await parseCommandResult(resp.data!);
  return result;
}
/**
 * 使用密码认证
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} device 唯一设备标识
 * @param {string} password 认证密钥
 * @returns {Promise<BackendResult<AllocatedTokens>>} 认证令牌
 */
export async function authenticateByPassword(
  backendURL: string,
  user: string,
  device: string,
  password: string
): Promise<BackendResult<AllocatedTokens>> {
  const cmd: ControlAuthBySecretParams = {
    user,
    device,
    secret: password,
  };
  ///auth/by-secret
  const url = `${backendURL}auth/by-secret`;
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(cmd);
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  const result = await parseAuthoriedToken(resp.data!);
  return result;
}
export async function authenticateByToken(
  backendURL: string,
  user: string,
  device: string,
  serial: string,
  signature_algorithm: SignatureAlgorithm,
  private_key: string
): Promise<BackendResult<AllocatedTokens>> {
  if (signature_algorithm != SignatureAlgorithm.Ed25519) {
    return {
      error: `unexpected signature algorithm ${signature_algorithm}`,
    };
  }
  // 1. Create timestamp in RFC3339 format
  const timestamp = new Date().toISOString();

  // 2. Generate random nonce (at least 20 chars)

  const nonce = generateNonce();
  const keyTimestamp = "timestamp";
  const keyNonce = "nonce";
  const keyUser = "user";
  const keySerial = "serial";
  const keyDevice = "device";
  const keys: Record<string, string> = {
    [keyTimestamp]: timestamp,
    [keyNonce]: nonce,
    [keyUser]: user,
    [keySerial]: serial,
    [keyDevice]: device,
  };
  const sortedKeys = Object.keys(keys).sort();
  //使用key=value，用&拼接
  const payload = sortedKeys.map((key) => `${key}=${keys[key]}`).join("&");
  const signature = await signEd25519(payload, private_key);

  const url = `${backendURL}auth/by-token`;
  const params: ControlAuthByTokenParams = {
    user: user,
    device: device,
    serial: serial,
    nonce: nonce,
    timestamp: timestamp,
    signature_algorithm: signature_algorithm,
    signature: signature,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(params);
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  const result = await parseAuthoriedToken(resp.data!);
  //todo: validate nonce
  return result;
}
/**
 * 刷新认证令牌
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} device 唯一设备标识
 * @param {string} token 刷新令牌
 * @returns {Promise<BackendResult<AllocatedTokens>>} 刷新后的认证令牌
 */
export async function refreshAccessToken(
  backendURL: string,
  user: string,
  device: string,
  refreshToken: string
): Promise<BackendResult<AllocatedTokens>> {
  const cmd: ControlAuthRefreshParams = {
    user: user,
    device: device,
    token: refreshToken,
  };
  ///auth/refresh
  const url = `${backendURL}auth/refresh`;
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(cmd);
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  const result = await parseAuthoriedToken(resp.data!);
  return result;
}
/**
 * 打开监控通道
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 访问令牌
 * @param {string} csrfToken CSRF令牌
 * @param {string} guestID 目标云主机id
 * @returns {Promise<BackendResult<MonitorResponse>>} 监控通道数据
 */
export async function openMonitorChannel(
  backendURL: string,
  accessToken: string,
  csrfToken: string,
  guestID: string
): Promise<BackendResult<MonitorResponse>> {
  const url = `${backendURL}monitor/`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-CSRF-Token": csrfToken,
  };
  const body = JSON.stringify({
    id: guestID,
  });
  const resp = await postRawRequest(url, headers, body);
  if (resp.error) {
    return { error: resp.error };
  }
  if (!resp.data) {
    return { error: "无效响应" };
  }
  const result: ControlResponse = await resp.data.json();
  if (result.error) {
    return { error: result.error };
  }
  return { data: result.data as MonitorResponse };
}
