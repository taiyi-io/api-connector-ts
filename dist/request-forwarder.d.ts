import { SignatureAlgorithm } from "./enums";
import { BackendResult, AllocatedTokens, SystemStatus, MonitorResponse } from "./data-defines";
import { ControlCommandRequest, ControlCommandResponse } from "./request-params";
/**
 * 发送控制命令，解析响应内容
 * @param backendURL - 后端URL
 * @param accessToken - 授权令牌
 * @param csrfToken - CSRF令牌
 * @param command - 控制命令请求
 * @returns 控制命令响应
 */
export declare function fetchCommandResponse(backendURL: string, accessToken: string, csrfToken: string, command: ControlCommandRequest): Promise<BackendResult<ControlCommandResponse>>;
/**
 * 发送控制命令，检查是否成功
 * @param backendURL - 后端URL
 * @param accessToken - 授权令牌
 * @param csrfToken - CSRF令牌
 * @param command - 控制命令请求
 * @returns 控制命令响应
 */
export declare function sendCommand(backendURL: string, accessToken: string, csrfToken: string, command: ControlCommandRequest): Promise<BackendResult>;
/**
 * 获取系统状态
 * @param backendURL - 后端URL
 * @returns 系统状态
 */
export declare function checkSystemStatus(backendURL: string): Promise<BackendResult<SystemStatus>>;
/**
 * 初始化系统
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param password - 认证密钥
 * @returns 初始化结果
 */
export declare function initialSystem(backendURL: string, user: string, password: string): Promise<BackendResult>;
/**
 * 使用密码认证
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param password - 认证密钥
 * @returns 认证令牌
 */
export declare function authenticateByPassword(backendURL: string, user: string, device: string, password: string): Promise<BackendResult<AllocatedTokens>>;
/**
 * 使用令牌认证
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param serial - 设备序列号
 * @param signature_algorithm - 签名算法
 * @param private_key - 私钥
 * @returns 认证令牌
 */
export declare function authenticateByToken(backendURL: string, user: string, device: string, serial: string, signature_algorithm: SignatureAlgorithm, private_key: string): Promise<BackendResult<AllocatedTokens>>;
/**
 * 刷新认证令牌
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param refreshToken - 刷新令牌
 * @returns 刷新后的认证令牌
 */
export declare function refreshAccessToken(backendURL: string, user: string, device: string, refreshToken: string): Promise<BackendResult<AllocatedTokens>>;
/**
 * 打开监控通道
 * @param backendURL - 后端URL
 * @param accessToken - 访问令牌
 * @param csrfToken - CSRF令牌
 * @param guestID - 目标云主机id
 * @returns 监控通道数据
 */
export declare function openMonitorChannel(backendURL: string, accessToken: string, csrfToken: string, guestID: string): Promise<BackendResult<MonitorResponse>>;
