/**
 * 核心文件，定义用于访问平台服务的TaiyiConnector
 */
import {
  controlCommandEnum,
  ConsoleEventLevel,
  ImportVendor,
  Locale,
  SignatureAlgorithm,
  TaskStatus,
  ComputePoolStrategy,
  FileCategory,
  FileFormat,
  InterfaceMode,
  UserRole,
  VolumeContainerStrategy,
  StatisticRange,
  ResourceType,
  ResourceAccessLevel,
  LicenseFeature,
} from "./enums";
import {
  authenticateByPassword,
  authenticateByToken,
  checkSystemStatus,
  fetchCommandResponse,
  initialSystem,
  openMonitorChannel,
  refreshAccessToken,
  sendCommand,
} from "./request-forwarder";
import {
  ControlCommandRequest,
  ControlCommandResponse,
} from "./request-params";
import {
  AddressPool,
  AddressPoolRecord,
  AllocatedTokens,
  BackendResult,
  ClusterNode,
  ClusterNodeData,
  ClusterStatus,
  ComputePoolConfig,
  ComputePoolStatus,
  ConsoleEvent,
  FileSpec,
  FileStatus,
  FileView,
  GuestConfig,
  GuestFilter,
  GuestView,
  ImportSource,
  ImportTarget,
  License,
  LicenseRecord,
  NetworkGraphNode,
  NodeConfig,
  NodeConfigStatus,
  PaginationResult,
  PrivateKey,
  ResourceMonitorConfig,
  SSHKeyView,
  StoragePool,
  StoragePoolConfig,
  StoragePoolListRecord,
  SystemStatus,
  TaskData,
  UserAccessRecord,
  UserCredentialRecord,
  UserGroup,
  UserGroupRecord,
  UserToken,
  VolumeContainer,
  VolumeSpec,
  MonitorResponse,
  SnapshotTreeNode,
  ResourcePermissions,
  SnapshotRecord,
  GuestResourceUsageData,
  ResourceStatisticUnit,
  NodeResourceSnapshot,
  PoolResourceSnapshot,
  ClusterResourceSnapshot,
  GuestSystemView,
  GuestSystemSpec,
  DataStore,
  WarningRecordSet,
  WarningStatistic,
} from "./data-defines";
import {
  unmarshalResourceStatistics,
  unmarshalResourceUsage,
  unmarshalNodesResourceUsage,
  unmarshalPoolsResourceUsage,
  unmarshalClusterResourceUsage,
} from "./helper";
import { createId } from "@paralleldrive/cuid2";

enum AuthMethod {
  Secret = "secret",
  Token = "token",
}

const API_VERSION = "v1";
export type SetTokenHandler = (
  storeID: string,
  tokens: AllocatedTokens
) => Promise<void>;
export type GetTokenHandler = (storeID: string) => Promise<AllocatedTokens>;
export type StateChangeHandler = (
  storeID: string,
  authenticated: boolean
) => void;

export type AuthExpiredEvent = (connectorID: string) => void;
/**
 * 连接处理，用于与Taiyi Control服务进行交互
 * @class TaiyiConnector
 * @description 该类提供了与Taiyi Control服务进行交互的方法，包括认证、发送命令、查询访问记录等。
 * 系统状态查询与初始化接口可以直接调用，其他接口需要先认证才能调用。
 */
export class TaiyiConnector {
  private _id: string;
  private _backendURL: string;
  private _authMethod: AuthMethod = AuthMethod.Secret;
  private _privateKey: string = "";
  private _user: string = "";
  private _device: string = "";
  private _serial: string = "";
  private _password: string = "";
  private _signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.Ed25519;
  private _refreshTimer: NodeJS.Timeout | null = null;
  private _locale: Locale = Locale.Chinese;
  private _authenticated: boolean = false;
  private _authenticatedTokens: AllocatedTokens = {} as AllocatedTokens;
  private _callbackReceiver: string = "";
  private _setTokens: SetTokenHandler | undefined;
  private _getTokens: GetTokenHandler | undefined;
  private _stateChange: StateChangeHandler | undefined;
  private _onAuthExpired: AuthExpiredEvent | undefined = undefined;
  private _roles: UserRole[] = [];
  private _keepAlive = false;
  /**
   * 构造函数
   * @param {string} backendHost 后端Control服务地址
   * @param {number} backendPort 后端Control服务端口
   * @param {string} device 设备标识
   */
  constructor(backendHost: string, backendPort: number = 5851, device: string) {
    this._backendURL = `http://${backendHost}:${backendPort}/api/${API_VERSION}/`;
    this._device = device;
    this._id = createId();
  }
  /**
   * 释放资源
   */
  public release() {
    this.stopHeartBeat();
    // console.log(`connector-${this._id} released`);
  }
  /**
   * 获取连接标识
   * @returns {string} 连接标识
   */
  public get id(): string {
    return this._id;
  }
  /**
   * 获取认证状态
   * @returns {boolean} 认证状态
   */
  public get authenticated(): boolean {
    return this._authenticated;
  }
  /**
   * 获取用户标识
   * @returns {string} 用户标识
   */
  public get user(): string {
    return this._user;
  }
  /**
   * 获取用户角色
   * @returns {UserRole[]} 用户角色
   */
  public get roles(): UserRole[] {
    return this._roles;
  }
  /**
   * 绑定令牌更新回调
   * @param {string} receiver 接受者标识
   * @param {SetTokenHandler} setter 令牌更新回调
   * @param {GetTokenHandler} getter 令牌获取回调
   * @param {StateChangeHandler} stateChange 状态变更回调
   */
  public bindCallback(
    receiver: string,
    setter: SetTokenHandler,
    getter: GetTokenHandler,
    stateChange?: StateChangeHandler
  ) {
    this._callbackReceiver = receiver;
    this._setTokens = setter;
    this._getTokens = getter;
    if (stateChange) {
      this._stateChange = stateChange;
    }
  }
  /**
   * 绑定认证过期事件
   * @param {AuthExpiredEvent} callback 认证过期事件回调
   */
  public bindAuthExpiredEvent(callback: AuthExpiredEvent) {
    this._onAuthExpired = callback;
  }
  /**
   * 检查用户是否具有指定角色
   * @param {UserRole} role 角色
   * @returns {boolean} 是否具有角色
   */
  public hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }
  /**
   * 密码认证
   * @param {string} user 用户标识
   * @param {string} password 密码
   * @returns {Promise<BackendResult<AllocatedTokens>>} 已认证令牌
   */
  public async authenticateByPassword(
    user: string,
    password: string
  ): Promise<BackendResult<AllocatedTokens>> {
    this._user = user;
    this._password = password;
    this._authMethod = AuthMethod.Secret;
    const tokenResult = await authenticateByPassword(
      this._backendURL,
      user,
      this._device,
      password
    );
    if (tokenResult.unauthenticated || tokenResult.error) {
      return {
        unauthenticated: tokenResult.unauthenticated,
        error: tokenResult.error,
      };
    } else if (!tokenResult.data) {
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
    await this.onTokenUpdated(tokens);
    return {
      data: tokens,
    };
  }

  /**
   * 使用秘钥字符串校验
   * @param {string} token 秘钥字符串
   * @returns {Promise<BackendResult<AllocatedTokens>>} 已认证令牌
   */
  public async authenticateByToken(
    token: string
  ): Promise<BackendResult<AllocatedTokens>> {
    //decode from base64
    const payload = atob(token);
    //parse json
    const key: PrivateKey = JSON.parse(payload);
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
    const tokenResult = await authenticateByToken(
      this._backendURL,
      key.id,
      this._device,
      key.serial,
      key.algorithm,
      key.private_key
    );
    if (tokenResult.unauthenticated) {
      return {
        unauthenticated: tokenResult.unauthenticated,
      };
    } else if (tokenResult.error) {
      return {
        error: tokenResult.error,
      };
    } else if (!tokenResult.data) {
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
    await this.onTokenUpdated(tokens);
    return {
      data: tokens,
    };
  }
  /**
   * 令牌更新回调
   * @param {AllocatedTokens} tokens 已分配令牌
   * @returns {Promise<void>} 无返回值
   */
  private async onTokenUpdated(tokens: AllocatedTokens): Promise<void> {
    if (this._callbackReceiver && this._setTokens) {
      await this._setTokens(this._callbackReceiver, tokens);
    }
  }
  /**
   * 刷新令牌
   * @returns {Promise<BackendResult>} 刷新结果
   */
  private async refreshToken(): Promise<BackendResult> {
    if (!this._authenticated) {
      return {
        error: "尚未认证",
      };
    }
    const result = await refreshAccessToken(
      this._backendURL,
      this._user,
      this._device,
      this._authenticatedTokens.refresh_token
    );
    if (result.unauthenticated) {
      this._authenticated = false;
      return {
        unauthenticated: result.unauthenticated,
      };
    } else if (result.error) {
      return {
        error: result.error,
      };
    } else if (!result.data) {
      return {
        error: "刷新令牌失败",
      };
    }
    const tokens: AllocatedTokens = result.data;
    const err = this.validateTokens(tokens);
    if (err) {
      console.log(`connector-${this._id}: 刷新令牌校验失败,${err}`);
      return {
        error: "无效令牌",
      };
    }
    this._authenticatedTokens = tokens;
    await this.onTokenUpdated(tokens);
    return {};
  }
  /**
   * 直接加载令牌，初始化校验状态
   * @param {AllocatedTokens} tokens 令牌
   * @returns {BackendResult} 加载结果
   */
  public loadTokens(tokens: AllocatedTokens): BackendResult {
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
   * 计划刷新令牌
   * @description 访问令牌过期时间提前90秒，自动触发刷新令牌
   */
  public startHeartBeat() {
    //access_expired_at根据RFC3339转换为时间，提前90秒，自动触发refreshToken
    const expireTime =
      new Date(this._authenticatedTokens.access_expired_at).getTime() -
      Date.now() -
      90 * 1000;
    //延迟15秒用于测试
    // const expireTime = 15 * 1000;
    this.stopHeartBeat();
    this._refreshTimer = setInterval(async () => {
      await this.keepAlive();
    }, expireTime);
    this._keepAlive = true;
    // console.log(
    //   `connector-${this._id}: start keep alive timer ${this._refreshTimer}`
    // );
  }
  private async keepAlive() {
    //先同步令牌
    await this.syncTokens();
    //刷新令牌
    const refreshResult = await this.refreshToken();
    if (refreshResult.unauthenticated || refreshResult.error) {
      console.log(
        `connector-${this._id}: expired when keep alive, refresh ${this._authenticatedTokens.refresh_token}, ${refreshResult.unauthenticated}, ${refreshResult.error}`
      );
      this.onValidationExpired();
      return;
    }
    // console.log(`connector-${this._id}: keep alive success`);
  }
  /**
   * 停止刷新令牌
   * @description 调用此方法后，令牌将不再自动刷新
   */
  private stopHeartBeat() {
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
   * 校验令牌过期
   * @description 校验令牌是否过期，过期则触发刷新令牌
   */
  private onValidationExpired() {
    if (!this._authenticated) {
      //only invoke once
      return;
    }
    console.log(`connector-${this._id}: validation expired`);
    this._authenticated = false;
    this._authenticatedTokens = {} as AllocatedTokens;
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
   * @param {AllocatedTokens} tokens 分配到的领导
   * @returns {string} 非空则为错误信息
   */
  private validateTokens(tokens: AllocatedTokens): string {
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
      return `用户${
        tokens.user
      }访问令牌过期: ${accessExpired.toLocaleString()},刷新令牌${
        tokens.refresh_token
      } `;
      return "刷新令牌过期";
    }
    const refreshExpired = new Date(tokens.refresh_expired_at);
    if (now - ToleranceDuration > refreshExpired.getTime()) {
      return `用户${
        tokens.user
      }刷新令牌过期: ${refreshExpired.toLocaleString()},刷新令牌${
        tokens.refresh_token
      } `;
    }
    return "";
  }
  /**
   * 发送控制命令，获取响应内容
   * @param {ControlCommandRequest} cmd 控制命令请求
   * @returns {Promise<BackendResult<ControlCommandResponse>>} 控制命令响应
   */
  private async requestCommandResponse(
    cmd: ControlCommandRequest
  ): Promise<BackendResult<ControlCommandResponse>> {
    let result = await fetchCommandResponse(
      this._backendURL,
      this._authenticatedTokens.access_token,
      this._authenticatedTokens.csrf_token,
      cmd
    );
    if (result.unauthenticated) {
      // 刷新令牌
      result = await this.resendCommand(cmd);
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
    } else if (!result.data) {
      return {
        error: "没有响应内容",
      };
    }
    return {
      data: result.data,
    };
  }
  /**
   * 重发指令
   * @param {ControlCommandRequest} cmd 请求指令
   * @returns {Promise<BackendResult<ControlCommandResponse>>} 请求响应
   */
  private async resendCommand(
    cmd: ControlCommandRequest
  ): Promise<BackendResult<ControlCommandResponse>> {
    const changed = await this.syncTokens();
    if (!changed) {
      //无令牌变化，自己尝试刷新
      const refreshResult = await this.refreshToken();
      if (refreshResult.unauthenticated || refreshResult.error) {
        console.log(
          `connector-${this._id}: expired when resend command ${cmd.type}, refresh ${this._authenticatedTokens.refresh_token}, ${refreshResult.unauthenticated}, ${refreshResult.error}`
        );
        this.onValidationExpired();
        return {
          unauthenticated: refreshResult.unauthenticated,
          error: refreshResult.error,
        };
      }
    }
    //request again
    const result = await fetchCommandResponse(
      this._backendURL,
      this._authenticatedTokens.access_token,
      this._authenticatedTokens.csrf_token,
      cmd
    );
    return result;
  }
  /**
   * 同步令牌
   * @description 从后端获取令牌，更新本地令牌
   * @returns {Promise<boolean>} 是否令牌已更新
   */
  private async syncTokens(): Promise<boolean> {
    const currentAccessToken = this._authenticatedTokens.access_token;
    let changed = false;
    if (this._getTokens) {
      const updatedTokens = await this._getTokens(this._callbackReceiver);
      if (
        updatedTokens.access_token &&
        currentAccessToken != updatedTokens.access_token
      ) {
        //令牌已更新
        this._authenticatedTokens = updatedTokens;
        changed = true;
      }
    }
    return changed;
  }
  /**
   * 发送控制命令
   * @param {ControlCommandRequest} cmd 控制命令请求
   * @returns {Promise<BackendResult>} 控制命令响应
   */
  private async sendCommand(
    cmd: ControlCommandRequest
  ): Promise<BackendResult> {
    const result = await sendCommand(
      this._backendURL,
      this._authenticatedTokens.access_token,
      this._authenticatedTokens.csrf_token,
      cmd
    );
    if (result.unauthenticated) {
      const resendResult = await this.resendCommand(cmd);
      if (resendResult.unauthenticated) {
        return {
          unauthenticated: resendResult.unauthenticated,
        };
      }
      result.error = resendResult.error;
    }
    return result;
  }
  /**
   * 启动任务，发送控制命令，返回任务ID
   * @param {ControlCommandRequest} cmd 控制命令请求
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async startTask(
    cmd: ControlCommandRequest
  ): Promise<BackendResult<string>> {
    const resp = await this.requestCommandResponse(cmd);
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
  }
  /**
   * 执行任务，发送控制命令，等待任务完成
   * @param {ControlCommandRequest} cmd 控制命令请求
   * @param {number} timeoutSeconds 超时时间（秒），默认5分钟
   * @param {number} intervalSeconds 检查间隔（秒），默认1秒
   * @returns {Promise<TaskData>} 任务数据
   */
  public async executeTask(
    cmd: ControlCommandRequest,
    timeoutSeconds: number = 300,
    intervalSeconds: number = 1
  ): Promise<BackendResult<TaskData>> {
    const taskIDResp = await this.startTask(cmd);
    if (taskIDResp.error) {
      return {
        error: taskIDResp.error,
      };
    }
    return await this.waitTask(
      taskIDResp.data!,
      timeoutSeconds,
      intervalSeconds
    );
  }
  /**
   * 获取任务详情
   * @param {string} taskID 任务ID
   * @returns {Promise<BackendResult<TaskData>>} 任务数据
   */
  public async getTask(taskID: string): Promise<BackendResult<TaskData>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetTask,
      get_task: {
        id: taskID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }
  /**
   * 等待任务完成
   * @param taskID 任务ID
   * @param timeoutSeconds 超时时间（秒）
   * @param intervalSeconds 检查间隔（秒）
   * @returns {Promise<BackendResult<TaskData>>} 任务数据
   */
  public async waitTask(
    taskID: string,
    timeoutSeconds: number = 300,
    intervalSeconds: number = 1
  ): Promise<BackendResult<TaskData>> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutSeconds * 1000) {
      const resp = await this.getTask(taskID);
      if (resp.error) {
        return {
          error: resp.error,
        };
      }
      if (resp.data && resp.data.status === TaskStatus.Completed) {
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
      await new Promise((resolve) =>
        setTimeout(resolve, intervalSeconds * 1000)
      );
    }
    throw new Error(`任务${taskID}等待超过${timeoutSeconds}秒`);
  }
  /**
   * 获取系统状态
   * @returns {Promise<BackendResult<SystemStatus>>} 系统状态
   */
  public async getSystemStatus(): Promise<BackendResult<SystemStatus>> {
    const result = await checkSystemStatus(this._backendURL);
    if (result.error) {
      return {
        error: result.error,
      };
    } else if (!result.data) {
      return {
        error: "获取系统状态失败",
      };
    }
    const status: SystemStatus = result.data;
    this._locale = status.locale;
    return {
      data: status,
    };
  }
  /**
   * 初始化系统
   * @param {string} user 用户标识
   * @param {string} password 密码
   */
  public async initializeSystem(
    user: string,
    password: string
  ): Promise<BackendResult> {
    const result = await initialSystem(this._backendURL, user, password);
    if (result.error) {
      return {
        error: result.error,
      };
    }
    return {};
  }

  /**
   * 生成用户令牌
   * @param {string} user 用户标识
   * @param {string} description 描述
   * @param {number} expireInMonths 过期时间（月）
   * @returns {Promise<BackendResult<string>>} 用户令牌
   */
  public async generateUserToken(
    user: string,
    description?: string,
    expireInMonths?: number
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GenerateUserToken,
      generate_user_token: {
        user,
        description,
        months: expireInMonths,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }
  // 以下为对外功能接口
  /**
   * 尝试创建云主机，成功返回任务ID
   * @param {string} poolID 计算资源池
   * @param {string} system 目标系统
   * @param {GuestConfig} config 云主机配置
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryCreateGuest(
    poolID: string,
    system: string,
    config: GuestConfig
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CreateGuest,
      create_guest: {
        ...config,
        pool: poolID,
        system: system,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }
  /**
   * 创建云主机，成功返回云主机ID
   * @param {string} poolID 计算资源池
   * @param {string}system 目标系统
   * @param {GuestConfig} config 云主机配置
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult<string>>} 云主机ID
   */
  public async createGuest(
    poolID: string,
    system: string,
    config: GuestConfig,
    timeoutSeconds: number = 300
  ): Promise<BackendResult<string>> {
    const taskResult = await this.tryCreateGuest(poolID, system, config);
    if (taskResult.error) {
      return taskResult;
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
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
  }

  /**
   * 尝试删除云主机，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryDeleteGuest(guestID: string): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeleteGuest,
      delete_guest: {
        guest: guestID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 删除云主机
   * @param {string} guestID 云主机ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async deleteGuest(
    guestID: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryDeleteGuest(guestID);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 获取云主机详情
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<GuestView>>} 云主机详情
   */
  public async getGuest(guestID: string): Promise<BackendResult<GuestView>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetGuest,
      get_guest: {
        id: guestID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (!resp.data || !resp.data.guest) {
      return {
        error: "获取云主机详情失败",
      };
    }
    return {
      data: resp.data.guest,
    };
  }

  /**
   * 尝试启动云主机，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} [media] ISO镜像ID（可选）
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryStartGuest(
    guestID: string,
    media?: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.StartGuest,
      start_guest: {
        guest: guestID,
        media: media,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (!resp.data || !resp.data.id) {
      return {
        error: "尝试启动云主机失败",
      };
    }
    return {
      data: resp.data.id,
    };
  }

  /**
   * 启动云主机
   * @param {string} guestID 云主机ID
   * @param {string?} media ISO镜像ID（可选）
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 启动结果
   */
  public async startGuest(
    guestID: string,
    media?: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryStartGuest(guestID, media);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试停止云主机，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {boolean} reboot 是否重启云主机
   * @param {boolean} force 是否强制执行
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryStopGuest(
    guestID: string,
    reboot: boolean,
    force: boolean
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.StopGuest,
      stop_guest: {
        guest: guestID,
        reboot,
        force,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 停止云主机
   * @param {string} guestID 云主机ID
   * @param {boolean} reboot 是否重启云主机
   * @param {boolean} force 是否强制执行
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 停止结果
   */
  public async stopGuest(
    guestID: string,
    reboot: boolean,
    force: boolean,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryStopGuest(guestID, reboot, force);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试添加卷，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {VolumeSpec} volume 磁盘卷配置
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryAddVolume(
    guestID: string,
    volume: VolumeSpec
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddVolume,
      add_volume: {
        guest: guestID,
        volume,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加卷
   * @param {string} guestID 云主机ID
   * @param {VolumeSpec} volume 磁盘卷配置
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addVolume(
    guestID: string,
    volume: VolumeSpec,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryAddVolume(guestID, volume);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试删除卷，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} tag 卷标签
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryDeleteVolume(
    guestID: string,
    tag: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeleteVolume,
      delete_volume: {
        guest: guestID,
        tag: tag,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 删除卷
   * @param {string} guestID 云主机ID
   * @param {string} tag 卷标签
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async deleteVolume(
    guestID: string,
    tag: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryDeleteVolume(guestID, tag);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试修改云主机CPU，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {number} cores CPU核心数
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryModifyGuestCPU(
    guestID: string,
    cores: number
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyCPU,
      modify_cpu: {
        guest: guestID,
        cores: cores,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改云主机CPU
   * @param {string} guestID 云主机ID
   * @param {number} cores CPU核心数
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyGuestCPU(
    guestID: string,
    cores: number,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyGuestCPU(guestID, cores);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 查询云主机
   * @param start 起始位置
   * @param limit 限制数量
   * @param filter 过滤条件
   * @returns {Promise<BackendResult<PaginationResult<GuestView>>>} 云主机列表
   */
  public async queryGuests(
    start: number,
    limit: number,
    filter?: GuestFilter
  ): Promise<BackendResult<PaginationResult<GuestView>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryGuests,
      query_guests: {
        start,
        limit,
        filter,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 尝试修改云主机内存，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {number} memoryMB 内存大小(MB)
   * @returns {Promise<BackendResult<string>>} 任务id
   */
  public async tryModifyGuestMemory(
    guestID: string,
    memoryMB: number
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyMemory,
      modify_memory: {
        guest: guestID,
        memory: memoryMB,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改云主机内存
   * @param {string} guestID 云主机ID
   * @param {number} memoryMB 内存大小(MB)
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyGuestMemory(
    guestID: string,
    memoryMB: number,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyGuestMemory(guestID, memoryMB);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试修改云主机主机名，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} hostname 主机名
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryModifyGuestHostname(
    guestID: string,
    hostname: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyHostname,
      modify_hostname: {
        guest: guestID,
        hostname: hostname,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改云主机主机名
   * @param {string} guestID 云主机ID
   * @param {string} hostname 主机名
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyGuestHostname(
    guestID: string,
    hostname: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyGuestHostname(guestID, hostname);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试修改密码，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} user 用户名
   * @param {string} password 新密码
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryModifyPassword(
    guestID: string,
    user: string,
    password: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyPassword,
      modify_password: {
        guest: guestID,
        user: user,
        password: password,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改密码
   * @param {string} guestID 云主机ID
   * @param {string} user 用户名
   * @param {string} password 新密码
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyPassword(
    guestID: string,
    user: string,
    password: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyPassword(guestID, user, password);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试修改自动启动，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {boolean} enable 是否启用自动启动
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryModifyAutoStart(
    guestID: string,
    enable: boolean
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyAutoStart,
      modify_autostart: {
        guest: guestID,
        enable: enable,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改自动启动
   * @param {string} guestID 云主机ID
   * @param {boolean} enable 是否启用自动启动
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyAutoStart(
    guestID: string,
    enable: boolean,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyAutoStart(guestID, enable);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试添加外部接口，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryAddExternalInterface(
    guestID: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddExternalInterface,
      add_external_interface: {
        guest: guestID,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加外部接口
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addExternalInterface(
    guestID: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryAddExternalInterface(guestID, macAddress);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试移除外部接口，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryRemoveExternalInterface(
    guestID: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveExternalInterface,
      remove_external_interface: {
        guest: guestID,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 移除外部接口
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 移除结果
   */
  public async removeExternalInterface(
    guestID: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryRemoveExternalInterface(
      guestID,
      macAddress
    );
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试添加内部接口，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryAddInternalInterface(
    guestID: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddInternalInterface,
      add_internal_interface: {
        guest: guestID,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加内部接口
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addInternalInterface(
    guestID: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryAddInternalInterface(guestID, macAddress);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试移除内部接口，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryRemoveInternalInterface(
    guestID: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveInternalInterface,
      remove_internal_interface: {
        guest: guestID,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 移除内部接口
   * @param {string} guestID 云主机ID
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 移除结果
   */
  public async removeInternalInterface(
    guestID: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryRemoveInternalInterface(
      guestID,
      macAddress
    );
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 尝试重置监控，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<string>>} 包含任务id的结果
   */
  public async tryResetMonitor(
    guestID: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ResetMonitor,
      reset_monitor: {
        guest: guestID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 重置监控
   * @param {string} guestID 云主机ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 重置结果
   */
  public async resetMonitor(
    guestID: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryResetMonitor(guestID);
    if (taskResult.error) {
      return {
        error: taskResult.error,
      };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return {
        error: taskData.error,
      };
    }
    return {};
  }

  /**
   * 查询任务
   * @param {number} offset 偏移量
   * @param {number} pageSize 每页大小
   * @returns {Promise<BackendResult<PaginationResult<TaskData>>>} 包含任务分页结果的结果
   */
  public async queryTasks(
    offset: number,
    pageSize: number
  ): Promise<BackendResult<PaginationResult<TaskData>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryTasks,
      query_tasks: {
        offset: offset,
        page_size: pageSize,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加节点
   * @param {ClusterNode} config 节点配置
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async addNode(config: ClusterNode): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddNode,
      add_node: config,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 移除节点
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async removeNode(nodeID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveNode,
      remove_node: { id: nodeID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询节点列表
   * @returns {Promise<BackendResult<ClusterNodeData[]>>} 节点数据列表
   */
  public async queryNodes(): Promise<BackendResult<ClusterNodeData[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryNodes,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "获取节点列表失败" };
    }
    return { data: resp.data.cluster_nodes || [] };
  }

  /**
   * 获取节点详情
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult<ClusterNodeData>>} 节点数据
   */
  public async getNode(
    nodeID: string
  ): Promise<BackendResult<ClusterNodeData>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetNode,
      get_node: { id: nodeID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.cluster_node) {
      return { error: "节点不存在" };
    }
    return { data: resp.data.cluster_node };
  }

  /**
   * 启用节点
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async enableNode(nodeID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.EnableNode,
      enable_node: { node_id: nodeID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 禁用节点
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async disableNode(nodeID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DisableNode,
      disable_node: { node_id: nodeID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询计算资源池
   * @returns {Promise<BackendResult<ComputePoolStatus[]>>} 计算资源池状态列表
   */
  public async queryComputePools(): Promise<
    BackendResult<ComputePoolStatus[]>
  > {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryPools,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "获取计算资源池列表失败" };
    }
    return { data: resp.data.compute_pools || [] };
  }

  /**
   * 获取计算资源池详情
   * @param {string} poolID 资源池ID
   * @returns {Promise<BackendResult<ComputePoolStatus>>} 计算资源池状态
   */
  public async getComputePool(
    poolID: string
  ): Promise<BackendResult<ComputePoolStatus>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetPool,
      get_pool: { id: poolID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.compute_pool) {
      return { error: "计算资源池不存在" };
    }
    return { data: resp.data.compute_pool };
  }

  /**
   * 添加计算资源池
   * @param {ComputePoolConfig} config 计算资源池配置
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async addComputePool(
    config: ComputePoolConfig
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddPool,
      add_pool: config,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改计算资源池
   * @param {ComputePoolConfig} config 计算资源池配置
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async modifyComputePool(
    config: ComputePoolConfig
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyPool,
      modify_pool: config,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除计算资源池
   * @param {string} poolID 资源池ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async deleteComputePool(poolID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeletePool,
      delete_pool: { id: poolID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加计算节点到资源池
   * @param {string} poolID 资源池ID
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async addComputeNode(
    poolID: string,
    nodeID: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddPoolNode,
      add_pool_node: { pool: poolID, node: nodeID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 从资源池移除计算节点
   * @param {string} poolID 资源池ID
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async removeComputeNode(
    poolID: string,
    nodeID: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemovePoolNode,
      remove_pool_node: { pool: poolID, node: nodeID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改计算资源池策略
   * @param {string} poolID 资源池ID
   * @param {ComputePoolStrategy} strategy 资源池策略
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async changeComputePoolStrategy(
    poolID: string,
    strategy: ComputePoolStrategy
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ChangeComputePoolStrategy,
      change_pool_strategy: {
        pool_id: poolID,
        strategy: strategy,
      },
    };
    return await this.sendCommand(cmd);
  }

  // Storage Pool Management Methods
  /**
   * 查询存储池列表
   * @returns {Promise<BackendResult<StoragePoolListRecord[]>>} 存储池列表
   */
  public async queryStoragePools(): Promise<
    BackendResult<StoragePoolListRecord[]>
  > {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryStoragePools,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "获取存储池列表失败" };
    }
    return { data: resp.data.storage_pools || [] };
  }

  /**
   * 获取存储池详情
   * @param {string} poolID 存储池ID
   * @returns {Promise<BackendResult<StoragePool>>} 存储池详情
   */
  public async getStoragePool(
    poolID: string
  ): Promise<BackendResult<StoragePool>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetStoragePool,
      get_storage_pool: { id: poolID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.storage_pool) {
      return { error: "存储池不存在" };
    }
    return { data: resp.data.storage_pool };
  }

  /**
   * 添加存储池
   * @param {StoragePoolConfig} config 存储池配置
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async addStoragePool(
    config: StoragePoolConfig
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddStoragePool,
      add_storage_pool: config,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除存储池
   * @param {string} poolID 存储池ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async removeStoragePool(poolID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveStoragePool,
      remove_storage_pool: { id: poolID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改远程存储策略
   * @param {string} poolID 存储池ID
   * @param {VolumeContainerStrategy} strategy 存储策略
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async modifyRemoteStorageStrategy(
    poolID: string,
    strategy: VolumeContainerStrategy
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyRemoteStorageStrategy,
      modify_remote_storage_strategy: {
        pool_id: poolID,
        strategy: strategy,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 改变远程容器标志
   * @param {string} poolID 存储池ID
   * @param {number} index 容器索引
   * @param {boolean} enabled 是否启用
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async changeRemoteContainerFlag(
    poolID: string,
    index: number,
    enabled: boolean
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ChangeRemoteContainerFlag,
      change_remote_container_flag: {
        pool_id: poolID,
        index: index,
        enabled: enabled,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 尝试添加远程容器，成功返回任务ID
   * @param {string} poolID 存储池ID
   * @param {VolumeContainer} container 容器配置
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryAddRemoteContainer(
    poolID: string,
    container: VolumeContainer
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddRemoteContainer,
      add_remote_container: {
        pool_id: poolID,
        container: container,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试添加远程容器失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 添加远程容器
   * @param {string} poolID 存储池ID
   * @param {VolumeContainer} container 容器配置
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async addRemoteContainer(
    poolID: string,
    container: VolumeContainer,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryAddRemoteContainer(poolID, container);
    if (taskResult.error) {
      return { error: taskResult.error };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 尝试修改远程容器，成功返回任务ID
   * @param {string} poolID 存储池ID
   * @param {number} index 容器索引
   * @param {VolumeContainer} container 容器配置
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryModifyRemoteContainer(
    poolID: string,
    index: number,
    container: VolumeContainer
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyRemoteContainer,
      modify_remote_container: {
        pool_id: poolID,
        index: index,
        container: container,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试修改远程容器失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 修改远程容器
   * @param {string} poolID 存储池ID
   * @param {number} index 容器索引
   * @param {VolumeContainer} container 容器配置
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async modifyRemoteContainer(
    poolID: string,
    index: number,
    container: VolumeContainer,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryModifyRemoteContainer(
      poolID,
      index,
      container
    );
    if (taskResult.error) {
      return { error: taskResult.error };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 尝试删除远程容器，成功返回任务ID
   * @param {string} poolID 存储池ID
   * @param {number} index 容器索引
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryRemoveRemoteContainer(
    poolID: string,
    index: number
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveRemoteContainer,
      remove_remote_container: {
        pool_id: poolID,
        index: index,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试删除远程容器失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 删除远程容器
   * @param {string} poolID 存储池ID
   * @param {number} index 容器索引
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async removeRemoteContainer(
    poolID: string,
    index: number,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryRemoveRemoteContainer(poolID, index);
    if (taskResult.error) {
      return { error: taskResult.error };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  // Address Pool Management Methods
  /**
   * 查询地址池列表
   * @param {number} offset 起始位置
   * @param {number} limit 限制数量
   * @returns {Promise<BackendResult<PaginationResult<AddressPoolRecord>>>} 地址池列表
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async queryAddressPools(
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<AddressPoolRecord>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryAddressPools,
      query_address_pools: {
        offset: offset,
        page_size: limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (
      !resp.data ||
      !resp.data.address_pools ||
      resp.data.total === undefined
    ) {
      return { error: "获取地址池列表失败" };
    }
    return {
      data: {
        records: resp.data.address_pools,
        total: resp.data.total,
      },
    };
  }

  /**
   * 获取地址池详情
   * @param {string} poolID 地址池ID
   * @returns {Promise<BackendResult<AddressPool>>} 地址池详情
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async getAddressPool(
    poolID: string
  ): Promise<BackendResult<AddressPool>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetAddressPool,
      get_address_pool: { id: poolID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.address_pool) {
      return { error: "地址池不存在" };
    }
    return { data: resp.data.address_pool };
  }

  /**
   * 添加地址池
   * @param {string} id 地址池ID
   * @param {InterfaceMode} mode 接口模式
   * @param {boolean} isV6 是否为IPv6
   * @param {string} [description] 描述
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async addAddressPool(
    id: string,
    mode: InterfaceMode,
    isV6: boolean,
    description?: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddAddressPool,
      add_address_pool: {
        id,
        mode,
        is_v6: isV6,
        description,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改地址池
   * @param {string} id 地址池ID
   * @param {InterfaceMode} mode 接口模式
   * @param {string} [description] 描述
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async modifyAddressPool(
    id: string,
    mode: InterfaceMode,
    description?: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyAddressPool,
      modify_address_pool: {
        id,
        mode,
        description,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除地址池
   * @param {string} poolID 地址池ID
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async removeAddressPool(poolID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveAddressPool,
      remove_address_pool: { id: poolID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加外部地址范围
   * @param {string} poolID 地址池ID
   * @param {string} beginAddress 起始地址
   * @param {string} endAddress 结束地址
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async addExternalAddressRange(
    poolID: string,
    beginAddress: string,
    endAddress: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddExternalAddressRange,
      address_range: {
        pool: poolID,
        begin: beginAddress,
        end: endAddress,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加内部地址范围
   * @param {string} poolID 地址池ID
   * @param {string} beginAddress 起始地址
   * @param {string} endAddress 结束地址
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async addInternalAddressRange(
    poolID: string,
    beginAddress: string,
    endAddress: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddInternalAddressRange,
      address_range: {
        pool: poolID,
        begin: beginAddress,
        end: endAddress,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除外部地址范围
   * @param {string} poolID 地址池ID
   * @param {string} beginAddress 起始地址
   * @param {string} endAddress 结束地址
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async removeExternalAddressRange(
    poolID: string,
    beginAddress: string,
    endAddress: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveExternalAddressRange,
      address_range: {
        pool: poolID,
        begin: beginAddress,
        end: endAddress,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除内部地址范围
   * @param {string} poolID 地址池ID
   * @param {string} beginAddress 起始地址
   * @param {string} endAddress 结束地址
   * @returns {Promise<BackendResult>} 操作结果
   * @deprecated 地址池相关接口全部会重新设计
   */
  public async removeInternalAddressRange(
    poolID: string,
    beginAddress: string,
    endAddress: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveInternalAddressRange,
      address_range: {
        pool: poolID,
        begin: beginAddress,
        end: endAddress,
      },
    };
    return await this.sendCommand(cmd);
  }

  // ISO File Management Methods
  /**
   * 创建ISO文件
   * @param {FileSpec} spec 文件规格
   * @param {ResourceAccessLevel} access_level 资源访问级别
   * @returns {Promise<BackendResult<string>>} 文件ID
   */
  public async createISOFile(
    spec: FileSpec,
    access_level: ResourceAccessLevel
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CreateISO,
      create_iso: {
        spec: {
          ...spec,
          category: FileCategory.ISO,
          format: FileFormat.ISO,
        },
        access_level: access_level,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "创建ISO文件失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 删除ISO文件
   * @param {string} fileID 文件ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async deleteISOFile(fileID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeleteISO,
      delete_iso: { id: fileID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改ISO文件
   * @param {string} fileID 文件ID
   * @param {FileSpec} spec 文件规格
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async modifyISOFile(
    fileID: string,
    spec: FileSpec
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyISO,
      modify_iso: {
        id: fileID,
        spec: {
          ...spec,
          category: FileCategory.ISO,
          format: FileFormat.ISO,
        },
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取ISO文件详情
   * @param {string} fileID 文件ID
   * @returns {Promise<BackendResult<FileStatus>>} 文件状态
   */
  public async getISOFile(fileID: string): Promise<BackendResult<FileStatus>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetISO,
      get_iso: { id: fileID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.file) {
      return { error: "ISO文件不存在" };
    }
    return { data: resp.data.file };
  }

  /**
   * 查询ISO文件列表
   * @param {number} offset 起始位置
   * @param {number} limit 限制数量
   * @param {boolean} onlySelf 是否只查询当前用户的ISO文件
   * @returns {Promise<BackendResult<PaginationResult<FileView>>>} ISO文件列表
   */
  public async queryISOFiles(
    offset: number,
    limit: number,
    onlySelf: boolean = false
  ): Promise<BackendResult<PaginationResult<FileView>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryISO,
      query_iso: {
        start: offset,
        limit: limit,
        only_self: onlySelf,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  // Disk File Management Methods
  /**
   * 创建磁盘文件
   * @param {FileSpec} spec 文件规格
   * @param {ResourceAccessLevel} access_level 资源访问级别
   * @returns {Promise<BackendResult<string>>} 文件ID
   */
  public async createDiskFile(
    spec: FileSpec,
    access_level: ResourceAccessLevel
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CreateDisk,
      create_disk: {
        spec: {
          ...spec,
          category: FileCategory.Disk,
          format: FileFormat.Qcow2,
        },
        access_level: access_level,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "创建磁盘文件失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 删除磁盘文件
   * @param {string} fileID 文件ID
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async deleteDiskFile(fileID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeleteDisk,
      delete_disk: { id: fileID },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改磁盘文件
   * @param {string} fileID 文件ID
   * @param {FileSpec} spec 文件规格
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async modifyDiskFile(
    fileID: string,
    spec: FileSpec
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyDisk,
      modify_disk: {
        id: fileID,
        spec: {
          ...spec,
          category: FileCategory.Disk,
          format: FileFormat.Qcow2,
        },
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取磁盘文件详情
   * @param {string} fileID 文件ID
   * @returns {Promise<BackendResult<FileStatus>>} 文件状态
   */
  public async getDiskFile(fileID: string): Promise<BackendResult<FileStatus>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetDisk,
      get_disk: { id: fileID },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.file) {
      return { error: "磁盘文件不存在" };
    }
    return { data: resp.data.file };
  }

  /**
   * 查询磁盘文件列表
   * @param {number} offset 起始位置
   * @param {number} limit 限制数量
   * @param {boolean} onlySelf 是否只查询当前用户的磁盘文件
   * @returns {Promise<BackendResult<PaginationResult<FileView>>>} 磁盘文件列表
   */
  public async queryDiskFiles(
    offset: number,
    limit: number,
    onlySelf: boolean = false
  ): Promise<BackendResult<PaginationResult<FileView>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryDisk,
      query_disk: {
        start: offset,
        limit: limit,
        only_self: onlySelf,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 获取ISO文件URL
   * @param {string} fileID 文件ID
   * @returns {string} 文件URL
   */
  public getISOFileURL(fileID: string): string {
    return `${this._backendURL}files/isos/${fileID}`;
  }

  /**
   * 获取磁盘文件URL
   * @param {string} fileID 文件ID
   * @returns {string} 文件URL
   */
  public getDiskFileURL(fileID: string): string {
    return `${this._backendURL}files/disks/${fileID}`;
  }

  /**
   * 打开监控通道
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<MonitorResponse>>} 监控响应
   */
  public async openMonitorChannel(
    guestID: string
  ): Promise<BackendResult<MonitorResponse>> {
    const resp = await openMonitorChannel(
      this._backendURL,
      this._authenticatedTokens.access_token,
      this._authenticatedTokens.csrf_token,
      guestID
    );
    if (resp.error || resp.unauthenticated) {
      return { error: resp.error, unauthenticated: resp.unauthenticated };
    }
    if (!resp.data) {
      return { error: "无法获取监控信息" };
    }
    return { data: resp.data };
  }

  /**
   * 尝试插入介质，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} mediaId 介质ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryInsertMedia(
    guestID: string,
    mediaId: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.InsertMedia,
      insert_media: {
        guest: guestID,
        media: mediaId,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试插入介质失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 插入介质
   * @param {string} guestID 云主机ID
   * @param {string} mediaId 介质ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 操作结果
   */
  public async insertMedia(
    guestID: string,
    mediaId: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskResult = await this.tryInsertMedia(guestID, mediaId);
    if (taskResult.error) {
      return { error: taskResult.error };
    }
    const taskData = await this.waitTask(taskResult.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 尝试弹出介质，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryEjectMedia(guestID: string): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.EjectMedia,
      eject_media: {
        guest: guestID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试弹出介质失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 弹出介质
   * @param {string} guestID 云主机ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 无返回值
   */
  public async ejectMedia(
    guestID: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskIDResult = await this.tryEjectMedia(guestID);
    if (taskIDResult.error) {
      return { error: taskIDResult.error };
    }
    const taskData = await this.waitTask(taskIDResult.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 尝试调整磁盘大小，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} volumeTag 卷标签
   * @param {number} sizeInMB 大小（MB）
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryResizeDisk(
    guestID: string,
    volumeTag: string,
    sizeInMB: number
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ResizeDisk,
      resize_disk: {
        guest: guestID,
        volume: volumeTag,
        size: sizeInMB,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试调整磁盘大小失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 尝试收缩磁盘，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} volumeTag 卷标签
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryShrinkDisk(
    guestID: string,
    volumeTag: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ShrinkDisk,
      shrink_disk: {
        guest: guestID,
        volume: volumeTag,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试收缩磁盘失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 尝试安装磁盘镜像，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} volumeTag 卷标签
   * @param {string} fileID 文件ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryInstallDiskImage(
    guestID: string,
    volumeTag: string,
    fileID: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.InstallDiskImage,
      install_disk_image: {
        guest: guestID,
        volume: volumeTag,
        file: fileID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试安装磁盘镜像失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 尝试创建磁盘镜像，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} volumeTag 卷标签
   * @param {FileSpec} spec 文件规格
   * @param {ResourceAccessLevel} access_level 资源访问级别
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryCreateDiskImage(
    guestID: string,
    volumeTag: string,
    spec: FileSpec,
    access_level: ResourceAccessLevel
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CreateDiskImage,
      create_disk_image: {
        guest: guestID,
        volume: volumeTag,
        spec: spec,
        access_level: access_level,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试创建磁盘镜像失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 尝试同步ISO文件，成功返回任务ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   * @throws 尝试同步ISO文件失败
   */
  public async trySyncISOFiles(): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SyncISOFiles,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试同步ISO文件失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 尝试同步磁盘文件，成功返回任务ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   * @throws 尝试同步磁盘文件失败
   */
  public async trySyncDiskFiles(): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SyncDiskFiles,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试同步磁盘文件失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 查询资源池
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult<DataStore[]>>} 资源池列表
   */
  public async queryResourcePools(
    nodeID: string
  ): Promise<BackendResult<DataStore[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryResourcePools,
      query_resource_pools: {
        node_id: nodeID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询资源池失败" };
    }
    return { data: resp.data.resource_pools || [] };
  }

  /**
   * 修改资源存储策略
   * @param {string} nodeID 节点ID
   * @param {string} poolID 池ID
   * @param {VolumeContainerStrategy} strategy 存储策略
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyResourceStorageStrategy(
    nodeID: string,
    poolID: string,
    strategy: VolumeContainerStrategy
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyResourceStorageStrategy,
      modify_resource_storage_strategy: {
        node_id: nodeID,
        pool_id: poolID,
        strategy: strategy,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加资源容器
   * @param {string} nodeID 节点ID
   * @param {string} poolID 池ID
   * @param {VolumeContainer} container 容器配置
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addResourceContainer(
    nodeID: string,
    poolID: string,
    container: VolumeContainer
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddResourceContainer,
      add_resource_container: {
        node_id: nodeID,
        pool_id: poolID,
        container: container,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改资源容器
   * @param {string} nodeID 节点ID
   * @param {string} poolID 池ID
   * @param {number} index 容器索引
   * @param {VolumeContainer} container 容器配置
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyResourceContainer(
    nodeID: string,
    poolID: string,
    index: number,
    container: VolumeContainer
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyResourceContainer,
      modify_resource_container: {
        node_id: nodeID,
        pool_id: poolID,
        index: index,
        container: container,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除资源容器
   * @param {string} nodeID 节点ID
   * @param {string} poolID 池ID
   * @param {number} index 容器索引
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeResourceContainer(
    nodeID: string,
    poolID: string,
    index: number
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveResourceContainer,
      remove_resource_container: {
        node_id: nodeID,
        pool_id: poolID,
        index: index,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 更改资源容器标志
   * @param {string} nodeID 节点ID
   * @param {string} poolID 池ID
   * @param {number} index 容器索引
   * @param {boolean} enabled 是否启用
   * @returns {Promise<BackendResult>} 更改结果
   */
  public async changeResourceContainerFlag(
    nodeID: string,
    poolID: string,
    index: number,
    enabled: boolean
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ChangeResourceContainerFlag,
      change_resource_container_flag: {
        node_id: nodeID,
        pool_id: poolID,
        index: index,
        enabled: enabled,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询快照
   * @param {string} guestID 云主机ID
   * @returns {Promise<BackendResult<SnapshotTreeNode[]>>} 快照树节点列表
   */
  public async querySnapshots(
    guestID: string
  ): Promise<BackendResult<SnapshotTreeNode[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QuerySnapshots,
      query_snapshots: {
        guest: guestID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询快照失败" };
    }
    return { data: resp.data.snapshots || [] };
  }

  /**
   * 获取快照
   * @param {string} guestID 云主机ID
   * @param {string} snapshotID 快照ID
   * @returns {Promise<BackendResult<SnapshotRecord>>} 快照记录
   */
  public async getSnapshot(
    guestID: string,
    snapshotID: string
  ): Promise<BackendResult<SnapshotRecord>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetSnapshot,
      get_snapshot: {
        guest: guestID,
        snapshot: snapshotID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.snapshot) {
      return { error: "获取快照失败" };
    }
    return { data: resp.data.snapshot };
  }

  /**
   * 尝试创建快照，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} label 标签
   * @param {string} [description] 描述
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryCreateSnapshot(
    guestID: string,
    label: string,
    description?: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CreateSnapshot,
      create_snapshot: {
        guest: guestID,
        label: label,
        description: description,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试创建快照失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 创建快照
   * @param {string} guestID 云主机ID
   * @param {string} label 标签
   * @param {string} [description] 描述
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 创建结果
   */
  public async createSnapshot(
    guestID: string,
    label: string,
    description?: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskIDResult = await this.tryCreateSnapshot(
      guestID,
      label,
      description
    );
    if (taskIDResult.error) {
      return { error: taskIDResult.error };
    }
    const taskDataResult = await this.waitTask(
      taskIDResult.data!,
      timeoutSeconds
    );
    if (taskDataResult.error) {
      return { error: taskDataResult.error };
    }
    return {};
  }

  /**
   * 尝试恢复快照，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} snapshotID 快照ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryRestoreSnapshot(
    guestID: string,
    snapshotID: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RestoreSnapshot,
      restore_snapshot: {
        guest: guestID,
        snapshot: snapshotID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试恢复快照失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 恢复快照
   * @param {string} guestID 云主机ID
   * @param {string} snapshotID 快照ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 恢复结果
   */
  public async restoreSnapshot(
    guestID: string,
    snapshotID: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskIDResult = await this.tryRestoreSnapshot(guestID, snapshotID);
    if (taskIDResult.error) {
      return { error: taskIDResult.error };
    }
    const taskDataResult = await this.waitTask(
      taskIDResult.data!,
      timeoutSeconds
    );
    if (taskDataResult.error) {
      return { error: taskDataResult.error };
    }
    return {};
  }

  /**
   * 尝试删除快照，成功返回任务ID
   * @param {string} guestID 云主机ID
   * @param {string} snapshotID 快照ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryDeleteSnapshot(
    guestID: string,
    snapshotID: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.DeleteSnapshot,
      delete_snapshot: {
        guest: guestID,
        snapshot: snapshotID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.id) {
      return { error: "尝试删除快照失败" };
    }
    return { data: resp.data.id };
  }

  /**
   * 删除快照
   * @param {string} guestID 云主机ID
   * @param {string} snapshotID 快照ID
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async deleteSnapshot(
    guestID: string,
    snapshotID: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const taskIDResult = await this.tryDeleteSnapshot(guestID, snapshotID);
    if (taskIDResult.error) {
      return { error: taskIDResult.error };
    }
    const taskDataResult = await this.waitTask(
      taskIDResult.data!,
      timeoutSeconds
    );
    if (taskDataResult.error) {
      return { error: taskDataResult.error };
    }
    return {};
  }

  /**
   * 查询资源使用情况
   * @param {string[]} targets 目标列表
   * @returns {Promise<BackendResult<GuestResourceUsageData[]>>} 资源使用数据列表
   */
  public async queryResourceUsages(
    targets: string[]
  ): Promise<BackendResult<GuestResourceUsageData[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryResourceUsages,
      query_resource_usages: {
        targets: targets,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询资源使用情况失败" };
    }
    const payload = resp.data.resource_usages || [];
    const { results, error } = unmarshalResourceUsage(payload);
    if (error) {
      return { error: error };
    }
    return { data: results };
  }

  /**
   * 查询资源统计信息
   * @param {string} guest 云主机ID
   * @param {StatisticRange} range 统计范围
   * @returns {Promise<BackendResult<ResourceStatisticUnit[]>>} 资源统计单元列表
   */
  public async queryResourceStatistic(
    guest: string,
    range: StatisticRange
  ): Promise<BackendResult<ResourceStatisticUnit[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryResourceStatistic,
      query_resource_statistic: {
        guest: guest,
        range: range,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询资源统计信息失败" };
    }
    const payload = resp.data.resource_statistic || [];
    const { results, error } = unmarshalResourceStatistics(payload);
    if (error) {
      return { error: error };
    }
    return { data: results };
  }

  /**
   * 查询计算节点
   * @param {string} poolID 池ID
   * @returns {Promise<BackendResult<ClusterNodeData[]>>} 集群节点数据列表
   */
  public async queryComputeNodes(
    poolID: string
  ): Promise<BackendResult<ClusterNodeData[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryComputeNodes,
      query_compute_nodes: {
        pool_id: poolID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询计算节点失败" };
    }
    return { data: resp.data.cluster_nodes || [] };
  }

  /**
   * 查询节点使用情况
   * @param {string[]} targets 目标列表
   * @returns {Promise<BackendResult<NodeResourceSnapshot[]>>} 节点资源快照列表
   */
  public async queryNodesUsage(
    targets: string[]
  ): Promise<BackendResult<NodeResourceSnapshot[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryNodesUsage,
      query_nodes_usage: {
        targets: targets,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询节点使用情况失败" };
    }
    const payload = resp.data.node_snapshots || [];
    const { results, error } = unmarshalNodesResourceUsage(payload);
    if (error) {
      return { error: error };
    }
    return { data: results };
  }

  /**
   * 查询池使用情况
   * @param {string[]} targets 目标列表
   * @returns {Promise<BackendResult<PoolResourceSnapshot[]>>} 池资源快照列表
   */
  public async queryPoolsUsage(
    targets: string[]
  ): Promise<BackendResult<PoolResourceSnapshot[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryPoolsUsage,
      query_pools_usage: {
        targets: targets,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询池使用情况失败" };
    }
    const payload = resp.data.pool_snapshots || [];
    const { results, error } = unmarshalPoolsResourceUsage(payload);
    if (error) {
      return { error: error };
    }
    return { data: results };
  }

  /**
   * 查询集群使用情况
   * @returns {Promise<BackendResult<ClusterResourceSnapshot>>} 集群资源快照
   */
  public async queryClusterUsage(): Promise<
    BackendResult<ClusterResourceSnapshot>
  > {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryClusterUsage,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.cluster_snapshot) {
      return { error: "查询集群使用情况失败" };
    }
    const payload = resp.data.cluster_snapshot;
    const { results, error } = unmarshalClusterResourceUsage(payload);
    if (error) {
      return { error: error };
    }
    if (!results) {
      return { error: "没有有效数据" };
    }
    return { data: results };
  }

  /**
   * 查询系统模板
   * @param {number} offset 起始位置
   * @param {number} pageSize 页面大小
   * @param {boolean} onlySelf 是否只查询当前用户的系统模板
   * @returns {Promise<BackendResult<GuestSystemView[]>>} 系统模板视图列表
   */
  public async querySystems(
    offset: number,
    pageSize: number,
    onlySelf: boolean = false
  ): Promise<BackendResult<PaginationResult<GuestSystemView>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QuerySystems,
      query_systems: {
        offset,
        limit: pageSize,
        only_self: onlySelf,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 获取系统模板
   * @param {string} systemID 系统ID
   * @returns {Promise<BackendResult<GuestSystemView>>} 系统模板视图
   */
  public async getSystem(
    systemID: string
  ): Promise<BackendResult<GuestSystemView>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetSystem,
      get_system: {
        id: systemID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.system) {
      return { error: "查询系统模板失败" };
    }
    return { data: resp.data.system };
  }

  /**
   * 添加系统模板
   * @param {string} label 标签
   * @param {GuestSystemSpec} spec 系统规格
   * @param {ResourceAccessLevel} access_level 资源访问级别
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addSystem(
    label: string,
    spec: GuestSystemSpec,
    access_level: ResourceAccessLevel
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddSystem,
      add_system: {
        label,
        spec,
        access_level: access_level,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改系统模板
   * @param {string} systemID 系统ID
   * @param {string} label 标签
   * @param {GuestSystemSpec} spec 系统规格
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifySystem(
    systemID: string,
    label: string,
    spec: GuestSystemSpec
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifySystem,
      modify_system: {
        id: systemID,
        label: label,
        spec: spec,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除系统模板
   * @param {string} id 系统ID
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeSystem(id: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveSystem,
      remove_system: {
        id,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 重置系统模板
   * @returns {Promise<BackendResult>} 重置结果
   */
  public async resetSystems(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ResetSystems,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询日志
   * @param {string} date 日期,"yyyy-MM-dd"
   * @param {number} [offset] 偏移量
   * @param {number} [limit] 限制数量
   * @returns {Promise<BackendResult<PaginationResult<ConsoleEvent>>>} 日志分页结果
   */
  public async queryLogs(
    date: string,
    offset?: number,
    limit?: number
  ): Promise<BackendResult<PaginationResult<ConsoleEvent>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryLogs,
      query_logs: {
        date,
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 查询警告
   * @param {ConsoleEventLevel} [level] 警告级别
   * @param {boolean} [unread_only] 是否只查询未读
   * @param {number} [offset] 偏移量
   * @param {number} [limit] 限制数量
   * @returns {Promise<BackendResult<WarningRecordSet>>} 警告记录集
   */
  public async queryWarnings(
    level?: ConsoleEventLevel,
    unread_only?: boolean,
    offset?: number,
    limit?: number
  ): Promise<BackendResult<WarningRecordSet>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryWarnings,
      query_warnings: {
        level,
        unread_only,
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 统计节点警告数量
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
   */
  public async countWarnings(
    nodeID: string
  ): Promise<BackendResult<WarningStatistic>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CountWarnings,
      count_warnings: {
        node_id: nodeID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 统计多个节点警告总数
   * @param {string[]} nodeList 节点列表
   * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
   */
  public async sumWarnings(
    nodeList: string[]
  ): Promise<BackendResult<WarningStatistic>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SumWarnings,
      sum_warnings: {
        node_list: nodeList,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 删除警告
   * @param {string[]} idList 警告ID列表
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeWarnings(idList: string[]): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveWarnings,
      remove_warnings: {
        id_list: idList,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 清除所有警告
   * @returns {Promise<BackendResult>} 清除结果
   */
  public async clearWarnings(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ClearWarnings,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 标记警告为已读
   * @param {string[]} idList 警告ID列表
   * @returns {Promise<BackendResult>} 标记结果
   */
  public async markWarningsAsRead(idList: string[]): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.MarkWarningsAsRead,
      mark_warnings_as_read: {
        id_list: idList,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 标记所有警告为已读
   * @returns {Promise<BackendResult>} 标记结果
   */
  public async markAllWarningsAsRead(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.MarkAllWarningsAsRead,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 标记所有警告为未读
   * @returns {Promise<BackendResult>} 标记结果
   */
  public async markAllWarningsAsUnread(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.MarkAllWarningsAsUnread,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 统计未读警告数量
   * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
   */
  public async countUnreadWarnings(): Promise<BackendResult<WarningStatistic>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.CountUnreadWarnings,
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改节点配置
   * @param {string} nodeID 节点ID
   * @param {NodeConfig} config 节点配置
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyConfig(
    nodeID: string,
    config: NodeConfig
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyConfig,
      modify_config: {
        node_id: nodeID,
        config: config,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取节点配置
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult<NodeConfigStatus>>} 节点配置状态
   */
  public async getConfig(
    nodeID: string
  ): Promise<BackendResult<NodeConfigStatus>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetConfig,
      get_config: {
        node_id: nodeID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.config) {
      return { error: "Configuration not found" };
    }
    return { data: resp.data.config };
  }

  /**
   * 重启服务
   * @param {string} nodeID 节点ID
   * @returns {Promise<BackendResult>} 重启结果
   */
  public async restartService(nodeID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RestartService,
      restart_service: {
        node_id: nodeID,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加SSH密钥
   * @param {string} label 标签
   * @param {string} content 密钥内容
   * @param {ResourceAccessLevel} access_level 资源访问级别
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addSSHKey(
    label: string,
    content: string,
    access_level: ResourceAccessLevel
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddSSHKey,
      add_ssh_key: {
        label,
        content,
        access_level: access_level,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除SSH密钥
   * @param {string} id 密钥ID
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeSSHKey(id: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveSSHKey,
      remove_ssh_key: {
        id,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询SSH密钥
   * @param {number} offset 偏移量
   * @param {number} pageSize 页面大小
   * @returns {Promise<BackendResult<SSHKeyView[]>>} SSH密钥视图列表
   */
  public async querySSHKeys(
    offset: number,
    pageSize: number,
    onlySelf: boolean = false
  ): Promise<BackendResult<PaginationResult<SSHKeyView>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QuerySSHKeys,
      query_ssh_keys: {
        offset,
        limit: pageSize,
        only_self: onlySelf,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 获取已激活的许可证
   * @returns {Promise<BackendResult<License>>} 许可证信息
   */
  public async getActivatedLicense(): Promise<BackendResult<License>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetActivatedLicense,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.license) {
      return { error: "没有激活的许可证" };
    }
    return { data: resp.data.license };
  }

  /**
   * 激活许可证
   * @param {string} licenseID 许可证ID
   * @returns {Promise<BackendResult>} 激活结果
   */
  public async activateLicense(licenseID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ActiveLicense,
      active_license: {
        id: licenseID,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加许可证
   * @param {License} license 许可证信息
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addLicense(license: License): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddLicense,
      add_license: {
        license: license,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除许可证
   * @param {string} licenseID 许可证ID
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeLicense(licenseID: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveLicense,
      remove_license: {
        id: licenseID,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取许可证
   * @param {string} licenseID 许可证ID
   * @returns {Promise<BackendResult<License>>} 许可证信息
   */
  public async getLicense(licenseID: string): Promise<BackendResult<License>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetLicense,
      get_license: {
        id: licenseID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.license) {
      return { error: "License not found" };
    }
    return { data: resp.data.license };
  }

  /**
   * 查询所有许可证
   * @returns {Promise<BackendResult<LicenseRecord[]>>} 许可证记录列表
   * @throws 查询许可证失败
   */
  public async queryLicenses(): Promise<BackendResult<LicenseRecord[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryLicenses,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询许可证失败" };
    }
    return { data: resp.data.licenses || [] };
  }

  /**
   * 查询集群状态
   * @returns {Promise<BackendResult<ClusterStatus>>} 集群状态
   */
  public async queryClusterStatus(): Promise<BackendResult<ClusterStatus>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryClusterStatus,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.cluster_status) {
      return { error: "无法获取集群状态" };
    }
    return { data: resp.data.cluster_status };
  }

  /**
   * 查询网络拓扑图
   * @returns {Promise<BackendResult<NetworkGraphNode[]>>} 网络拓扑节点列表
   */
  public async queryNetworkGraph(): Promise<BackendResult<NetworkGraphNode[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryNetworkGraph,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.network_graph) {
      return { error: "无法获取网络拓扑图" };
    }
    return { data: resp.data.network_graph };
  }

  /**
   * 获取监控规则
   * @returns {Promise<BackendResult<ResourceMonitorConfig>>} 资源监控配置
   */
  public async getMonitorRules(): Promise<
    BackendResult<ResourceMonitorConfig>
  > {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetMonitorRules,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.monitor_rules) {
      return { error: "无法获取监控规则" };
    }
    return { data: resp.data.monitor_rules };
  }

  /**
   * 设置监控规则
   * @param {ResourceMonitorConfig} rules 资源监控配置
   * @returns {Promise<BackendResult>} 设置结果
   */
  public async setMonitorRules(
    rules: ResourceMonitorConfig
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SetMonitorRules,
      set_monitor_rules: {
        config: rules,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 尝试重新加载资源节点存储
   * @param {string} nodeID 节点ID
   * @param {string} poolID 节点存储标识
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryReloadResourceStorage(
    nodeID: string,
    poolID: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ReloadResourceStorage,
      reload_resource_storage: {
        node_id: nodeID,
        pool_id: poolID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data?.id) {
      return { error: "Failed to reload resource storage" };
    }
    return { data: resp.data.id };
  }

  /**
   * 更新磁盘卷大小
   * @param {string} fileID 文件ID
   * @param {number} sizeInMB 大小（MB）
   * @returns {Promise<BackendResult>} 更新结果
   */
  public async updateDiskVolumeSize(
    fileID: string,
    sizeInMB: number
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.UpdateDiskVolumeSize,
      update_disk_volume_size: {
        id: fileID,
        size: sizeInMB,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 重置监控规则
   * @returns {Promise<BackendResult>} 重置结果
   */
  public async resetMonitorRules(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ResetMonitorRules,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 清除任务
   * @returns {Promise<BackendResult>} 清除结果
   */
  public async clearTasks(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ClearTasks,
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 添加导入源
   * @param {ImportVendor} vendor 供应商类型
   * @param {string} url 导入源URL
   * @param {string} token 认证token
   * @param {string} secret 认证secret
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addImportSource(
    vendor: ImportVendor,
    url: string,
    token: string,
    secret: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddImportSource,
      add_import_source: {
        vendor,
        url,
        token,
        secret,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改导入源
   * @param {string} id 导入源ID
   * @param {string} url 导入源URL
   * @param {string} token 认证token
   * @param {string} secret 认证secret
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyImportSource(
    id: string,
    url: string,
    token: string,
    secret: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyImportSource,
      modify_import_source: {
        id,
        url,
        token,
        secret,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除导入源
   * @param {string} id 导入源ID
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeImportSource(id: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveImportSource,
      remove_import_source: {
        id,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询导入源
   * @param {number} start 起始索引
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<ImportSource>>>} 导入源分页结果
   */
  public async queryImportSources(
    start: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<ImportSource>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryImportSources,
      query_import_sources: {
        start,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 查询导入目标
   * @param {string} sourceID 导入源ID
   * @returns {Promise<BackendResult<ImportTarget[]>>} 导入目标列表
   */
  public async queryImportTargets(
    sourceID: string
  ): Promise<BackendResult<ImportTarget[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryImportTargets,
      query_import_targets: {
        source: sourceID,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "无法获取导入目标" };
    }
    return {
      data: resp.data.import_targets || [],
    };
  }

  /**
   * 尝试导入云主机到节点
   * @param {string} sourceID 导入源ID
   * @param {string[]} targetIDs 目标云主机ID列表
   * @param {string} targetNode 目标节点ID
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryImportGuestsToNode(
    sourceID: string,
    targetIDs: string[],
    targetNode: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ImportGuests,
      import_guests: {
        source: sourceID,
        guests: targetIDs,
        to_node: targetNode,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "尝试导入云主机失败" };
    }
    return {
      data: resp.data.id,
    };
  }

  /**
   * 尝试迁移云主机到节点
   * @param {string} targetNode 目标节点ID
   * @param {string[]} guests 云主机ID列表
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryMigrateToNode(
    targetNode: string,
    guests: string[]
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.MigrateToNode,
      migrate_to_node: {
        target_node: targetNode,
        guests: guests,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "尝试迁移云主机失败" };
    }
    return {
      data: resp.data.id,
    };
  }

  /**
   * 尝试修改外部接口MAC地址
   * @param {string} guestID 云主机ID
   * @param {string} device 目标设备(当前MAC)
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryModifyExternalInterfaceMAC(
    guestID: string,
    device: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyExternalInterfaceMAC,
      modify_external_interface_mac: {
        guest: guestID,
        device: device,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "尝试修改外部接口MAC地址失败" };
    }
    return {
      data: resp.data.id,
    };
  }

  /**
   * 修改外部接口MAC地址
   * @param {string} guestID 云主机ID
   * @param {string} device 目标设备(当前MAC)
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyExternalInterfaceMAC(
    guestID: string,
    device: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const resp = await this.tryModifyExternalInterfaceMAC(
      guestID,
      device,
      macAddress
    );
    if (resp.error) {
      return { error: resp.error };
    }
    const taskData = await this.waitTask(resp.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 尝试修改内部接口MAC地址
   * @param {string} guestID 云主机ID
   * @param {string} device 目标设备(当前MAC)
   * @param {string} macAddress MAC地址
   * @returns {Promise<BackendResult<string>>} 任务ID
   */
  public async tryModifyInternalInterfaceMAC(
    guestID: string,
    device: string,
    macAddress: string
  ): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyInternalInterfaceMAC,
      modify_internal_interface_mac: {
        guest: guestID,
        device: device,
        mac_address: macAddress,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "尝试修改内部接口MAC地址失败" };
    }
    return {
      data: resp.data.id,
    };
  }

  /**
   * 修改内部接口MAC地址
   * @param {string} guestID 云主机ID
   * @param {string} device 目标设备(当前MAC)
   * @param {string} macAddress MAC地址
   * @param {number} timeoutSeconds 超时时间（秒），默认300秒
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyInternalInterfaceMAC(
    guestID: string,
    device: string,
    macAddress: string,
    timeoutSeconds: number = 300
  ): Promise<BackendResult> {
    const resp = await this.tryModifyInternalInterfaceMAC(
      guestID,
      device,
      macAddress
    );
    if (resp.error) {
      return { error: resp.error };
    }
    const taskData = await this.waitTask(resp.data!, timeoutSeconds);
    if (taskData.error) {
      return { error: taskData.error };
    }
    return {};
  }

  /**
   * 查询用户角色
   * @returns {Promise<BackendResult<UserRole[]>>} 用户角色列表
   */
  public async queryUserRoles(): Promise<BackendResult<UserRole[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryUserRoles,
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "查询用户角色失败" };
    }
    return {
      data: resp.data.user_roles || [],
    };
  }

  /**
   * 修改用户组角色
   * @param {string} group 用户组
   * @param {UserRole[]} roles 角色列表
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async modifyGroupRoles(
    group: string,
    roles: UserRole[]
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ModifyGroupRoles,
      modify_group_roles: {
        group,
        roles,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取用户组角色
   * @param {string} group 用户组
   * @returns {Promise<BackendResult<UserRole[]>>} 用户角色列表
   */
  public async getGroupRoles(
    group: string
  ): Promise<BackendResult<UserRole[]>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetGroupRoles,
      get_group_roles: {
        group,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "获取用户组角色失败" };
    }
    return {
      data: resp.data.user_roles || [],
    };
  }

  /**
   * 查询用户组成员
   * @param {string} group 用户组
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<string>>>} 用户组成员分页结果
   */
  public async queryGroupMembers(
    group: string,
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<string>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryGroupMembers,
      query_group_members: {
        group,
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加用户组
   * @param {UserGroup} group 用户组
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addGroup(group: UserGroup): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddGroup,
      add_group: {
        group,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除用户组
   * @param {string} group 用户组
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeGroup(group: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveGroup,
      remove_group: {
        group,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询用户组
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<UserGroupRecord>>>} 用户组分页结果
   */
  public async queryGroups(
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<UserGroupRecord>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryGroups,
      query_groups: {
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加用户
   * @param {string} user 用户名
   * @param {string} group 用户组
   * @param {string} password 密码
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addUser(
    user: string,
    group: string,
    password: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddUser,
      add_user: {
        user,
        group,
        password,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 删除用户
   * @param {string} userId 用户ID
   * @returns {Promise<BackendResult>} 删除结果
   */
  public async removeUser(userId: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveUser,
      remove_user: {
        user: userId,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询用户
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<UserCredentialRecord>>>} 用户分页结果
   */
  public async queryUsers(
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<UserCredentialRecord>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryUsers,
      query_users: {
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 修改用户组
   * @param {string} userId 用户ID
   * @param {string} groupId 用户组ID
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async changeUserGroup(
    userId: string,
    groupId: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ChangeUserGroup,
      change_user_group: {
        user: userId,
        group: groupId,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询用户令牌
   * @param {string} user 用户名
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<UserToken>>>} 用户令牌分页结果
   */
  public async queryUserTokens(
    user: string,
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<UserToken>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryUserTokens,
      query_user_tokens: {
        user,
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 撤销用户令牌
   * @param {string} user 用户名
   * @param {string} serial 序列号
   * @returns {Promise<BackendResult>} 撤销结果
   */
  public async revokeUserToken(
    user: string,
    serial: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RevokeUserToken,
      revoke_user_token: {
        user,
        serial,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 修改用户密码
   * @param {string} user 用户名
   * @param {string} password 新密码
   * @returns {Promise<BackendResult>} 修改结果
   */
  public async changeUserSecret(
    user: string,
    password: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ChangeUserSecret,
      change_user_secret: {
        user,
        password,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 重置用户密码
   * @param {string} user 用户名
   * @returns {Promise<BackendResult<string>>} 新密码
   */
  public async resetUserSecret(user: string): Promise<BackendResult<string>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.ResetUserSecret,
      reset_user_secret: {
        user,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data || !resp.data.password) {
      return { error: "重置用户密码失败" };
    }
    return { data: resp.data.password };
  }

  /**
   * 撤销访问权限
   * @param {string} token 令牌
   * @returns {Promise<BackendResult>} 撤销结果
   */
  public async revokeAccess(token: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RevokeAccess,
      revoke_access: {
        token,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 使访问权限失效
   * @param {string} token 令牌
   * @returns {Promise<BackendResult>} 使访问权限失效结果
   */
  public async invalidateAccess(token: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.InvalidateAccess,
      invalidate_access: {
        token,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询访问记录
   * @param {string} user 用户名
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<UserAccessRecord>>>} 访问记录分页结果
   */
  public async queryAccesses(
    user: string,
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<UserAccessRecord>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryAccesses,
      query_accesses: {
        user,
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 添加白名单
   * @param {string} address 白名单地址
   * @returns {Promise<BackendResult>} 添加结果
   */
  public async addWhiteList(address: string): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.AddWhiteList,
      add_white_list: {
        address,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 移除白名单
   * @param {number} index 白名单索引
   * @returns {Promise<BackendResult>} 移除结果
   */
  public async removeWhiteList(index: number): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.RemoveWhiteList,
      remove_white_list: {
        index,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 更新白名单
   * @param {number} index 白名单索引
   * @param {string} address 新的白名单地址
   * @returns {Promise<BackendResult>} 更新结果
   */
  public async updateWhiteList(
    index: number,
    address: string
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.UpdateWhiteList,
      update_white_list: {
        index,
        address,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 查询白名单
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<string>>>} 白名单分页结果
   */
  public async queryWhiteList(
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<string>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryWhiteList,
      query_white_list: {
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }

  /**
   * 设置系统资源
   * @param {ResourceType} type 资源类型
   * @param {string} id 资源ID
   * @param {boolean} value 资源值
   * @returns {Promise<BackendResult>} 设置结果
   */
  public async setSystemResource(
    type: ResourceType,
    id: string,
    value: boolean
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SetSystemResource,
      set_system_resource: {
        type,
        id,
        value,
      },
    };
    return await this.sendCommand(cmd);
  }

  /**
   * 获取资源权限
   * @param {ResourceType} type 资源类型
   * @param {string} id 资源ID
   * @returns {Promise<BackendResult<ResourcePermissions>>} 资源权限结果
   */
  public async getResourcePermissions(
    type: ResourceType,
    id: string
  ): Promise<BackendResult<ResourcePermissions>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.GetResourcePermissions,
      get_resource_permissions: {
        type,
        id,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
    if (resp.error) {
      return { error: resp.error };
    }
    if (!resp.data) {
      return { error: "获取资源权限失败" };
    }
    return {
      data: resp.data.resource_permissions,
    };
  }

  /**
   * 设置资源权限
   * @param {ResourceType} type 资源类型
   * @param {string} id 资源ID
   * @param {ResourcePermissions} permissions 资源权限
   * @returns {Promise<BackendResult>} 设置结果
   */
  public async setResourcePermissions(
    type: ResourceType,
    id: string,
    permissions: ResourcePermissions
  ): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.SetResourcePermissions,
      set_resource_permissions: {
        type,
        id,
        permissions,
      },
    };
    return await this.sendCommand(cmd);
  }
  /**
   * 检查是否可以创建更多云主机
   * @returns {Promise<boolean>} 是否可以创建更多云主机
   */
  public async couldHasMoreGuests(): Promise<boolean> {
    const [licenseResult, statusResult] = await Promise.all([
      this.getActivatedLicense(),
      this.queryClusterStatus(),
    ]);

    if (
      licenseResult.error ||
      !licenseResult.data ||
      statusResult.error ||
      !statusResult.data
    ) {
      return false;
    }

    return licenseResult.data.guests > statusResult.data.guests;
  }

  /**
   * 检查是否可以添加更多节点
   * @returns {Promise<boolean>} 是否可以添加更多节点
   */
  public async couldHasMoreNodes(): Promise<boolean> {
    const [licenseResult, statusResult] = await Promise.all([
      this.getActivatedLicense(),
      this.queryClusterStatus(),
    ]);

    if (
      licenseResult.error ||
      !licenseResult.data ||
      statusResult.error ||
      !statusResult.data
    ) {
      return false;
    }

    return licenseResult.data.nodes > statusResult.data.nodes;
  }

  /**
   * 检查指定功能是否已启用
   * @param {LicenseFeature} feature 要检查的功能
   * @returns {Promise<boolean>} 功能是否已启用
   */
  public async isFeatureEnabled(feature: LicenseFeature): Promise<boolean> {
    const licenseResult = await this.getActivatedLicense();
    if (licenseResult.error || !licenseResult.data) {
      return false;
    }
    if (!licenseResult.data.features) {
      return false;
    }

    return licenseResult.data.features.includes(feature);
  }

  /**
   * 获取所有SSH密钥
   * @returns {Promise<BackendResult<SSHKeyView[]>>} SSH密钥列表
   */
  public async fetchAllSSHKeys(): Promise<BackendResult<SSHKeyView[]>> {
    const pageSize = 100;
    let offset = 0;
    const allSSHKeys: SSHKeyView[] = [];

    // 首次查询获取总数
    const firstResult = await this.querySSHKeys(offset, pageSize);
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
      const result = await this.querySSHKeys(offset, pageSize);
      if (result.error) {
        return { error: result.error };
      }
      if (result.data && result.data.records) {
        allSSHKeys.push(...result.data.records);
      }
    }

    return { data: allSSHKeys };
  }

  /**
   * 获取所有系统模板
   * @returns {Promise<BackendResult<GuestSystemView[]>>} 系统列表
   */
  public async fetchAllSystems(): Promise<BackendResult<GuestSystemView[]>> {
    const pageSize = 100;
    let offset = 0;
    const allSystems: GuestSystemView[] = [];

    // 首次查询获取总数
    const firstResult = await this.querySystems(offset, pageSize);
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
      const result = await this.querySystems(offset, pageSize);
      if (result.error) {
        return { error: result.error };
      }
      if (result.data && result.data.records) {
        allSystems.push(...result.data.records);
      }
    }

    return { data: allSystems };
  }
  /**
   * 注销设备
   * @returns {Promise<BackendResult>} 注销结果
   */
  public async logoutDevice(): Promise<BackendResult> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.LogoutDevice,
    };
    const result = await this.sendCommand(cmd);
    if (result.error) {
      return { error: result.error };
    }
    this._authenticated = false;
    this._user = "";
    this._roles = [];
    this.stopHeartBeat();
    return result;
  }
  /**
   * 查询当前用户已登录设备列表
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<BackendResult<PaginationResult<UserAccessRecord>>>} 设备列表
   */
  public async queryDevices(
    offset: number,
    limit: number
  ): Promise<BackendResult<PaginationResult<UserAccessRecord>>> {
    const cmd: ControlCommandRequest = {
      type: controlCommandEnum.QueryDevices,
      query_devices: {
        offset,
        limit,
      },
    };
    const resp = await this.requestCommandResponse(cmd);
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
  }
}
