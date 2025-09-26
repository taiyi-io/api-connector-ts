"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaiyiConnector = void 0;
/**
 * 核心文件，定义用于访问平台服务的TaiyiConnector
 */
const enums_1 = require("./enums");
const request_forwarder_1 = require("./request-forwarder");
const helper_1 = require("./helper");
const cuid2_1 = require("@paralleldrive/cuid2");
var AuthMethod;
(function (AuthMethod) {
    AuthMethod["Secret"] = "secret";
    AuthMethod["Token"] = "token";
})(AuthMethod || (AuthMethod = {}));
const API_VERSION = "v1";
/**
 * 提供与Taiyi Control服务进行交互的方法，包括认证、发送命令、查询访问记录等,系统状态查询与初始化接口可以直接调用，其他接口需要先认证才能调用。
 * 调用者需要实现 SetTokenHandler 和 GetTokenHandler，为 TaiyiConnector 提供令牌的存取能力。如果需要在校验信息失效时，进行特殊处理，可以通过可选的 bindAuthExpiredEvent 方法注册回调。
 * @class TaiyiConnector
 * @example
 * ...
 * //构建 TaiyiConnector 实例
 * const connector = new TaiyiConnector(backendHost, backendPort, deviceID);
 * //绑定令牌存取回调
 * connector.bindCallback(store.id, storeAllocatedTokens, retrieveAllocatedTokens, handleStoreStatusChanged);
 * //可选：绑定校验过期回调
 * connector.bindAuthExpiredEvent(handleAuthExpired);
 * const authResult = await connector.authenticateByToken(token);
 * if (authResult.unauthenticated) {
 *   throw new Error("校验失败");
 * } else if (authResult.error) {
 *   //其他错误
 *   throw new Error(authResult.error);
 * }
 * const tokens = authResult.data;
 * console.log("令牌校验成功,当前用户 %s, 角色 %s", tokens.user, tokens.roles);
 * //从第13个记录开始，查询10条记录
 * const result = await connector.queryGuests(13, 10);
 * if (result.error) {
 *   throw new Error(result.error);
 * }
 * //PaginationResult
 * const data = result.data;
 * console.log(
 *   "返回结果 %s, 总记录数 %d",
 *   JSON.stringify(data.records),
 *   data.total
 * );
 */
class TaiyiConnector {
    /**
     * 构造函数
     * @param backendHost - 后端Control服务地址
     * @param backendPort - 后端Control服务端口，默认值为5851
     * @param device - 设备标识
     */
    constructor(backendHost, backendPort = 5851, device) {
        this._authMethod = AuthMethod.Secret;
        this._privateKey = "";
        this._user = "";
        this._device = "";
        this._serial = "";
        this._password = "";
        this._signatureAlgorithm = enums_1.SignatureAlgorithm.Ed25519;
        this._refreshTimer = null;
        this._locale = enums_1.Locale.Chinese;
        this._authenticated = false;
        this._authenticatedTokens = {};
        this._callbackReceiver = "";
        this._onAuthExpired = undefined;
        this._roles = [];
        this._keepAlive = false;
        this._backendURL = `http://${backendHost}:${backendPort}/api/${API_VERSION}/`;
        this._device = device;
        this._id = (0, cuid2_1.createId)();
    }
    /**
     * 释放资源
     */
    release() {
        this.stopHeartBeat();
        // console.log(`connector-${this._id} released`);
    }
    /**
     * 获取连接标识
     * @returns 连接标识
     */
    get id() {
        return this._id;
    }
    /**
     * 获取认证状态
     * @returns 认证状态
     */
    get authenticated() {
        return this._authenticated;
    }
    /**
     * 获取用户标识
     * @returns 用户标识
     */
    get user() {
        return this._user;
    }
    /**
     * 获取用户角色
     * @returns 用户角色
     */
    get roles() {
        return this._roles;
    }
    /**
     * 绑定令牌更新回调
     * @param receiver - 接受者标识
     * @param setter - 令牌更新回调
     * @param getter - 令牌获取回调
     * @param stateChange - 状态变更回调
     */
    bindCallback(receiver, setter, getter, stateChange) {
        this._callbackReceiver = receiver;
        this._setTokens = setter;
        this._getTokens = getter;
        if (stateChange) {
            this._stateChange = stateChange;
        }
    }
    /**
     * 绑定认证过期事件
     * @param callback - 认证过期事件回调
     */
    bindAuthExpiredEvent(callback) {
        this._onAuthExpired = callback;
    }
    /**
     * 检查用户是否具有指定角色
     * @param role - 角色
     * @returns 是否具有角色
     */
    hasRole(role) {
        return this._roles.includes(role);
    }
    /**
     * 密码认证
     * @param user - 用户标识
     * @param password - 密码
     * @returns 已认证令牌
     */
    authenticateByPassword(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            this._user = user;
            this._password = password;
            this._authMethod = AuthMethod.Secret;
            const tokenResult = yield (0, request_forwarder_1.authenticateByPassword)(this._backendURL, user, this._device, password);
            if (tokenResult.unauthenticated || tokenResult.error) {
                return {
                    unauthenticated: tokenResult.unauthenticated,
                    error: tokenResult.error,
                };
            }
            else if (!tokenResult.data) {
                return {
                    error: "无有效令牌",
                };
            }
            const tokens = tokenResult.data;
            const result = this.loadTokens(tokens);
            if (result.error) {
                return {
                    error: result.error,
                };
            }
            //只有进行登录的主connector定时更新
            this.startHeartBeat();
            yield this.onTokenUpdated(tokens);
            return {
                data: tokens,
            };
        });
    }
    /**
     * 使用秘钥字符串校验
     * @param token - 秘钥字符串
     * @returns 已认证令牌
     */
    authenticateByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            //decode from base64
            const payload = atob(token);
            //parse json
            const key = JSON.parse(payload);
            if (!key.id) {
                return {
                    error: "秘钥字符串格式错误",
                };
            }
            this._user = key.id;
            this._privateKey = key.private_key;
            this._authMethod = AuthMethod.Token;
            this._serial = key.serial;
            this._signatureAlgorithm = key.algorithm;
            const tokenResult = yield (0, request_forwarder_1.authenticateByToken)(this._backendURL, key.id, this._device, key.serial, key.algorithm, key.private_key);
            if (tokenResult.unauthenticated) {
                return {
                    unauthenticated: tokenResult.unauthenticated,
                };
            }
            else if (tokenResult.error) {
                return {
                    error: tokenResult.error,
                };
            }
            else if (!tokenResult.data) {
                return {
                    error: "无有效令牌",
                };
            }
            const tokens = tokenResult.data;
            const result = this.loadTokens(tokens);
            if (result.error) {
                return {
                    error: result.error,
                };
            }
            //只有进行登录的主connector定时更新
            this.startHeartBeat();
            yield this.onTokenUpdated(tokens);
            return {
                data: tokens,
            };
        });
    }
    /**
     * 令牌更新回调
     * @param tokens - 已分配令牌
     * @returns 无返回值
     */
    onTokenUpdated(tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._callbackReceiver && this._setTokens) {
                yield this._setTokens(this._callbackReceiver, tokens);
            }
        });
    }
    /**
     * 刷新令牌
     * @returns 刷新结果
     */
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._authenticated) {
                return {
                    error: "尚未认证",
                };
            }
            const result = yield (0, request_forwarder_1.refreshAccessToken)(this._backendURL, this._user, this._device, this._authenticatedTokens.refresh_token);
            if (result.unauthenticated) {
                this._authenticated = false;
                return {
                    unauthenticated: result.unauthenticated,
                };
            }
            else if (result.error) {
                return {
                    error: result.error,
                };
            }
            else if (!result.data) {
                return {
                    error: "刷新令牌失败",
                };
            }
            const tokens = result.data;
            const err = this.validateTokens(tokens);
            if (err) {
                console.log(`connector-${this._id}: 刷新令牌校验失败,${err}`);
                return {
                    error: "无效令牌",
                };
            }
            this._authenticatedTokens = tokens;
            yield this.onTokenUpdated(tokens);
            return {};
        });
    }
    /**
     * 直接加载令牌，初始化校验状态
     * @param tokens - 令牌
     * @returns 加载结果
     */
    loadTokens(tokens) {
        const error = this.validateTokens(tokens);
        if (error) {
            console.log(`connector-${this._id}: 加载令牌校验失败,${error}`);
            return {
                error: "无效令牌",
            };
        }
        this._authenticated = true;
        this._authenticatedTokens = tokens;
        this._roles = tokens.roles;
        //using qualified id
        this._user = tokens.user;
        return {};
    }
    /**
     * 计划刷新令牌,访问令牌过期时间提前90秒，自动触发刷新令牌
     */
    startHeartBeat() {
        //access_expired_at根据RFC3339转换为时间，提前90秒，自动触发refreshToken
        const expireTime = new Date(this._authenticatedTokens.access_expired_at).getTime() -
            Date.now() -
            90 * 1000;
        //延迟15秒用于测试
        // const expireTime = 15 * 1000;
        this.stopHeartBeat();
        this._refreshTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.keepAlive();
        }), expireTime);
        this._keepAlive = true;
        // console.log(
        //   `connector-${this._id}: start keep alive timer ${this._refreshTimer}`
        // );
    }
    keepAlive() {
        return __awaiter(this, void 0, void 0, function* () {
            //先同步令牌
            yield this.syncTokens();
            //刷新令牌
            const refreshResult = yield this.refreshToken();
            if (refreshResult.unauthenticated || refreshResult.error) {
                console.log(`connector-${this._id}: expired when keep alive, refresh ${this._authenticatedTokens.refresh_token}, ${refreshResult.unauthenticated}, ${refreshResult.error}`);
                this.onValidationExpired();
                return;
            }
            // console.log(`connector-${this._id}: keep alive success`);
        });
    }
    /**
     * 停止刷新令牌，调用此方法后，令牌将不再自动刷新
     */
    stopHeartBeat() {
        if (!this._keepAlive) {
            return;
        }
        if (this._refreshTimer) {
            // console.log(
            //   `connector-${this._id}: stop keep alive timer ${this._refreshTimer}`
            // );
            clearInterval(this._refreshTimer);
        }
        this._keepAlive = false;
    }
    /**
     * 校验令牌过期。 校验令牌是否过期，过期则触发刷新令牌
     */
    onValidationExpired() {
        if (!this._authenticated) {
            //only invoke once
            return;
        }
        console.log(`connector-${this._id}: validation expired`);
        this._authenticated = false;
        this._authenticatedTokens = {};
        this.stopHeartBeat();
        if (this._stateChange) {
            this._stateChange(this._callbackReceiver, false);
        }
        if (this._onAuthExpired) {
            this._onAuthExpired(this._id);
        }
    }
    /**
     * 校验令牌
     * @param tokens - 分配到的令牌
     * @returns 非空则为错误信息
     */
    validateTokens(tokens) {
        const now = Date.now();
        if (!tokens.user) {
            return "无用户标识";
        }
        if (!tokens.access_token) {
            return `未给用户${tokens.user}分配访问令牌`;
        }
        if (!tokens.refresh_token) {
            return `未给用户${tokens.user}分配更新令牌`;
        }
        if (!tokens.csrf_token) {
            return `未给用户${tokens.user}分配CSRF令牌`;
        }
        if (!tokens.public_key) {
            return `未给用户${tokens.user}指定公钥`;
        }
        if (!tokens.algorithm) {
            return `未给用户${tokens.user}指定算法`;
        }
        if (!tokens.refresh_expired_at) {
            return `未给用户${tokens.user}指定更新令牌失效时间`;
        }
        //检查过期时间，允许5分钟的偏差，无效则异常
        const ToleranceDuration = 10 * 60 * 1000;
        const accessExpired = new Date(tokens.access_expired_at);
        if (now - ToleranceDuration > accessExpired.getTime()) {
            return `用户${tokens.user}访问令牌过期: ${accessExpired.toLocaleString()},刷新令牌${tokens.refresh_token} `;
            return "刷新令牌过期";
        }
        const refreshExpired = new Date(tokens.refresh_expired_at);
        if (now - ToleranceDuration > refreshExpired.getTime()) {
            return `用户${tokens.user}刷新令牌过期: ${refreshExpired.toLocaleString()},刷新令牌${tokens.refresh_token} `;
        }
        return "";
    }
    /**
     * 发送控制命令，获取响应内容
     * @param cmd - 控制命令请求
     * @returns 控制命令响应
     */
    requestCommandResponse(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield (0, request_forwarder_1.fetchCommandResponse)(this._backendURL, this._authenticatedTokens.access_token, this._authenticatedTokens.csrf_token, cmd);
            if (result.unauthenticated) {
                // 刷新令牌
                result = yield this.resendCommand(cmd);
                if (result.unauthenticated) {
                    //压缩错误信息
                    return {
                        error: `授权失效`,
                    };
                }
            }
            if (result.error) {
                return {
                    error: result.error,
                };
            }
            else if (!result.data) {
                return {
                    error: "没有响应内容",
                };
            }
            return {
                data: result.data,
            };
        });
    }
    /**
     * 重发指令
     * @param cmd - 请求指令
     * @returns 请求响应
     */
    resendCommand(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const changed = yield this.syncTokens();
            if (!changed) {
                //无令牌变化，自己尝试刷新
                const refreshResult = yield this.refreshToken();
                if (refreshResult.unauthenticated || refreshResult.error) {
                    console.log(`connector-${this._id}: expired when resend command ${cmd.type}, refresh ${this._authenticatedTokens.refresh_token}, ${refreshResult.unauthenticated}, ${refreshResult.error}`);
                    this.onValidationExpired();
                    return {
                        unauthenticated: refreshResult.unauthenticated,
                        error: refreshResult.error,
                    };
                }
            }
            //request again
            const result = yield (0, request_forwarder_1.fetchCommandResponse)(this._backendURL, this._authenticatedTokens.access_token, this._authenticatedTokens.csrf_token, cmd);
            return result;
        });
    }
    /**
     * 同步令牌。从存储中获取令牌，更新本地令牌
     * @returns 是否令牌已更新
     */
    syncTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentAccessToken = this._authenticatedTokens.access_token;
            let changed = false;
            if (this._getTokens) {
                const updatedTokens = yield this._getTokens(this._callbackReceiver);
                if (updatedTokens.access_token &&
                    currentAccessToken != updatedTokens.access_token) {
                    //令牌已更新
                    this._authenticatedTokens = updatedTokens;
                    changed = true;
                }
            }
            return changed;
        });
    }
    /**
     * 发送控制命令
     * @param cmd - 控制命令请求
     * @returns 控制命令响应
     */
    sendCommand(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, request_forwarder_1.sendCommand)(this._backendURL, this._authenticatedTokens.access_token, this._authenticatedTokens.csrf_token, cmd);
            if (result.unauthenticated) {
                const resendResult = yield this.resendCommand(cmd);
                if (resendResult.unauthenticated) {
                    return {
                        unauthenticated: resendResult.unauthenticated,
                    };
                }
                result.error = resendResult.error;
            }
            return result;
        });
    }
    /**
     * 启动任务，发送控制命令，返回任务ID
     * @param cmd - 控制命令请求
     * @returns 任务ID
     */
    startTask(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (resp.data && resp.data.id) {
                return {
                    data: resp.data.id,
                };
            }
            return {
                error: "没有任务ID",
            };
        });
    }
    /**
     * 执行任务，发送控制命令，等待任务完成
     * @param cmd - 控制命令请求
     * @param timeoutSeconds - 超时时间（秒），默认5分钟
     * @param intervalSeconds - 检查间隔（秒），默认1秒
     * @returns 任务数据
     */
    executeTask(cmd_1) {
        return __awaiter(this, arguments, void 0, function* (cmd, timeoutSeconds = 300, intervalSeconds = 1) {
            const taskIDResp = yield this.startTask(cmd);
            if (taskIDResp.error) {
                return {
                    error: taskIDResp.error,
                };
            }
            return yield this.waitTask(taskIDResp.data, timeoutSeconds, intervalSeconds);
        });
    }
    /**
     * 获取任务详情
     * @param taskID - 任务ID
     * @returns 任务数据
     */
    getTask(taskID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetTask,
                get_task: {
                    id: taskID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (resp.data && resp.data.task) {
                return {
                    data: resp.data.task,
                };
            }
            return {
                error: "没有任务数据",
            };
        });
    }
    /**
     * 等待任务完成
     * @param taskID - 任务ID
     * @param timeoutSeconds - 超时时间（秒）
     * @param intervalSeconds - 检查间隔（秒）
     * @returns 任务数据
     */
    waitTask(taskID_1) {
        return __awaiter(this, arguments, void 0, function* (taskID, timeoutSeconds = 300, intervalSeconds = 1) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeoutSeconds * 1000) {
                const resp = yield this.getTask(taskID);
                if (resp.error) {
                    return {
                        error: resp.error,
                    };
                }
                if (resp.data && resp.data.status === enums_1.TaskStatus.Completed) {
                    if (resp.data.error) {
                        return {
                            error: resp.data.error,
                        };
                    }
                    return {
                        data: resp.data,
                    };
                }
                // Wait for the interval before next check
                yield new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
            }
            throw new Error(`任务${taskID}等待超过${timeoutSeconds}秒`);
        });
    }
    /**
     * 获取系统状态
     * @returns 系统状态
     */
    getSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, request_forwarder_1.checkSystemStatus)(this._backendURL);
            if (result.error) {
                return {
                    error: result.error,
                };
            }
            else if (!result.data) {
                return {
                    error: "获取系统状态失败",
                };
            }
            const status = result.data;
            this._locale = status.locale;
            return {
                data: status,
            };
        });
    }
    /**
     * 初始化系统
     * @param user - 用户标识
     * @param password - 密码
     * @returns 初始化结果
     */
    initializeSystem(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, request_forwarder_1.initialSystem)(this._backendURL, user, password);
            if (result.error) {
                return {
                    error: result.error,
                };
            }
            return {};
        });
    }
    /**
     * 生成用户令牌
     * @param user - 用户标识
     * @param description - 描述
     * @param expireInMonths - 过期时间（月）
     * @returns 用户令牌
     */
    generateUserToken(user, description, expireInMonths) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GenerateUserToken,
                generate_user_token: {
                    user,
                    description,
                    months: expireInMonths,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.private_key) {
                return {
                    error: "生成用户令牌失败",
                };
            }
            const key = resp.data.private_key;
            const payload = JSON.stringify(key);
            //base64 encoding
            const base64Payload = btoa(payload);
            return {
                data: base64Payload,
            };
        });
    }
    // 以下为对外功能接口
    /**
     * 尝试创建云主机，成功返回任务ID
     * @param poolID - 计算资源池
     * @param system - 目标系统
     * @param config - 云主机配置
     * @returns 任务id
     */
    tryCreateGuest(poolID, system, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CreateGuest,
                create_guest: Object.assign(Object.assign({}, config), { pool: poolID, system: system }),
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试创建云主机失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 创建云主机，成功返回云主机ID
     * @param poolID - 计算资源池
     * @param system - 目标系统
     * @param config - 云主机配置
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 云主机ID
     */
    createGuest(poolID_1, system_1, config_1) {
        return __awaiter(this, arguments, void 0, function* (poolID, system, config, timeoutSeconds = 300) {
            const taskResult = yield this.tryCreateGuest(poolID, system, config);
            if (taskResult.error) {
                return taskResult;
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            if (!taskData.data || !taskData.data.guest) {
                return {
                    error: "云主机任务完成但是没有云主机ID",
                };
            }
            return {
                data: taskData.data.guest,
            };
        });
    }
    /**
     * 尝试删除云主机，成功返回任务ID
     * @param guestID - 云主机ID
     * @returns 任务id
     */
    tryDeleteGuest(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeleteGuest,
                delete_guest: {
                    guest: guestID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试删除云主机失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 删除云主机
     * @param guestID - 云主机ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 删除结果
     */
    deleteGuest(guestID_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, timeoutSeconds = 300) {
            const taskResult = yield this.tryDeleteGuest(guestID);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 获取云主机详情
     * @param guestID - 云主机ID
     * @returns 云主机详情
     */
    getGuest(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetGuest,
                get_guest: {
                    id: guestID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (!resp.data || !resp.data.guest) {
                return {
                    error: "获取云主机详情失败",
                };
            }
            return {
                data: resp.data.guest,
            };
        });
    }
    /**
     * 尝试启动云主机，成功返回任务ID
     * @param guestID - 云主机ID
     * @param media - ISO镜像ID（可选）
     * @returns 任务id
     */
    tryStartGuest(guestID, media) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.StartGuest,
                start_guest: {
                    guest: guestID,
                    media: media,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试启动云主机失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 启动云主机
     * @param guestID - 云主机ID
     * @param media - ISO镜像ID（可选）
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 启动结果
     */
    startGuest(guestID_1, media_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, media, timeoutSeconds = 300) {
            const taskResult = yield this.tryStartGuest(guestID, media);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试停止云主机，成功返回任务ID
     * @param guestID - 云主机ID
     * @param reboot - 是否重启云主机
     * @param force - 是否强制执行
     * @returns 任务id
     */
    tryStopGuest(guestID, reboot, force) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.StopGuest,
                stop_guest: {
                    guest: guestID,
                    reboot,
                    force,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "任务成功启动但无法获取任务id",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 停止云主机
     * @param guestID - 云主机ID
     * @param reboot - 是否重启云主机
     * @param force - 是否强制执行
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 停止结果
     */
    stopGuest(guestID_1, reboot_1, force_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, reboot, force, timeoutSeconds = 300) {
            const taskResult = yield this.tryStopGuest(guestID, reboot, force);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试添加卷，成功返回任务ID
     * @param guestID - 云主机ID
     * @param volume - 磁盘卷配置
     * @returns 任务id
     */
    tryAddVolume(guestID, volume) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddVolume,
                add_volume: {
                    guest: guestID,
                    volume,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "任务成功启动但无法获取任务id",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 添加卷
     * @param guestID - 云主机ID
     * @param volume - 磁盘卷配置
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 添加结果
     */
    addVolume(guestID_1, volume_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, volume, timeoutSeconds = 300) {
            const taskResult = yield this.tryAddVolume(guestID, volume);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试删除卷，成功返回任务ID
     * @param guestID - 云主机ID
     * @param tag - 卷标签
     * @returns 任务id
     */
    tryDeleteVolume(guestID, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeleteVolume,
                delete_volume: {
                    guest: guestID,
                    tag: tag,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "任务成功启动但无法获取任务id",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 删除卷
     * @param guestID - 云主机ID
     * @param tag - 卷标签
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 删除结果
     */
    deleteVolume(guestID_1, tag_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, tag, timeoutSeconds = 300) {
            const taskResult = yield this.tryDeleteVolume(guestID, tag);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试修改云主机CPU，成功返回任务ID
     * @param guestID - 云主机ID
     * @param cores - CPU核心数
     * @returns 任务id
     */
    tryModifyGuestCPU(guestID, cores) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyCPU,
                modify_cpu: {
                    guest: guestID,
                    cores: cores,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试修改云主机CPU失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改云主机CPU
     * @param guestID - 云主机ID
     * @param cores - CPU核心数
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyGuestCPU(guestID_1, cores_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, cores, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyGuestCPU(guestID, cores);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 查询云主机
     * @param start - 起始位置
     * @param limit - 限制数量
     * @param filter - 过滤条件
     * @returns 云主机列表
     */
    queryGuests(start, limit, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryGuests,
                query_guests: {
                    start,
                    limit,
                    filter,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data) {
                return {
                    error: "结果集无效",
                };
            }
            return {
                data: {
                    records: resp.data.guests || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 尝试修改云主机内存，成功返回任务ID
     * @param guestID - 云主机ID
     * @param memoryMB - 内存大小(MB)
     * @returns 任务id
     */
    tryModifyGuestMemory(guestID, memoryMB) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyMemory,
                modify_memory: {
                    guest: guestID,
                    memory: memoryMB,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "任务成功启动但无法获取任务id",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改云主机内存
     * @param guestID - 云主机ID
     * @param memoryMB - 内存大小(MB)
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyGuestMemory(guestID_1, memoryMB_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, memoryMB, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyGuestMemory(guestID, memoryMB);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试修改云主机主机名，成功返回任务ID
     * @param guestID - 云主机ID
     * @param hostname - 主机名
     * @returns 包含任务id的结果
     */
    tryModifyGuestHostname(guestID, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyHostname,
                modify_hostname: {
                    guest: guestID,
                    hostname: hostname,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试修改云主机主机名失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改云主机主机名
     * @param guestID - 云主机ID
     * @param hostname - 主机名
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyGuestHostname(guestID_1, hostname_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, hostname, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyGuestHostname(guestID, hostname);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试修改密码，成功返回任务ID
     * @param guestID - 云主机ID
     * @param user - 用户名
     * @param password - 新密码
     * @returns 包含任务id的结果
     */
    tryModifyPassword(guestID, user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyPassword,
                modify_password: {
                    guest: guestID,
                    user: user,
                    password: password,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试修改密码失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改密码
     * @param guestID - 云主机ID
     * @param user - 用户名
     * @param password - 新密码
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyPassword(guestID_1, user_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, user, password, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyPassword(guestID, user, password);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试修改自动启动，成功返回任务ID
     * @param guestID - 云主机ID
     * @param enable - 是否启用自动启动
     * @returns 包含任务id的结果
     */
    tryModifyAutoStart(guestID, enable) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyAutoStart,
                modify_autostart: {
                    guest: guestID,
                    enable: enable,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试修改自动启动失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改自动启动
     * @param guestID - 云主机ID
     * @param enable - 是否启用自动启动
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyAutoStart(guestID_1, enable_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, enable, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyAutoStart(guestID, enable);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试添加外部接口，成功返回任务ID
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @returns 包含任务id的结果
     */
    tryAddExternalInterface(guestID, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddExternalInterface,
                add_external_interface: {
                    guest: guestID,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试添加外部接口失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 添加外部接口
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 添加结果
     */
    addExternalInterface(guestID_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, macAddress, timeoutSeconds = 300) {
            const taskResult = yield this.tryAddExternalInterface(guestID, macAddress);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试移除外部接口，成功返回任务ID
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @returns 包含任务id的结果
     */
    tryRemoveExternalInterface(guestID, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveExternalInterface,
                remove_external_interface: {
                    guest: guestID,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试移除外部接口失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 移除外部接口
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 移除结果
     */
    removeExternalInterface(guestID_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, macAddress, timeoutSeconds = 300) {
            const taskResult = yield this.tryRemoveExternalInterface(guestID, macAddress);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试添加内部接口，成功返回任务ID
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @returns 包含任务id的结果
     */
    tryAddInternalInterface(guestID, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddInternalInterface,
                add_internal_interface: {
                    guest: guestID,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试添加内部接口失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 添加内部接口
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 添加结果
     */
    addInternalInterface(guestID_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, macAddress, timeoutSeconds = 300) {
            const taskResult = yield this.tryAddInternalInterface(guestID, macAddress);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试移除内部接口，成功返回任务ID
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @returns 包含任务id的结果
     */
    tryRemoveInternalInterface(guestID, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveInternalInterface,
                remove_internal_interface: {
                    guest: guestID,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试移除内部接口失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 移除内部接口
     * @param guestID - 云主机ID
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 移除结果
     */
    removeInternalInterface(guestID_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, macAddress, timeoutSeconds = 300) {
            const taskResult = yield this.tryRemoveInternalInterface(guestID, macAddress);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 尝试重置监控，成功返回任务ID
     * @param guestID - 云主机ID
     * @returns 包含任务id的结果
     */
    tryResetMonitor(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ResetMonitor,
                reset_monitor: {
                    guest: guestID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data || !resp.data.id) {
                return {
                    error: "尝试重置监控失败",
                };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 重置监控
     * @param guestID - 云主机ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 重置结果
     */
    resetMonitor(guestID_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, timeoutSeconds = 300) {
            const taskResult = yield this.tryResetMonitor(guestID);
            if (taskResult.error) {
                return {
                    error: taskResult.error,
                };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return {
                    error: taskData.error,
                };
            }
            return {};
        });
    }
    /**
     * 查询任务
     * @param offset - 偏移量
     * @param pageSize - 每页大小
     * @returns 包含任务分页结果的结果
     */
    queryTasks(offset, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryTasks,
                query_tasks: {
                    offset: offset,
                    page_size: pageSize,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return {
                    error: resp.error,
                };
            }
            if (!resp.data) {
                return {
                    error: "结果集无效",
                };
            }
            return {
                data: {
                    records: resp.data.tasks || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 添加节点
     * @param config - 节点配置
     * @returns 操作结果
     */
    addNode(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddNode,
                add_node: config,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 移除节点
     * @param nodeID - 节点ID
     * @returns 操作结果
     */
    removeNode(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveNode,
                remove_node: { id: nodeID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询节点列表
     * @returns 节点数据列表
     */
    queryNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryNodes,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取节点列表失败" };
            }
            return { data: resp.data.cluster_nodes || [] };
        });
    }
    /**
     * 获取节点详情
     * @param nodeID - 节点ID
     * @returns 节点数据
     */
    getNode(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetNode,
                get_node: { id: nodeID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.cluster_node) {
                return { error: "节点不存在" };
            }
            return { data: resp.data.cluster_node };
        });
    }
    /**
     * 启用节点
     * @param nodeID - 节点ID
     * @returns 操作结果
     */
    enableNode(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.EnableNode,
                enable_node: { node_id: nodeID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 禁用节点
     * @param nodeID - 节点ID
     * @returns 操作结果
     */
    disableNode(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DisableNode,
                disable_node: { node_id: nodeID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询计算资源池
     * @returns 计算资源池状态列表
     */
    queryComputePools() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryPools,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取计算资源池列表失败" };
            }
            return { data: resp.data.compute_pools || [] };
        });
    }
    /**
     * 获取计算资源池详情
     * @param poolID - 资源池ID
     * @returns 计算资源池状态
     */
    getComputePool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetPool,
                get_pool: { id: poolID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.compute_pool) {
                return { error: "计算资源池不存在" };
            }
            return { data: resp.data.compute_pool };
        });
    }
    /**
     * 添加计算资源池
     * @param config - 计算资源池配置
     * @returns 操作结果
     */
    addComputePool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddPool,
                add_pool: config,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改计算资源池
     * @param config - 计算资源池配置
     * @returns 操作结果
     */
    modifyComputePool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyPool,
                modify_pool: config,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除计算资源池
     * @param poolID - 资源池ID
     * @returns 操作结果
     */
    deleteComputePool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeletePool,
                delete_pool: { id: poolID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加计算节点到资源池
     * @param poolID - 资源池ID
     * @param nodeID - 节点ID
     * @returns 操作结果
     */
    addComputeNode(poolID, nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddPoolNode,
                add_pool_node: { pool: poolID, node: nodeID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 从资源池移除计算节点
     * @param poolID - 资源池ID
     * @param nodeID - 节点ID
     * @returns 操作结果
     */
    removeComputeNode(poolID, nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemovePoolNode,
                remove_pool_node: { pool: poolID, node: nodeID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改计算资源池策略
     * @param poolID - 资源池ID
     * @param strategy - 资源池策略
     * @returns 操作结果
     */
    changeComputePoolStrategy(poolID, strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ChangeComputePoolStrategy,
                change_pool_strategy: {
                    pool_id: poolID,
                    strategy: strategy,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    // Storage Pool Management Methods
    /**
     * 查询存储池列表
     * @returns 存储池列表
     */
    queryStoragePools() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryStoragePools,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取存储池列表失败" };
            }
            return { data: resp.data.storage_pools || [] };
        });
    }
    /**
     * 获取存储池详情
     * @param poolID - 存储池ID
     * @returns 存储池详情
     */
    getStoragePool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetStoragePool,
                get_storage_pool: { id: poolID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.storage_pool) {
                return { error: "存储池不存在" };
            }
            return { data: resp.data.storage_pool };
        });
    }
    /**
     * 添加存储池
     * @param config - 存储池配置
     * @returns 操作结果
     */
    addStoragePool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddStoragePool,
                add_storage_pool: config,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除存储池
     * @param poolID - 存储池ID
     * @returns 操作结果
     */
    removeStoragePool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveStoragePool,
                remove_storage_pool: { id: poolID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改远程存储策略
     * @param poolID - 存储池ID
     * @param strategy - 存储策略
     * @returns 操作结果
     */
    modifyRemoteStorageStrategy(poolID, strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyRemoteStorageStrategy,
                modify_remote_storage_strategy: {
                    pool_id: poolID,
                    strategy: strategy,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 改变远程容器标志
     * @param poolID - 存储池ID
     * @param index - 容器索引
     * @param enabled - 是否启用
     * @returns 操作结果
     */
    changeRemoteContainerFlag(poolID, index, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ChangeRemoteContainerFlag,
                change_remote_container_flag: {
                    pool_id: poolID,
                    index: index,
                    enabled: enabled,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 尝试添加远程容器，成功返回任务ID
     * @param poolID - 存储池ID
     * @param container - 容器配置
     * @returns 任务ID
     */
    tryAddRemoteContainer(poolID, container) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddRemoteContainer,
                add_remote_container: {
                    pool_id: poolID,
                    container: container,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试添加远程容器失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 添加远程容器
     * @param poolID - 存储池ID
     * @param container - 容器配置
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 操作结果
     */
    addRemoteContainer(poolID_1, container_1) {
        return __awaiter(this, arguments, void 0, function* (poolID, container, timeoutSeconds = 300) {
            const taskResult = yield this.tryAddRemoteContainer(poolID, container);
            if (taskResult.error) {
                return { error: taskResult.error };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 尝试修改远程容器，成功返回任务ID
     * @param poolID - 存储池ID
     * @param index - 容器索引
     * @param container - 容器配置
     * @returns 任务ID
     */
    tryModifyRemoteContainer(poolID, index, container) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyRemoteContainer,
                modify_remote_container: {
                    pool_id: poolID,
                    index: index,
                    container: container,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试修改远程容器失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 修改远程容器
     * @param poolID - 存储池ID
     * @param index - 容器索引
     * @param container - 容器配置
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 操作结果
     */
    modifyRemoteContainer(poolID_1, index_1, container_1) {
        return __awaiter(this, arguments, void 0, function* (poolID, index, container, timeoutSeconds = 300) {
            const taskResult = yield this.tryModifyRemoteContainer(poolID, index, container);
            if (taskResult.error) {
                return { error: taskResult.error };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 尝试删除远程容器，成功返回任务ID
     * @param poolID - 存储池ID
     * @param index - 容器索引
     * @returns 任务ID
     */
    tryRemoveRemoteContainer(poolID, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveRemoteContainer,
                remove_remote_container: {
                    pool_id: poolID,
                    index: index,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试删除远程容器失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 删除远程容器
     * @param poolID - 存储池ID
     * @param index - 容器索引
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 操作结果
     */
    removeRemoteContainer(poolID_1, index_1) {
        return __awaiter(this, arguments, void 0, function* (poolID, index, timeoutSeconds = 300) {
            const taskResult = yield this.tryRemoveRemoteContainer(poolID, index);
            if (taskResult.error) {
                return { error: taskResult.error };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    // Address Pool Management Methods
    /**
     * 查询地址池列表
     * @param offset - 起始位置
     * @param limit - 限制数量
     * @returns 地址池列表
     * @deprecated 地址池相关接口全部会重新设计
     */
    queryAddressPools(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryAddressPools,
                query_address_pools: {
                    offset: offset,
                    page_size: limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data ||
                !resp.data.address_pools ||
                resp.data.total === undefined) {
                return { error: "获取地址池列表失败" };
            }
            return {
                data: {
                    records: resp.data.address_pools,
                    total: resp.data.total,
                },
            };
        });
    }
    /**
     * 获取地址池详情
     * @param poolID - 地址池ID
     * @returns 地址池详情
     * @deprecated 地址池相关接口全部会重新设计
     */
    getAddressPool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetAddressPool,
                get_address_pool: { id: poolID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.address_pool) {
                return { error: "地址池不存在" };
            }
            return { data: resp.data.address_pool };
        });
    }
    /**
     * 添加地址池
     * @param id - 地址池ID
     * @param mode - 接口模式
     * @param isV6 - 是否为IPv6
     * @param description - 描述
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addAddressPool(id, mode, isV6, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddAddressPool,
                add_address_pool: {
                    id,
                    mode,
                    is_v6: isV6,
                    description,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改地址池
     * @param id - 地址池ID
     * @param mode - 接口模式
     * @param description - 描述
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    modifyAddressPool(id, mode, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyAddressPool,
                modify_address_pool: {
                    id,
                    mode,
                    description,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除地址池
     * @param poolID - 地址池ID
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeAddressPool(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveAddressPool,
                remove_address_pool: { id: poolID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加外部地址范围
     * @param poolID - 地址池ID
     * @param beginAddress - 起始地址
     * @param endAddress - 结束地址
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addExternalAddressRange(poolID, beginAddress, endAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddExternalAddressRange,
                address_range: {
                    pool: poolID,
                    begin: beginAddress,
                    end: endAddress,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加内部地址范围
     * @param poolID - 地址池ID
     * @param beginAddress - 起始地址
     * @param endAddress - 结束地址
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addInternalAddressRange(poolID, beginAddress, endAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddInternalAddressRange,
                address_range: {
                    pool: poolID,
                    begin: beginAddress,
                    end: endAddress,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除外部地址范围
     * @param poolID - 地址池ID
     * @param beginAddress - 起始地址
     * @param endAddress - 结束地址
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeExternalAddressRange(poolID, beginAddress, endAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveExternalAddressRange,
                address_range: {
                    pool: poolID,
                    begin: beginAddress,
                    end: endAddress,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除内部地址范围
     * @param poolID - 地址池ID
     * @param beginAddress - 起始地址
     * @param endAddress - 结束地址
     * @returns 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeInternalAddressRange(poolID, beginAddress, endAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveInternalAddressRange,
                address_range: {
                    pool: poolID,
                    begin: beginAddress,
                    end: endAddress,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    // ISO File Management Methods
    /**
     * 创建ISO文件
     * @param spec - 文件规格
     * @param access_level - 资源访问级别
     * @returns 文件ID
     */
    createISOFile(spec, access_level) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CreateISO,
                create_iso: {
                    spec: Object.assign(Object.assign({}, spec), { category: enums_1.FileCategory.ISO, format: enums_1.FileFormat.ISO }),
                    access_level: access_level,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "创建ISO文件失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 删除ISO文件
     * @param fileID - 文件ID
     * @returns 操作结果
     */
    deleteISOFile(fileID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeleteISO,
                delete_iso: { id: fileID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改ISO文件
     * @param fileID - 文件ID
     * @param spec - 文件规格
     * @returns 操作结果
     */
    modifyISOFile(fileID, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyISO,
                modify_iso: {
                    id: fileID,
                    spec: Object.assign(Object.assign({}, spec), { category: enums_1.FileCategory.ISO, format: enums_1.FileFormat.ISO }),
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取ISO文件详情
     * @param fileID - 文件ID
     * @returns 文件状态
     */
    getISOFile(fileID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetISO,
                get_iso: { id: fileID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.file) {
                return { error: "ISO文件不存在" };
            }
            return { data: resp.data.file };
        });
    }
    /**
     * 查询ISO文件列表
     * @param offset - 起始位置
     * @param limit - 限制数量
     * @param onlySelf - 是否只查询当前用户的ISO文件
     * @returns ISO文件列表
     */
    queryISOFiles(offset_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (offset, limit, onlySelf = false) {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryISO,
                query_iso: {
                    start: offset,
                    limit: limit,
                    only_self: onlySelf,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取ISO文件列表失败" };
            }
            return {
                data: {
                    records: resp.data.files || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    // Disk File Management Methods
    /**
     * 创建磁盘文件
     * @param spec - 文件规格
     * @param access_level - 资源访问级别
     * @returns 文件ID
     */
    createDiskFile(spec, access_level) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CreateDisk,
                create_disk: {
                    spec: Object.assign(Object.assign({}, spec), { category: enums_1.FileCategory.Disk, format: enums_1.FileFormat.Qcow2 }),
                    access_level: access_level,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "创建磁盘文件失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 删除磁盘文件
     * @param fileID - 文件ID
     * @returns 操作结果
     */
    deleteDiskFile(fileID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeleteDisk,
                delete_disk: { id: fileID },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改磁盘文件
     * @param fileID - 文件ID
     * @param spec - 文件规格
     * @returns 操作结果
     */
    modifyDiskFile(fileID, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyDisk,
                modify_disk: {
                    id: fileID,
                    spec: Object.assign(Object.assign({}, spec), { category: enums_1.FileCategory.Disk, format: enums_1.FileFormat.Qcow2 }),
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取磁盘文件详情
     * @param fileID - 文件ID
     * @returns 文件状态
     */
    getDiskFile(fileID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetDisk,
                get_disk: { id: fileID },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.file) {
                return { error: "磁盘文件不存在" };
            }
            return { data: resp.data.file };
        });
    }
    /**
     * 查询磁盘文件列表
     * @param offset - 起始位置
     * @param limit - 限制数量
     * @param onlySelf - 是否只查询当前用户的磁盘文件
     * @returns 磁盘文件列表
     */
    queryDiskFiles(offset_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (offset, limit, onlySelf = false) {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryDisk,
                query_disk: {
                    start: offset,
                    limit: limit,
                    only_self: onlySelf,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取磁盘文件列表失败" };
            }
            return {
                data: {
                    records: resp.data.files || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 获取ISO文件URL
     * @param fileID - 文件ID
     * @returns 文件URL
     */
    getISOFileURL(fileID) {
        return `${this._backendURL}files/isos/${fileID}`;
    }
    /**
     * 获取磁盘文件URL
     * @param fileID - 文件ID
     * @returns 文件URL
     */
    getDiskFileURL(fileID) {
        return `${this._backendURL}files/disks/${fileID}`;
    }
    /**
     * 打开监控通道
     * @param guestID - 云主机ID
     * @returns 监控响应，用于打开监控通道
     */
    openMonitorChannel(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield (0, request_forwarder_1.openMonitorChannel)(this._backendURL, this._authenticatedTokens.access_token, this._authenticatedTokens.csrf_token, guestID);
            if (resp.error || resp.unauthenticated) {
                return { error: resp.error, unauthenticated: resp.unauthenticated };
            }
            if (!resp.data) {
                return { error: "无法获取监控信息" };
            }
            return { data: resp.data };
        });
    }
    /**
     * 尝试插入介质，成功返回任务ID
     * @param guestID - 云主机ID
     * @param mediaId - 光盘ISO文件ID
     * @returns 任务ID
     */
    tryInsertMedia(guestID, mediaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.InsertMedia,
                insert_media: {
                    guest: guestID,
                    media: mediaId,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试插入介质失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 插入介质
     * @param guestID - 云主机ID
     * @param mediaId - 光盘ISO文件ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 操作结果
     */
    insertMedia(guestID_1, mediaId_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, mediaId, timeoutSeconds = 300) {
            const taskResult = yield this.tryInsertMedia(guestID, mediaId);
            if (taskResult.error) {
                return { error: taskResult.error };
            }
            const taskData = yield this.waitTask(taskResult.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 尝试弹出介质，成功返回任务ID
     * @param guestID - 云主机ID
     * @returns 任务ID
     */
    tryEjectMedia(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.EjectMedia,
                eject_media: {
                    guest: guestID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试弹出介质失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 弹出介质
     * @param guestID - 云主机ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 操作结果
     */
    ejectMedia(guestID_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, timeoutSeconds = 300) {
            const taskIDResult = yield this.tryEjectMedia(guestID);
            if (taskIDResult.error) {
                return { error: taskIDResult.error };
            }
            const taskData = yield this.waitTask(taskIDResult.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 尝试调整磁盘大小，成功返回任务ID
     * @param guestID - 云主机ID
     * @param volumeTag - 卷标签
     * @param sizeInMB - 大小（MB）
     * @returns 任务ID
     */
    tryResizeDisk(guestID, volumeTag, sizeInMB) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ResizeDisk,
                resize_disk: {
                    guest: guestID,
                    volume: volumeTag,
                    size: sizeInMB,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试调整磁盘大小失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 尝试收缩磁盘，成功返回任务ID
     * @param guestID - 云主机ID
     * @param volumeTag - 卷标签
     * @returns 任务ID
     */
    tryShrinkDisk(guestID, volumeTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ShrinkDisk,
                shrink_disk: {
                    guest: guestID,
                    volume: volumeTag,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试收缩磁盘失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 尝试安装磁盘镜像，成功返回任务ID
     * @param guestID - 云主机ID
     * @param volumeTag - 卷标签
     * @param fileID - 文件ID
     * @returns 任务ID
     */
    tryInstallDiskImage(guestID, volumeTag, fileID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.InstallDiskImage,
                install_disk_image: {
                    guest: guestID,
                    volume: volumeTag,
                    file: fileID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试安装磁盘镜像失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 尝试创建磁盘镜像，成功返回任务ID
     * @param guestID - 云主机ID
     * @param volumeTag - 卷标签
     * @param spec - 文件规格
     * @param access_level - 资源访问级别
     * @returns 任务ID
     */
    tryCreateDiskImage(guestID, volumeTag, spec, access_level) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CreateDiskImage,
                create_disk_image: {
                    guest: guestID,
                    volume: volumeTag,
                    spec: spec,
                    access_level: access_level,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试创建磁盘镜像失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 尝试同步ISO文件，成功返回任务ID
     * @returns 任务ID
     */
    trySyncISOFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SyncISOFiles,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试同步ISO文件失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 尝试同步磁盘文件，成功返回任务ID
     * @returns 任务ID
     */
    trySyncDiskFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SyncDiskFiles,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试同步磁盘文件失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 查询节点本地存储池列表
     * @param nodeID - 节点ID
     * @returns 节点存储池列表
     */
    queryResourcePools(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryResourcePools,
                query_resource_pools: {
                    node_id: nodeID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询资源池失败" };
            }
            return { data: resp.data.resource_pools || [] };
        });
    }
    /**
     * 修改节点本地存储池策略
     * @param nodeID - 节点ID
     * @param poolID - 池ID
     * @param strategy - 存储策略
     * @returns 修改结果
     */
    modifyResourceStorageStrategy(nodeID, poolID, strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyResourceStorageStrategy,
                modify_resource_storage_strategy: {
                    node_id: nodeID,
                    pool_id: poolID,
                    strategy: strategy,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加节点本地存储池容器
     * @param nodeID - 节点ID
     * @param poolID - 池ID
     * @param container - 容器配置
     * @returns 添加结果
     */
    addResourceContainer(nodeID, poolID, container) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddResourceContainer,
                add_resource_container: {
                    node_id: nodeID,
                    pool_id: poolID,
                    container: container,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改节点本地存储池容器
     * @param nodeID - 节点ID
     * @param poolID - 池ID
     * @param index - 容器索引
     * @param container - 容器配置
     * @returns 修改结果
     */
    modifyResourceContainer(nodeID, poolID, index, container) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyResourceContainer,
                modify_resource_container: {
                    node_id: nodeID,
                    pool_id: poolID,
                    index: index,
                    container: container,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除节点本地存储池容器
     * @param nodeID - 节点ID
     * @param poolID - 池ID
     * @param index - 容器索引
     * @returns 删除结果
     */
    removeResourceContainer(nodeID, poolID, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveResourceContainer,
                remove_resource_container: {
                    node_id: nodeID,
                    pool_id: poolID,
                    index: index,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 更改节点本地存储池容器标志，用于启用和禁用容器
     * @param nodeID - 节点ID
     * @param poolID - 池ID
     * @param index - 容器索引
     * @param enabled - 是否启用
     * @returns 更改结果
     */
    changeResourceContainerFlag(nodeID, poolID, index, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ChangeResourceContainerFlag,
                change_resource_container_flag: {
                    node_id: nodeID,
                    pool_id: poolID,
                    index: index,
                    enabled: enabled,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询快照
     * @param guestID - 云主机ID
     * @returns 快照树节点列表
     */
    querySnapshots(guestID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QuerySnapshots,
                query_snapshots: {
                    guest: guestID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询快照失败" };
            }
            return { data: resp.data.snapshots || [] };
        });
    }
    /**
     * 获取快照
     * @param guestID - 云主机ID
     * @param snapshotID - 快照ID
     * @returns 快照记录
     */
    getSnapshot(guestID, snapshotID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetSnapshot,
                get_snapshot: {
                    guest: guestID,
                    snapshot: snapshotID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.snapshot) {
                return { error: "获取快照失败" };
            }
            return { data: resp.data.snapshot };
        });
    }
    /**
     * 尝试创建快照，成功返回任务ID
     * @param guestID - 云主机ID
     * @param label - 标签
     * @param description - 快照描述
     * @returns 任务ID
     */
    tryCreateSnapshot(guestID, label, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CreateSnapshot,
                create_snapshot: {
                    guest: guestID,
                    label: label,
                    description: description,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试创建快照失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 创建快照
     * @param guestID - 云主机ID
     * @param label - 标签
     * @param description - 快照描述
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 创建结果
     */
    createSnapshot(guestID_1, label_1, description_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, label, description, timeoutSeconds = 300) {
            const taskIDResult = yield this.tryCreateSnapshot(guestID, label, description);
            if (taskIDResult.error) {
                return { error: taskIDResult.error };
            }
            const taskDataResult = yield this.waitTask(taskIDResult.data, timeoutSeconds);
            if (taskDataResult.error) {
                return { error: taskDataResult.error };
            }
            return {};
        });
    }
    /**
     * 尝试恢复快照，成功返回任务ID
     * @param guestID - 云主机ID
     * @param snapshotID - 快照ID
     * @returns 任务ID
     */
    tryRestoreSnapshot(guestID, snapshotID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RestoreSnapshot,
                restore_snapshot: {
                    guest: guestID,
                    snapshot: snapshotID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试恢复快照失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 恢复快照
     * @param guestID - 云主机ID
     * @param snapshotID - 快照ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 恢复结果
     */
    restoreSnapshot(guestID_1, snapshotID_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, snapshotID, timeoutSeconds = 300) {
            const taskIDResult = yield this.tryRestoreSnapshot(guestID, snapshotID);
            if (taskIDResult.error) {
                return { error: taskIDResult.error };
            }
            const taskDataResult = yield this.waitTask(taskIDResult.data, timeoutSeconds);
            if (taskDataResult.error) {
                return { error: taskDataResult.error };
            }
            return {};
        });
    }
    /**
     * 尝试删除快照，成功返回任务ID
     * @param guestID - 云主机ID
     * @param snapshotID - 快照ID
     * @returns 任务ID
     */
    tryDeleteSnapshot(guestID, snapshotID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.DeleteSnapshot,
                delete_snapshot: {
                    guest: guestID,
                    snapshot: snapshotID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.id) {
                return { error: "尝试删除快照失败" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 删除快照
     * @param guestID - 云主机ID
     * @param snapshotID - 快照ID
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 删除结果
     */
    deleteSnapshot(guestID_1, snapshotID_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, snapshotID, timeoutSeconds = 300) {
            const taskIDResult = yield this.tryDeleteSnapshot(guestID, snapshotID);
            if (taskIDResult.error) {
                return { error: taskIDResult.error };
            }
            const taskDataResult = yield this.waitTask(taskIDResult.data, timeoutSeconds);
            if (taskDataResult.error) {
                return { error: taskDataResult.error };
            }
            return {};
        });
    }
    /**
     * 查询云主机资源使用情况
     * @param targets - 目标云主机id列表
     * @returns 资源使用数据列表
     */
    queryResourceUsages(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryResourceUsages,
                query_resource_usages: {
                    targets: targets,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询资源使用情况失败" };
            }
            const payload = resp.data.resource_usages || [];
            const { results, error } = (0, helper_1.unmarshalResourceUsage)(payload);
            if (error) {
                return { error: error };
            }
            return { data: results };
        });
    }
    /**
     * 查询云主机资源统计信息
     * @param guest - 云主机ID
     * @param range - 统计范围
     * @returns 资源统计单元列表
     */
    queryResourceStatistic(guest, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryResourceStatistic,
                query_resource_statistic: {
                    guest: guest,
                    range: range,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询资源统计信息失败" };
            }
            const payload = resp.data.resource_statistic || [];
            const { results, error } = (0, helper_1.unmarshalResourceStatistics)(payload);
            if (error) {
                return { error: error };
            }
            return { data: results };
        });
    }
    /**
     * 查询资源池内计算节点
     * @param poolID - 计算资源池ID
     * @returns 集群节点数据列表
     */
    queryComputeNodes(poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryComputeNodes,
                query_compute_nodes: {
                    pool_id: poolID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询计算节点失败" };
            }
            return { data: resp.data.cluster_nodes || [] };
        });
    }
    /**
     * 查询节点使用情况
     * @param targets - 目标节点id列表
     * @returns 节点资源快照列表
     */
    queryNodesUsage(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryNodesUsage,
                query_nodes_usage: {
                    targets: targets,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询节点使用情况失败" };
            }
            const payload = resp.data.node_snapshots || [];
            const { results, error } = (0, helper_1.unmarshalNodesResourceUsage)(payload);
            if (error) {
                return { error: error };
            }
            return { data: results };
        });
    }
    /**
     * 查询计算资源池资源用量
     * @param targets - 目标池id列表
     * @returns 池资源快照列表
     */
    queryPoolsUsage(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryPoolsUsage,
                query_pools_usage: {
                    targets: targets,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询池使用情况失败" };
            }
            const payload = resp.data.pool_snapshots || [];
            const { results, error } = (0, helper_1.unmarshalPoolsResourceUsage)(payload);
            if (error) {
                return { error: error };
            }
            return { data: results };
        });
    }
    /**
     * 查询集群资源用量
     * @returns 集群资源快照
     */
    queryClusterUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryClusterUsage,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.cluster_snapshot) {
                return { error: "查询集群使用情况失败" };
            }
            const payload = resp.data.cluster_snapshot;
            const { results, error } = (0, helper_1.unmarshalClusterResourceUsage)(payload);
            if (error) {
                return { error: error };
            }
            if (!results) {
                return { error: "没有有效数据" };
            }
            return { data: results };
        });
    }
    /**
     * 查询系统模板
     * @param offset - 起始位置
     * @param pageSize - 每页记录数量
     * @param onlySelf - 是否只查询当前用户的系统模板
     * @returns 系统模板视图列表
     */
    querySystems(offset_1, pageSize_1) {
        return __awaiter(this, arguments, void 0, function* (offset, pageSize, onlySelf = false) {
            const cmd = {
                type: enums_1.controlCommandEnum.QuerySystems,
                query_systems: {
                    offset,
                    limit: pageSize,
                    only_self: onlySelf,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询系统模板失败" };
            }
            return {
                data: {
                    records: resp.data.systems || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 获取系统模板
     * @param systemID - 系统ID
     * @returns 系统模板视图
     */
    getSystem(systemID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetSystem,
                get_system: {
                    id: systemID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.system) {
                return { error: "查询系统模板失败" };
            }
            return { data: resp.data.system };
        });
    }
    /**
     * 添加系统模板
     * @param label - 标签
     * @param spec - 系统规格
     * @param access_level - 资源访问级别
     * @returns 添加结果
     */
    addSystem(label, spec, access_level) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddSystem,
                add_system: {
                    label,
                    spec,
                    access_level: access_level,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改系统模板
     * @param systemID - 系统ID
     * @param label - 标签
     * @param spec - 系统规格
     * @returns 修改结果
     */
    modifySystem(systemID, label, spec) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifySystem,
                modify_system: {
                    id: systemID,
                    label: label,
                    spec: spec,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除系统模板
     * @param systemID - 系统ID
     * @returns 删除结果
     */
    removeSystem(systemID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveSystem,
                remove_system: {
                    id: systemID,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 重置系统模板
     * @returns 重置结果
     */
    resetSystems() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ResetSystems,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询日志
     * @param date - 日期,"yyyy-MM-dd"
     * @param offset - 偏移量
     * @param limit - 每页日志行数
     * @returns 日志分页结果
     */
    queryLogs(date, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryLogs,
                query_logs: {
                    date,
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询日志失败" };
            }
            return {
                data: {
                    records: resp.data.logs || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 查询警告
     * @param level - 警告级别
     * @param unread_only - 是否只查询未读
     * @param offset - 偏移量
     * @param limit - 每页警告数量
     * @returns 警告记录集
     */
    queryWarnings(level, unread_only, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryWarnings,
                query_warnings: {
                    level,
                    unread_only,
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询警告失败" };
            }
            return {
                data: {
                    records: resp.data.warnings || [],
                    total: resp.data.total || 0,
                    critical: resp.data.critical || 0,
                    alert: resp.data.alert || 0,
                    warning: resp.data.warning || 0,
                },
            };
        });
    }
    /**
     * 统计节点警告数量
     * @param nodeID - 节点ID
     * @returns 警告统计信息
     */
    countWarnings(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CountWarnings,
                count_warnings: {
                    node_id: nodeID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "统计警告失败" };
            }
            return {
                data: {
                    critical: resp.data.critical || 0,
                    alert: resp.data.alert || 0,
                    warning: resp.data.warning || 0,
                },
            };
        });
    }
    /**
     * 统计多个节点警告总数
     * @param nodeList - 节点列表
     * @returns 警告统计信息
     */
    sumWarnings(nodeList) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SumWarnings,
                sum_warnings: {
                    node_list: nodeList,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "统计警告失败" };
            }
            return {
                data: {
                    critical: resp.data.critical || 0,
                    alert: resp.data.alert || 0,
                    warning: resp.data.warning || 0,
                },
            };
        });
    }
    /**
     * 删除警告
     * @param idList - 警告ID列表
     * @returns 删除结果
     */
    removeWarnings(idList) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveWarnings,
                remove_warnings: {
                    id_list: idList,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 清除所有警告
     * @returns 清除结果
     */
    clearWarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ClearWarnings,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 标记警告为已读
     * @param idList - 警告ID列表
     * @returns 标记结果
     */
    markWarningsAsRead(idList) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.MarkWarningsAsRead,
                mark_warnings_as_read: {
                    id_list: idList,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 标记所有警告为已读
     * @returns 标记结果
     */
    markAllWarningsAsRead() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.MarkAllWarningsAsRead,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 标记所有警告为未读
     * @returns 标记结果
     */
    markAllWarningsAsUnread() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.MarkAllWarningsAsUnread,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 统计未读警告数量
     * @returns 警告统计信息
     */
    countUnreadWarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.CountUnreadWarnings,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "统计警告失败" };
            }
            return {
                data: {
                    critical: resp.data.critical || 0,
                    alert: resp.data.alert || 0,
                    warning: resp.data.warning || 0,
                },
            };
        });
    }
    /**
     * 修改节点配置
     * @param nodeID - 节点ID
     * @param config - 节点配置
     * @returns 修改结果
     */
    modifyConfig(nodeID, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyConfig,
                modify_config: {
                    node_id: nodeID,
                    config: config,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取节点配置
     * @param nodeID - 节点ID
     * @returns 节点配置状态
     */
    getConfig(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.GetConfig,
                get_config: {
                    node_id: nodeID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.config)) {
                return { error: "Configuration not found" };
            }
            return { data: resp.data.config };
        });
    }
    /**
     * 重启服务
     * @param nodeID - 节点ID
     * @returns 重启结果
     */
    restartService(nodeID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RestartService,
                restart_service: {
                    node_id: nodeID,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加SSH密钥
     * @param label - 标签
     * @param content - 密钥内容
     * @param access_level - 资源访问级别
     * @returns 添加结果
     */
    addSSHKey(label, content, access_level) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddSSHKey,
                add_ssh_key: {
                    label,
                    content,
                    access_level: access_level,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除SSH密钥
     * @param id - 密钥ID
     * @returns 删除结果
     */
    removeSSHKey(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveSSHKey,
                remove_ssh_key: {
                    id,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询SSH密钥
     * @param offset - 偏移量
     * @param pageSize - 每页最大记录数
     * @param onlySelf - 是否只查询当前用户的密钥
     * @returns SSH密钥视图列表
     */
    querySSHKeys(offset_1, pageSize_1) {
        return __awaiter(this, arguments, void 0, function* (offset, pageSize, onlySelf = false) {
            const cmd = {
                type: enums_1.controlCommandEnum.QuerySSHKeys,
                query_ssh_keys: {
                    offset,
                    limit: pageSize,
                    only_self: onlySelf,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询SSH密钥失败" };
            }
            return {
                data: {
                    records: resp.data.ssh_keys || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 获取已激活的许可证
     * @returns 许可证信息
     */
    getActivatedLicense() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.GetActivatedLicense,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.license)) {
                return { error: "没有激活的许可证" };
            }
            return { data: resp.data.license };
        });
    }
    /**
     * 激活许可证
     * @param licenseID - 许可证ID
     * @returns 激活结果
     */
    activateLicense(licenseID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ActiveLicense,
                active_license: {
                    id: licenseID,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加许可证
     * @param license - 许可证信息
     * @returns 添加结果
     */
    addLicense(license) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddLicense,
                add_license: {
                    license: license,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除许可证
     * @param licenseID - 许可证ID
     * @returns 删除结果
     */
    removeLicense(licenseID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveLicense,
                remove_license: {
                    id: licenseID,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取许可证
     * @param licenseID - 许可证ID
     * @returns 许可证信息
     */
    getLicense(licenseID) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.GetLicense,
                get_license: {
                    id: licenseID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.license)) {
                return { error: "License not found" };
            }
            return { data: resp.data.license };
        });
    }
    /**
     * 查询所有许可证
     * @returns 许可证记录列表
     */
    queryLicenses() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryLicenses,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询许可证失败" };
            }
            return { data: resp.data.licenses || [] };
        });
    }
    /**
     * 查询集群状态
     * @returns 集群状态
     */
    queryClusterStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.QueryClusterStatus,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.cluster_status)) {
                return { error: "无法获取集群状态" };
            }
            return { data: resp.data.cluster_status };
        });
    }
    /**
     * 查询网络拓扑图
     * @returns 网络拓扑节点列表
     */
    queryNetworkGraph() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.QueryNetworkGraph,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.network_graph)) {
                return { error: "无法获取网络拓扑图" };
            }
            return { data: resp.data.network_graph };
        });
    }
    /**
     * 获取监控规则
     * @returns  资源监控配置
     */
    getMonitorRules() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.GetMonitorRules,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.monitor_rules)) {
                return { error: "无法获取监控规则" };
            }
            return { data: resp.data.monitor_rules };
        });
    }
    /**
     * 设置监控规则
     * @param rules - 资源监控配置
     * @returns 设置结果
     */
    setMonitorRules(rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SetMonitorRules,
                set_monitor_rules: {
                    config: rules,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 尝试重新加载资源节点存储
     * @param nodeID - 节点ID
     * @param poolID - 节点存储标识
     * @returns 任务ID
     */
    tryReloadResourceStorage(nodeID, poolID) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cmd = {
                type: enums_1.controlCommandEnum.ReloadResourceStorage,
                reload_resource_storage: {
                    node_id: nodeID,
                    pool_id: poolID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!((_a = resp.data) === null || _a === void 0 ? void 0 : _a.id)) {
                return { error: "Failed to reload resource storage" };
            }
            return { data: resp.data.id };
        });
    }
    /**
     * 更新磁盘卷大小
     * @param fileID - 文件ID
     * @param sizeInMB - 大小（MB）
     * @returns 更新结果
     */
    updateDiskVolumeSize(fileID, sizeInMB) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.UpdateDiskVolumeSize,
                update_disk_volume_size: {
                    id: fileID,
                    size: sizeInMB,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 重置监控规则
     * @returns 重置结果
     */
    resetMonitorRules() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ResetMonitorRules,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 清除任务
     * @returns 清除结果
     */
    clearTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ClearTasks,
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 添加导入源
     * @param vendor - 供应商类型
     * @param url - 导入源URL
     * @param token - 认证token
     * @param secret - 认证secret
     * @returns 添加结果
     */
    addImportSource(vendor, url, token, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddImportSource,
                add_import_source: {
                    vendor,
                    url,
                    token,
                    secret,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改导入源
     * @param id - 导入源ID
     * @param url - 导入源URL
     * @param token - 认证token
     * @param secret - 认证secret
     * @returns 修改结果
     */
    modifyImportSource(id, url, token, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyImportSource,
                modify_import_source: {
                    id,
                    url,
                    token,
                    secret,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除导入源
     * @param id - 导入源ID
     * @returns 删除结果
     */
    removeImportSource(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveImportSource,
                remove_import_source: {
                    id,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询导入源
     * @param start - 起始索引
     * @param limit - 每页数量
     * @returns 导入源分页结果
     */
    queryImportSources(start, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryImportSources,
                query_import_sources: {
                    start,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "无法获取导入源" };
            }
            return {
                data: {
                    records: resp.data.import_sources || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 查询导入目标
     * @param sourceID - 导入源ID
     * @returns 导入目标列表
     */
    queryImportTargets(sourceID) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryImportTargets,
                query_import_targets: {
                    source: sourceID,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "无法获取导入目标" };
            }
            return {
                data: resp.data.import_targets || [],
            };
        });
    }
    /**
     * 尝试导入云主机到节点
     * @param sourceID - 导入源ID
     * @param targetIDs - 目标云主机ID列表
     * @param targetNode - 目标节点ID
     * @returns 任务ID
     */
    tryImportGuestsToNode(sourceID, targetIDs, targetNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ImportGuests,
                import_guests: {
                    source: sourceID,
                    guests: targetIDs,
                    to_node: targetNode,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "尝试导入云主机失败" };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 尝试迁移云主机到节点
     * @param targetNode - 目标节点ID
     * @param guests - 云主机ID列表
     * @returns 任务ID
     */
    tryMigrateToNode(targetNode, guests) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.MigrateToNode,
                migrate_to_node: {
                    target_node: targetNode,
                    guests: guests,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "尝试迁移云主机失败" };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 尝试修改外部接口MAC地址
     * @param guestID - 云主机ID
     * @param device - 目标设备(当前MAC)
     * @param macAddress - MAC地址
     * @returns 任务ID
     */
    tryModifyExternalInterfaceMAC(guestID, device, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyExternalInterfaceMAC,
                modify_external_interface_mac: {
                    guest: guestID,
                    device: device,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "尝试修改外部接口MAC地址失败" };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改外部接口MAC地址
     * @param guestID - 云主机ID
     * @param device - 目标设备(当前MAC)
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyExternalInterfaceMAC(guestID_1, device_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, device, macAddress, timeoutSeconds = 300) {
            const resp = yield this.tryModifyExternalInterfaceMAC(guestID, device, macAddress);
            if (resp.error) {
                return { error: resp.error };
            }
            const taskData = yield this.waitTask(resp.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 尝试修改内部接口MAC地址
     * @param guestID - 云主机ID
     * @param device - 目标设备(当前MAC)
     * @param macAddress - MAC地址
     * @returns 任务ID
     */
    tryModifyInternalInterfaceMAC(guestID, device, macAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyInternalInterfaceMAC,
                modify_internal_interface_mac: {
                    guest: guestID,
                    device: device,
                    mac_address: macAddress,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "尝试修改内部接口MAC地址失败" };
            }
            return {
                data: resp.data.id,
            };
        });
    }
    /**
     * 修改内部接口MAC地址
     * @param guestID - 云主机ID
     * @param device - 目标设备(当前MAC)
     * @param macAddress - MAC地址
     * @param timeoutSeconds - 超时时间（秒），默认300秒
     * @returns 修改结果
     */
    modifyInternalInterfaceMAC(guestID_1, device_1, macAddress_1) {
        return __awaiter(this, arguments, void 0, function* (guestID, device, macAddress, timeoutSeconds = 300) {
            const resp = yield this.tryModifyInternalInterfaceMAC(guestID, device, macAddress);
            if (resp.error) {
                return { error: resp.error };
            }
            const taskData = yield this.waitTask(resp.data, timeoutSeconds);
            if (taskData.error) {
                return { error: taskData.error };
            }
            return {};
        });
    }
    /**
     * 查询用户角色
     * @returns 用户角色列表
     */
    queryUserRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryUserRoles,
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询用户角色失败" };
            }
            return {
                data: resp.data.user_roles || [],
            };
        });
    }
    /**
     * 修改用户组角色
     * @param group - 用户组
     * @param roles - 角色列表
     * @returns 修改结果
     */
    modifyGroupRoles(group, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ModifyGroupRoles,
                modify_group_roles: {
                    group,
                    roles,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取用户组角色
     * @param group - 用户组
     * @returns 用户角色列表
     */
    getGroupRoles(group) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetGroupRoles,
                get_group_roles: {
                    group,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取用户组角色失败" };
            }
            return {
                data: resp.data.user_roles || [],
            };
        });
    }
    /**
     * 查询用户组成员
     * @param group - 用户组
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 用户组成员分页结果
     */
    queryGroupMembers(group, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryGroupMembers,
                query_group_members: {
                    group,
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询用户组成员失败" };
            }
            return {
                data: {
                    records: resp.data.user_group_members || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 添加用户组
     * @param group - 用户组
     * @returns 添加结果
     */
    addGroup(group) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddGroup,
                add_group: {
                    group,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除用户组
     * @param group - 用户组
     * @returns 删除结果
     */
    removeGroup(group) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveGroup,
                remove_group: {
                    group,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询用户组
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 用户组分页结果
     */
    queryGroups(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryGroups,
                query_groups: {
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询用户组失败" };
            }
            return {
                data: {
                    records: resp.data.user_groups || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 添加用户
     * @param user - 用户名
     * @param group - 用户组
     * @param password - 密码
     * @returns 添加结果
     */
    addUser(user, group, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddUser,
                add_user: {
                    user,
                    group,
                    password,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 删除用户
     * @param userId - 用户ID
     * @returns 删除结果
     */
    removeUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveUser,
                remove_user: {
                    user: userId,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询用户
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 用户分页结果
     */
    queryUsers(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryUsers,
                query_users: {
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询用户失败" };
            }
            return {
                data: {
                    records: resp.data.user_credentials || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 修改用户组
     * @param userId - 用户ID
     * @param groupId - 用户组ID
     * @returns 修改结果
     */
    changeUserGroup(userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ChangeUserGroup,
                change_user_group: {
                    user: userId,
                    group: groupId,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询用户令牌
     * @param user - 用户名
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 用户令牌分页结果
     */
    queryUserTokens(user, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryUserTokens,
                query_user_tokens: {
                    user,
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询用户令牌失败" };
            }
            return {
                data: {
                    records: resp.data.user_tokens || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 撤销用户令牌
     * @param user - 用户名
     * @param serial - 序列号
     * @returns 撤销结果
     */
    revokeUserToken(user, serial) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RevokeUserToken,
                revoke_user_token: {
                    user,
                    serial,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 修改用户密码
     * @param user - 用户名
     * @param password - 新密码
     * @returns 修改结果
     */
    changeUserSecret(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ChangeUserSecret,
                change_user_secret: {
                    user,
                    password,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 重置用户密码
     * @param user - 用户名
     * @returns 新密码
     */
    resetUserSecret(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.ResetUserSecret,
                reset_user_secret: {
                    user,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data || !resp.data.password) {
                return { error: "重置用户密码失败" };
            }
            return { data: resp.data.password };
        });
    }
    /**
     * 撤销访问权限
     * @param token - 令牌
     * @returns 撤销结果
     */
    revokeAccess(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RevokeAccess,
                revoke_access: {
                    token,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 使访问权限失效
     * @param token - 令牌
     * @returns 使访问权限失效结果
     */
    invalidateAccess(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.InvalidateAccess,
                invalidate_access: {
                    token,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询访问记录
     * @param user - 用户名
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 访问记录分页结果
     */
    queryAccesses(user, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryAccesses,
                query_accesses: {
                    user,
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询访问记录失败" };
            }
            return {
                data: {
                    records: resp.data.user_accesses || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 添加白名单
     * @param address - 白名单地址
     * @returns 添加结果
     */
    addWhiteList(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.AddWhiteList,
                add_white_list: {
                    address,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 移除白名单
     * @param index - 白名单索引
     * @returns 移除结果
     */
    removeWhiteList(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.RemoveWhiteList,
                remove_white_list: {
                    index,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 更新白名单
     * @param index - 白名单索引
     * @param address - 新的白名单地址
     * @returns 更新结果
     */
    updateWhiteList(index, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.UpdateWhiteList,
                update_white_list: {
                    index,
                    address,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 查询白名单
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 白名单分页结果
     */
    queryWhiteList(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryWhiteList,
                query_white_list: {
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询白名单失败" };
            }
            return {
                data: {
                    records: resp.data.white_list || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
    /**
     * 设置系统资源
     * @param type - 资源类型
     * @param id - 资源ID
     * @param value - 资源值
     * @returns 设置结果
     */
    setSystemResource(type, id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SetSystemResource,
                set_system_resource: {
                    type,
                    id,
                    value,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 获取资源权限
     * @param type - 资源类型
     * @param id - 资源ID
     * @returns 资源权限结果
     */
    getResourcePermissions(type, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.GetResourcePermissions,
                get_resource_permissions: {
                    type,
                    id,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "获取资源权限失败" };
            }
            return {
                data: resp.data.resource_permissions,
            };
        });
    }
    /**
     * 设置资源权限
     * @param type - 资源类型
     * @param id - 资源ID
     * @param permissions - 资源权限
     * @returns 设置结果
     */
    setResourcePermissions(type, id, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.SetResourcePermissions,
                set_resource_permissions: {
                    type,
                    id,
                    permissions,
                },
            };
            return yield this.sendCommand(cmd);
        });
    }
    /**
     * 检查是否可以创建更多云主机
     * @returns 是否可以创建更多云主机
     */
    couldHasMoreGuests() {
        return __awaiter(this, void 0, void 0, function* () {
            const [licenseResult, statusResult] = yield Promise.all([
                this.getActivatedLicense(),
                this.queryClusterStatus(),
            ]);
            if (licenseResult.error ||
                !licenseResult.data ||
                statusResult.error ||
                !statusResult.data) {
                return false;
            }
            return licenseResult.data.guests > statusResult.data.guests;
        });
    }
    /**
     * 检查是否可以添加更多节点
     * @returns 是否可以添加更多节点
     */
    couldHasMoreNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const [licenseResult, statusResult] = yield Promise.all([
                this.getActivatedLicense(),
                this.queryClusterStatus(),
            ]);
            if (licenseResult.error ||
                !licenseResult.data ||
                statusResult.error ||
                !statusResult.data) {
                return false;
            }
            return licenseResult.data.nodes > statusResult.data.nodes;
        });
    }
    /**
     * 检查指定功能是否已启用
     * @param feature - 要检查的功能
     * @returns 功能是否已启用
     */
    isFeatureEnabled(feature) {
        return __awaiter(this, void 0, void 0, function* () {
            const licenseResult = yield this.getActivatedLicense();
            if (licenseResult.error || !licenseResult.data) {
                return false;
            }
            if (!licenseResult.data.features) {
                return false;
            }
            return licenseResult.data.features.includes(feature);
        });
    }
    /**
     * 获取所有SSH密钥
     * @returns SSH密钥列表
     */
    fetchAllSSHKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            const pageSize = 100;
            let offset = 0;
            const allSSHKeys = [];
            // 首次查询获取总数
            const firstResult = yield this.querySSHKeys(offset, pageSize);
            if (firstResult.error) {
                return { error: firstResult.error };
            }
            if (!firstResult.data) {
                return { error: "获取SSH密钥失败" };
            }
            // 添加首批结果
            allSSHKeys.push(...firstResult.data.records);
            const total = firstResult.data.total;
            // 计算需要查询的剩余次数
            const remainingPages = Math.ceil((total - pageSize) / pageSize);
            // 分批查询剩余结果
            for (let i = 0; i < remainingPages; i++) {
                offset += pageSize;
                const result = yield this.querySSHKeys(offset, pageSize);
                if (result.error) {
                    return { error: result.error };
                }
                if (result.data && result.data.records) {
                    allSSHKeys.push(...result.data.records);
                }
            }
            return { data: allSSHKeys };
        });
    }
    /**
     * 获取所有系统模板
     * @returns 系统列表
     */
    fetchAllSystems() {
        return __awaiter(this, void 0, void 0, function* () {
            const pageSize = 100;
            let offset = 0;
            const allSystems = [];
            // 首次查询获取总数
            const firstResult = yield this.querySystems(offset, pageSize);
            if (firstResult.error) {
                return { error: firstResult.error };
            }
            if (!firstResult.data) {
                return { error: "获取系统模板失败" };
            }
            // 添加首批结果
            allSystems.push(...firstResult.data.records);
            const total = firstResult.data.total;
            // 计算需要查询的剩余次数
            const remainingPages = Math.ceil((total - pageSize) / pageSize);
            // 分批查询剩余结果
            for (let i = 0; i < remainingPages; i++) {
                offset += pageSize;
                const result = yield this.querySystems(offset, pageSize);
                if (result.error) {
                    return { error: result.error };
                }
                if (result.data && result.data.records) {
                    allSystems.push(...result.data.records);
                }
            }
            return { data: allSystems };
        });
    }
    /**
     * 注销设备
     * @returns 注销结果
     */
    logoutDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.LogoutDevice,
            };
            const result = yield this.sendCommand(cmd);
            if (result.error) {
                return { error: result.error };
            }
            this._authenticated = false;
            this._user = "";
            this._roles = [];
            this.stopHeartBeat();
            return result;
        });
    }
    /**
     * 查询当前用户已登录设备列表
     * @param offset - 偏移量
     * @param limit - 每页数量
     * @returns 设备列表
     */
    queryDevices(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = {
                type: enums_1.controlCommandEnum.QueryDevices,
                query_devices: {
                    offset,
                    limit,
                },
            };
            const resp = yield this.requestCommandResponse(cmd);
            if (resp.error) {
                return { error: resp.error };
            }
            if (!resp.data) {
                return { error: "查询设备列表失败" };
            }
            return {
                data: {
                    records: resp.data.user_accesses || [],
                    total: resp.data.total || 0,
                },
            };
        });
    }
}
exports.TaiyiConnector = TaiyiConnector;
