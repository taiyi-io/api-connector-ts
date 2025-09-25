import { SignatureAlgorithm } from "./enums";
import { BackendResult, AllocatedTokens, SystemStatus, MonitorResponse } from "./data-defines";
import { ControlCommandRequest, ControlCommandResponse } from "./request-params";
/**
 * 发送控制命令，解析响应内容
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 授权令牌
 * @param {string} csrfToken CSRF令牌
 * @param {ControlCommandRequest} command 控制命令请求
 * @returns {Promise<BackendResult<ControlCommandResponse>>} 控制命令响应
 */
export declare function fetchCommandResponse(backendURL: string, accessToken: string, csrfToken: string, command: ControlCommandRequest): Promise<BackendResult<ControlCommandResponse>>;
/**
 * 发送控制命令，检查是否成功
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 授权令牌
 * @param {string} csrfToken CSRF令牌
 * @param {ControlCommandRequest} command 控制命令请求
 * @returns {Promise<BackendResult>} 控制命令响应
 */
export declare function sendCommand(backendURL: string, accessToken: string, csrfToken: string, command: ControlCommandRequest): Promise<BackendResult>;
/**
 * 获取系统状态
 * @param {string} backendURL 后端URL
 * @returns {Promise<BackendResult<SystemStatus>>} 系统状态
 */
export declare function checkSystemStatus(backendURL: string): Promise<BackendResult<SystemStatus>>;
/**
 * 初始化系统
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} password 认证密钥
 * @returns {Promise<BackendResult>} 初始化结果
 */
export declare function initialSystem(backendURL: string, user: string, password: string): Promise<BackendResult>;
/**
 * 使用密码认证
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} device 唯一设备标识
 * @param {string} password 认证密钥
 * @returns {Promise<BackendResult<AllocatedTokens>>} 认证令牌
 */
export declare function authenticateByPassword(backendURL: string, user: string, device: string, password: string): Promise<BackendResult<AllocatedTokens>>;
export declare function authenticateByToken(backendURL: string, user: string, device: string, serial: string, signature_algorithm: SignatureAlgorithm, private_key: string): Promise<BackendResult<AllocatedTokens>>;
/**
 * 刷新认证令牌
 * @param {string} backendURL 后端URL
 * @param {string} user 用户标识
 * @param {string} device 唯一设备标识
 * @param {string} token 刷新令牌
 * @returns {Promise<BackendResult<AllocatedTokens>>} 刷新后的认证令牌
 */
export declare function refreshAccessToken(backendURL: string, user: string, device: string, refreshToken: string): Promise<BackendResult<AllocatedTokens>>;
/**
 * 打开监控通道
 * @param {string} backendURL 后端URL
 * @param {string} accessToken 访问令牌
 * @param {string} csrfToken CSRF令牌
 * @param {string} guestID 目标云主机id
 * @returns {Promise<BackendResult<MonitorResponse>>} 监控通道数据
 */
export declare function openMonitorChannel(backendURL: string, accessToken: string, csrfToken: string, guestID: string): Promise<BackendResult<MonitorResponse>>;
