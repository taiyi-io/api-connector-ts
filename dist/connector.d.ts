/**
 * 核心文件，定义用于访问平台服务的TaiyiConnector
 */
import { ConsoleEventLevel, ImportVendor, ComputePoolStrategy, InterfaceMode, UserRole, VolumeContainerStrategy, StatisticRange, ResourceType, ResourceAccessLevel, LicenseFeature } from "./enums";
import { ControlCommandRequest } from "./request-params";
import { AddressPool, AddressPoolRecord, AllocatedTokens, BackendResult, ClusterNode, ClusterNodeData, ClusterStatus, ComputePoolConfig, ComputePoolStatus, ConsoleEvent, FileSpec, FileStatus, FileView, GuestConfig, GuestFilter, GuestView, ImportSource, ImportTarget, License, LicenseRecord, NetworkGraphNode, NodeConfig, NodeConfigStatus, PaginationResult, ResourceMonitorConfig, SSHKeyView, StoragePool, StoragePoolConfig, StoragePoolListRecord, SystemStatus, TaskData, UserAccessRecord, UserCredentialRecord, UserGroup, UserGroupRecord, UserToken, VolumeContainer, VolumeSpec, MonitorResponse, SnapshotTreeNode, ResourcePermissions, SnapshotRecord, GuestResourceUsageData, ResourceStatisticUnit, NodeResourceSnapshot, PoolResourceSnapshot, ClusterResourceSnapshot, GuestSystemView, GuestSystemSpec, DataStore, WarningRecordSet, WarningStatistic } from "./data-defines";
export type SetTokenHandler = (storeID: string, tokens: AllocatedTokens) => Promise<void>;
export type GetTokenHandler = (storeID: string) => Promise<AllocatedTokens>;
export type StateChangeHandler = (storeID: string, authenticated: boolean) => void;
export type AuthExpiredEvent = (connectorID: string) => void;
/**
 * 连接处理，提供了与Taiyi Control服务进行交互的方法，包括认证、发送命令、查询访问记录等。
 * 系统状态查询与初始化接口可以直接调用，其他接口需要先认证才能调用。
 * @class TaiyiConnector
 */
export declare class TaiyiConnector {
    private _id;
    private _backendURL;
    private _authMethod;
    private _privateKey;
    private _user;
    private _device;
    private _serial;
    private _password;
    private _signatureAlgorithm;
    private _refreshTimer;
    private _locale;
    private _authenticated;
    private _authenticatedTokens;
    private _callbackReceiver;
    private _setTokens;
    private _getTokens;
    private _stateChange;
    private _onAuthExpired;
    private _roles;
    private _keepAlive;
    /**
     * 构造函数
     * @param {string} backendHost 后端Control服务地址
     * @param {number} backendPort 后端Control服务端口
     * @param {string} device 设备标识
     */
    constructor(backendHost: string, backendPort: number | undefined, device: string);
    /**
     * 释放资源
     */
    release(): void;
    /**
     * 获取连接标识
     * @returns {string} 连接标识
     */
    get id(): string;
    /**
     * 获取认证状态
     * @returns {boolean} 认证状态
     */
    get authenticated(): boolean;
    /**
     * 获取用户标识
     * @returns {string} 用户标识
     */
    get user(): string;
    /**
     * 获取用户角色
     * @returns {UserRole[]} 用户角色
     */
    get roles(): UserRole[];
    /**
     * 绑定令牌更新回调
     * @param {string} receiver 接受者标识
     * @param {SetTokenHandler} setter 令牌更新回调
     * @param {GetTokenHandler} getter 令牌获取回调
     * @param {StateChangeHandler} stateChange 状态变更回调
     */
    bindCallback(receiver: string, setter: SetTokenHandler, getter: GetTokenHandler, stateChange?: StateChangeHandler): void;
    /**
     * 绑定认证过期事件
     * @param {AuthExpiredEvent} callback 认证过期事件回调
     */
    bindAuthExpiredEvent(callback: AuthExpiredEvent): void;
    /**
     * 检查用户是否具有指定角色
     * @param {UserRole} role 角色
     * @returns {boolean} 是否具有角色
     */
    hasRole(role: UserRole): boolean;
    /**
     * 密码认证
     * @param {string} user 用户标识
     * @param {string} password 密码
     * @returns {Promise<BackendResult<AllocatedTokens>>} 已认证令牌
     */
    authenticateByPassword(user: string, password: string): Promise<BackendResult<AllocatedTokens>>;
    /**
     * 使用秘钥字符串校验
     * @param {string} token 秘钥字符串
     * @returns {Promise<BackendResult<AllocatedTokens>>} 已认证令牌
     */
    authenticateByToken(token: string): Promise<BackendResult<AllocatedTokens>>;
    /**
     * 令牌更新回调
     * @param {AllocatedTokens} tokens 已分配令牌
     * @returns {Promise<void>} 无返回值
     */
    private onTokenUpdated;
    /**
     * 刷新令牌
     * @returns {Promise<BackendResult>} 刷新结果
     */
    private refreshToken;
    /**
     * 直接加载令牌，初始化校验状态
     * @param {AllocatedTokens} tokens 令牌
     * @returns {BackendResult} 加载结果
     */
    loadTokens(tokens: AllocatedTokens): BackendResult;
    /**
     * 计划刷新令牌,访问令牌过期时间提前90秒，自动触发刷新令牌
     */
    startHeartBeat(): void;
    private keepAlive;
    /**
     * 停止刷新令牌，调用此方法后，令牌将不再自动刷新
     */
    private stopHeartBeat;
    /**
     * 校验令牌过期。 校验令牌是否过期，过期则触发刷新令牌
     */
    private onValidationExpired;
    /**
     * 校验令牌
     * @param {AllocatedTokens} tokens 分配到的领导
     * @returns {string} 非空则为错误信息
     */
    private validateTokens;
    /**
     * 发送控制命令，获取响应内容
     * @param {ControlCommandRequest} cmd 控制命令请求
     * @returns {Promise<BackendResult<ControlCommandResponse>>} 控制命令响应
     */
    private requestCommandResponse;
    /**
     * 重发指令
     * @param {ControlCommandRequest} cmd 请求指令
     * @returns {Promise<BackendResult<ControlCommandResponse>>} 请求响应
     */
    private resendCommand;
    /**
     * 同步令牌。从存储中获取令牌，更新本地令牌
     * @returns {Promise<boolean>} 是否令牌已更新
     */
    private syncTokens;
    /**
     * 发送控制命令
     * @param {ControlCommandRequest} cmd 控制命令请求
     * @returns {Promise<BackendResult>} 控制命令响应
     */
    private sendCommand;
    /**
     * 启动任务，发送控制命令，返回任务ID
     * @param {ControlCommandRequest} cmd 控制命令请求
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    startTask(cmd: ControlCommandRequest): Promise<BackendResult<string>>;
    /**
     * 执行任务，发送控制命令，等待任务完成
     * @param {ControlCommandRequest} cmd 控制命令请求
     * @param {number} timeoutSeconds 超时时间（秒），默认5分钟
     * @param {number} intervalSeconds 检查间隔（秒），默认1秒
     * @returns {Promise<TaskData>} 任务数据
     */
    executeTask(cmd: ControlCommandRequest, timeoutSeconds?: number, intervalSeconds?: number): Promise<BackendResult<TaskData>>;
    /**
     * 获取任务详情
     * @param {string} taskID 任务ID
     * @returns {Promise<BackendResult<TaskData>>} 任务数据
     */
    getTask(taskID: string): Promise<BackendResult<TaskData>>;
    /**
     * 等待任务完成
     * @param taskID 任务ID
     * @param timeoutSeconds 超时时间（秒）
     * @param intervalSeconds 检查间隔（秒）
     * @returns {Promise<BackendResult<TaskData>>} 任务数据
     */
    waitTask(taskID: string, timeoutSeconds?: number, intervalSeconds?: number): Promise<BackendResult<TaskData>>;
    /**
     * 获取系统状态
     * @returns {Promise<BackendResult<SystemStatus>>} 系统状态
     */
    getSystemStatus(): Promise<BackendResult<SystemStatus>>;
    /**
     * 初始化系统
     * @param {string} user 用户标识
     * @param {string} password 密码
     */
    initializeSystem(user: string, password: string): Promise<BackendResult>;
    /**
     * 生成用户令牌
     * @param {string} user 用户标识
     * @param {string} description 描述
     * @param {number} expireInMonths 过期时间（月）
     * @returns {Promise<BackendResult<string>>} 用户令牌
     */
    generateUserToken(user: string, description?: string, expireInMonths?: number): Promise<BackendResult<string>>;
    /**
     * 尝试创建云主机，成功返回任务ID
     * @param {string} poolID 计算资源池
     * @param {string} system 目标系统
     * @param {GuestConfig} config 云主机配置
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryCreateGuest(poolID: string, system: string, config: GuestConfig): Promise<BackendResult<string>>;
    /**
     * 创建云主机，成功返回云主机ID
     * @param {string} poolID 计算资源池
     * @param {string}system 目标系统
     * @param {GuestConfig} config 云主机配置
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult<string>>} 云主机ID
     */
    createGuest(poolID: string, system: string, config: GuestConfig, timeoutSeconds?: number): Promise<BackendResult<string>>;
    /**
     * 尝试删除云主机，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryDeleteGuest(guestID: string): Promise<BackendResult<string>>;
    /**
     * 删除云主机
     * @param {string} guestID 云主机ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 删除结果
     */
    deleteGuest(guestID: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 获取云主机详情
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<GuestView>>} 云主机详情
     */
    getGuest(guestID: string): Promise<BackendResult<GuestView>>;
    /**
     * 尝试启动云主机，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} [media] ISO镜像ID（可选）
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryStartGuest(guestID: string, media?: string): Promise<BackendResult<string>>;
    /**
     * 启动云主机
     * @param {string} guestID 云主机ID
     * @param {string?} media ISO镜像ID（可选）
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 启动结果
     */
    startGuest(guestID: string, media?: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试停止云主机，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {boolean} reboot 是否重启云主机
     * @param {boolean} force 是否强制执行
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryStopGuest(guestID: string, reboot: boolean, force: boolean): Promise<BackendResult<string>>;
    /**
     * 停止云主机
     * @param {string} guestID 云主机ID
     * @param {boolean} reboot 是否重启云主机
     * @param {boolean} force 是否强制执行
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 停止结果
     */
    stopGuest(guestID: string, reboot: boolean, force: boolean, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试添加卷，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {VolumeSpec} volume 磁盘卷配置
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryAddVolume(guestID: string, volume: VolumeSpec): Promise<BackendResult<string>>;
    /**
     * 添加卷
     * @param {string} guestID 云主机ID
     * @param {VolumeSpec} volume 磁盘卷配置
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 添加结果
     */
    addVolume(guestID: string, volume: VolumeSpec, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试删除卷，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} tag 卷标签
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryDeleteVolume(guestID: string, tag: string): Promise<BackendResult<string>>;
    /**
     * 删除卷
     * @param {string} guestID 云主机ID
     * @param {string} tag 卷标签
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 删除结果
     */
    deleteVolume(guestID: string, tag: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改云主机CPU，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {number} cores CPU核心数
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryModifyGuestCPU(guestID: string, cores: number): Promise<BackendResult<string>>;
    /**
     * 修改云主机CPU
     * @param {string} guestID 云主机ID
     * @param {number} cores CPU核心数
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyGuestCPU(guestID: string, cores: number, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 查询云主机
     * @param start 起始位置
     * @param limit 限制数量
     * @param filter 过滤条件
     * @returns {Promise<BackendResult<PaginationResult<GuestView>>>} 云主机列表
     */
    queryGuests(start: number, limit: number, filter?: GuestFilter): Promise<BackendResult<PaginationResult<GuestView>>>;
    /**
     * 尝试修改云主机内存，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {number} memoryMB 内存大小(MB)
     * @returns {Promise<BackendResult<string>>} 任务id
     */
    tryModifyGuestMemory(guestID: string, memoryMB: number): Promise<BackendResult<string>>;
    /**
     * 修改云主机内存
     * @param {string} guestID 云主机ID
     * @param {number} memoryMB 内存大小(MB)
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyGuestMemory(guestID: string, memoryMB: number, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改云主机主机名，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} hostname 主机名
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryModifyGuestHostname(guestID: string, hostname: string): Promise<BackendResult<string>>;
    /**
     * 修改云主机主机名
     * @param {string} guestID 云主机ID
     * @param {string} hostname 主机名
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyGuestHostname(guestID: string, hostname: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改密码，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} user 用户名
     * @param {string} password 新密码
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryModifyPassword(guestID: string, user: string, password: string): Promise<BackendResult<string>>;
    /**
     * 修改密码
     * @param {string} guestID 云主机ID
     * @param {string} user 用户名
     * @param {string} password 新密码
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyPassword(guestID: string, user: string, password: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改自动启动，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {boolean} enable 是否启用自动启动
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryModifyAutoStart(guestID: string, enable: boolean): Promise<BackendResult<string>>;
    /**
     * 修改自动启动
     * @param {string} guestID 云主机ID
     * @param {boolean} enable 是否启用自动启动
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyAutoStart(guestID: string, enable: boolean, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试添加外部接口，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryAddExternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 添加外部接口
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 添加结果
     */
    addExternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试移除外部接口，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryRemoveExternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 移除外部接口
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 移除结果
     */
    removeExternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试添加内部接口，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryAddInternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 添加内部接口
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 添加结果
     */
    addInternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试移除内部接口，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryRemoveInternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 移除内部接口
     * @param {string} guestID 云主机ID
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 移除结果
     */
    removeInternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试重置监控，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<string>>} 包含任务id的结果
     */
    tryResetMonitor(guestID: string): Promise<BackendResult<string>>;
    /**
     * 重置监控
     * @param {string} guestID 云主机ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 重置结果
     */
    resetMonitor(guestID: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 查询任务
     * @param {number} offset 偏移量
     * @param {number} pageSize 每页大小
     * @returns {Promise<BackendResult<PaginationResult<TaskData>>>} 包含任务分页结果的结果
     */
    queryTasks(offset: number, pageSize: number): Promise<BackendResult<PaginationResult<TaskData>>>;
    /**
     * 添加节点
     * @param {ClusterNode} config 节点配置
     * @returns {Promise<BackendResult>} 操作结果
     */
    addNode(config: ClusterNode): Promise<BackendResult>;
    /**
     * 移除节点
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    removeNode(nodeID: string): Promise<BackendResult>;
    /**
     * 查询节点列表
     * @returns {Promise<BackendResult<ClusterNodeData[]>>} 节点数据列表
     */
    queryNodes(): Promise<BackendResult<ClusterNodeData[]>>;
    /**
     * 获取节点详情
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult<ClusterNodeData>>} 节点数据
     */
    getNode(nodeID: string): Promise<BackendResult<ClusterNodeData>>;
    /**
     * 启用节点
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    enableNode(nodeID: string): Promise<BackendResult>;
    /**
     * 禁用节点
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    disableNode(nodeID: string): Promise<BackendResult>;
    /**
     * 查询计算资源池
     * @returns {Promise<BackendResult<ComputePoolStatus[]>>} 计算资源池状态列表
     */
    queryComputePools(): Promise<BackendResult<ComputePoolStatus[]>>;
    /**
     * 获取计算资源池详情
     * @param {string} poolID 资源池ID
     * @returns {Promise<BackendResult<ComputePoolStatus>>} 计算资源池状态
     */
    getComputePool(poolID: string): Promise<BackendResult<ComputePoolStatus>>;
    /**
     * 添加计算资源池
     * @param {ComputePoolConfig} config 计算资源池配置
     * @returns {Promise<BackendResult>} 操作结果
     */
    addComputePool(config: ComputePoolConfig): Promise<BackendResult>;
    /**
     * 修改计算资源池
     * @param {ComputePoolConfig} config 计算资源池配置
     * @returns {Promise<BackendResult>} 操作结果
     */
    modifyComputePool(config: ComputePoolConfig): Promise<BackendResult>;
    /**
     * 删除计算资源池
     * @param {string} poolID 资源池ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    deleteComputePool(poolID: string): Promise<BackendResult>;
    /**
     * 添加计算节点到资源池
     * @param {string} poolID 资源池ID
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    addComputeNode(poolID: string, nodeID: string): Promise<BackendResult>;
    /**
     * 从资源池移除计算节点
     * @param {string} poolID 资源池ID
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    removeComputeNode(poolID: string, nodeID: string): Promise<BackendResult>;
    /**
     * 修改计算资源池策略
     * @param {string} poolID 资源池ID
     * @param {ComputePoolStrategy} strategy 资源池策略
     * @returns {Promise<BackendResult>} 操作结果
     */
    changeComputePoolStrategy(poolID: string, strategy: ComputePoolStrategy): Promise<BackendResult>;
    /**
     * 查询存储池列表
     * @returns {Promise<BackendResult<StoragePoolListRecord[]>>} 存储池列表
     */
    queryStoragePools(): Promise<BackendResult<StoragePoolListRecord[]>>;
    /**
     * 获取存储池详情
     * @param {string} poolID 存储池ID
     * @returns {Promise<BackendResult<StoragePool>>} 存储池详情
     */
    getStoragePool(poolID: string): Promise<BackendResult<StoragePool>>;
    /**
     * 添加存储池
     * @param {StoragePoolConfig} config 存储池配置
     * @returns {Promise<BackendResult>} 操作结果
     */
    addStoragePool(config: StoragePoolConfig): Promise<BackendResult>;
    /**
     * 删除存储池
     * @param {string} poolID 存储池ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    removeStoragePool(poolID: string): Promise<BackendResult>;
    /**
     * 修改远程存储策略
     * @param {string} poolID 存储池ID
     * @param {VolumeContainerStrategy} strategy 存储策略
     * @returns {Promise<BackendResult>} 操作结果
     */
    modifyRemoteStorageStrategy(poolID: string, strategy: VolumeContainerStrategy): Promise<BackendResult>;
    /**
     * 改变远程容器标志
     * @param {string} poolID 存储池ID
     * @param {number} index 容器索引
     * @param {boolean} enabled 是否启用
     * @returns {Promise<BackendResult>} 操作结果
     */
    changeRemoteContainerFlag(poolID: string, index: number, enabled: boolean): Promise<BackendResult>;
    /**
     * 尝试添加远程容器，成功返回任务ID
     * @param {string} poolID 存储池ID
     * @param {VolumeContainer} container 容器配置
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryAddRemoteContainer(poolID: string, container: VolumeContainer): Promise<BackendResult<string>>;
    /**
     * 添加远程容器
     * @param {string} poolID 存储池ID
     * @param {VolumeContainer} container 容器配置
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 操作结果
     */
    addRemoteContainer(poolID: string, container: VolumeContainer, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改远程容器，成功返回任务ID
     * @param {string} poolID 存储池ID
     * @param {number} index 容器索引
     * @param {VolumeContainer} container 容器配置
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryModifyRemoteContainer(poolID: string, index: number, container: VolumeContainer): Promise<BackendResult<string>>;
    /**
     * 修改远程容器
     * @param {string} poolID 存储池ID
     * @param {number} index 容器索引
     * @param {VolumeContainer} container 容器配置
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 操作结果
     */
    modifyRemoteContainer(poolID: string, index: number, container: VolumeContainer, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试删除远程容器，成功返回任务ID
     * @param {string} poolID 存储池ID
     * @param {number} index 容器索引
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryRemoveRemoteContainer(poolID: string, index: number): Promise<BackendResult<string>>;
    /**
     * 删除远程容器
     * @param {string} poolID 存储池ID
     * @param {number} index 容器索引
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 操作结果
     */
    removeRemoteContainer(poolID: string, index: number, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 查询地址池列表
     * @param {number} offset 起始位置
     * @param {number} limit 限制数量
     * @returns {Promise<BackendResult<PaginationResult<AddressPoolRecord>>>} 地址池列表
     * @deprecated 地址池相关接口全部会重新设计
     */
    queryAddressPools(offset: number, limit: number): Promise<BackendResult<PaginationResult<AddressPoolRecord>>>;
    /**
     * 获取地址池详情
     * @param {string} poolID 地址池ID
     * @returns {Promise<BackendResult<AddressPool>>} 地址池详情
     * @deprecated 地址池相关接口全部会重新设计
     */
    getAddressPool(poolID: string): Promise<BackendResult<AddressPool>>;
    /**
     * 添加地址池
     * @param {string} id 地址池ID
     * @param {InterfaceMode} mode 接口模式
     * @param {boolean} isV6 是否为IPv6
     * @param {string} [description] 描述
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addAddressPool(id: string, mode: InterfaceMode, isV6: boolean, description?: string): Promise<BackendResult>;
    /**
     * 修改地址池
     * @param {string} id 地址池ID
     * @param {InterfaceMode} mode 接口模式
     * @param {string} [description] 描述
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    modifyAddressPool(id: string, mode: InterfaceMode, description?: string): Promise<BackendResult>;
    /**
     * 删除地址池
     * @param {string} poolID 地址池ID
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeAddressPool(poolID: string): Promise<BackendResult>;
    /**
     * 添加外部地址范围
     * @param {string} poolID 地址池ID
     * @param {string} beginAddress 起始地址
     * @param {string} endAddress 结束地址
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addExternalAddressRange(poolID: string, beginAddress: string, endAddress: string): Promise<BackendResult>;
    /**
     * 添加内部地址范围
     * @param {string} poolID 地址池ID
     * @param {string} beginAddress 起始地址
     * @param {string} endAddress 结束地址
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    addInternalAddressRange(poolID: string, beginAddress: string, endAddress: string): Promise<BackendResult>;
    /**
     * 删除外部地址范围
     * @param {string} poolID 地址池ID
     * @param {string} beginAddress 起始地址
     * @param {string} endAddress 结束地址
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeExternalAddressRange(poolID: string, beginAddress: string, endAddress: string): Promise<BackendResult>;
    /**
     * 删除内部地址范围
     * @param {string} poolID 地址池ID
     * @param {string} beginAddress 起始地址
     * @param {string} endAddress 结束地址
     * @returns {Promise<BackendResult>} 操作结果
     * @deprecated 地址池相关接口全部会重新设计
     */
    removeInternalAddressRange(poolID: string, beginAddress: string, endAddress: string): Promise<BackendResult>;
    /**
     * 创建ISO文件
     * @param {FileSpec} spec 文件规格
     * @param {ResourceAccessLevel} access_level 资源访问级别
     * @returns {Promise<BackendResult<string>>} 文件ID
     */
    createISOFile(spec: FileSpec, access_level: ResourceAccessLevel): Promise<BackendResult<string>>;
    /**
     * 删除ISO文件
     * @param {string} fileID 文件ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    deleteISOFile(fileID: string): Promise<BackendResult>;
    /**
     * 修改ISO文件
     * @param {string} fileID 文件ID
     * @param {FileSpec} spec 文件规格
     * @returns {Promise<BackendResult>} 操作结果
     */
    modifyISOFile(fileID: string, spec: FileSpec): Promise<BackendResult>;
    /**
     * 获取ISO文件详情
     * @param {string} fileID 文件ID
     * @returns {Promise<BackendResult<FileStatus>>} 文件状态
     */
    getISOFile(fileID: string): Promise<BackendResult<FileStatus>>;
    /**
     * 查询ISO文件列表
     * @param {number} offset 起始位置
     * @param {number} limit 限制数量
     * @param {boolean} onlySelf 是否只查询当前用户的ISO文件
     * @returns {Promise<BackendResult<PaginationResult<FileView>>>} ISO文件列表
     */
    queryISOFiles(offset: number, limit: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<FileView>>>;
    /**
     * 创建磁盘文件
     * @param {FileSpec} spec 文件规格
     * @param {ResourceAccessLevel} access_level 资源访问级别
     * @returns {Promise<BackendResult<string>>} 文件ID
     */
    createDiskFile(spec: FileSpec, access_level: ResourceAccessLevel): Promise<BackendResult<string>>;
    /**
     * 删除磁盘文件
     * @param {string} fileID 文件ID
     * @returns {Promise<BackendResult>} 操作结果
     */
    deleteDiskFile(fileID: string): Promise<BackendResult>;
    /**
     * 修改磁盘文件
     * @param {string} fileID 文件ID
     * @param {FileSpec} spec 文件规格
     * @returns {Promise<BackendResult>} 操作结果
     */
    modifyDiskFile(fileID: string, spec: FileSpec): Promise<BackendResult>;
    /**
     * 获取磁盘文件详情
     * @param {string} fileID 文件ID
     * @returns {Promise<BackendResult<FileStatus>>} 文件状态
     */
    getDiskFile(fileID: string): Promise<BackendResult<FileStatus>>;
    /**
     * 查询磁盘文件列表
     * @param {number} offset 起始位置
     * @param {number} limit 限制数量
     * @param {boolean} onlySelf 是否只查询当前用户的磁盘文件
     * @returns {Promise<BackendResult<PaginationResult<FileView>>>} 磁盘文件列表
     */
    queryDiskFiles(offset: number, limit: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<FileView>>>;
    /**
     * 获取ISO文件URL
     * @param {string} fileID 文件ID
     * @returns {string} 文件URL
     */
    getISOFileURL(fileID: string): string;
    /**
     * 获取磁盘文件URL
     * @param {string} fileID 文件ID
     * @returns {string} 文件URL
     */
    getDiskFileURL(fileID: string): string;
    /**
     * 打开监控通道
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<MonitorResponse>>} 监控响应
     */
    openMonitorChannel(guestID: string): Promise<BackendResult<MonitorResponse>>;
    /**
     * 尝试插入介质，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} mediaId 介质ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryInsertMedia(guestID: string, mediaId: string): Promise<BackendResult<string>>;
    /**
     * 插入介质
     * @param {string} guestID 云主机ID
     * @param {string} mediaId 介质ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 操作结果
     */
    insertMedia(guestID: string, mediaId: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试弹出介质，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryEjectMedia(guestID: string): Promise<BackendResult<string>>;
    /**
     * 弹出介质
     * @param {string} guestID 云主机ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 无返回值
     */
    ejectMedia(guestID: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试调整磁盘大小，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} volumeTag 卷标签
     * @param {number} sizeInMB 大小（MB）
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryResizeDisk(guestID: string, volumeTag: string, sizeInMB: number): Promise<BackendResult<string>>;
    /**
     * 尝试收缩磁盘，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} volumeTag 卷标签
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryShrinkDisk(guestID: string, volumeTag: string): Promise<BackendResult<string>>;
    /**
     * 尝试安装磁盘镜像，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} volumeTag 卷标签
     * @param {string} fileID 文件ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryInstallDiskImage(guestID: string, volumeTag: string, fileID: string): Promise<BackendResult<string>>;
    /**
     * 尝试创建磁盘镜像，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} volumeTag 卷标签
     * @param {FileSpec} spec 文件规格
     * @param {ResourceAccessLevel} access_level 资源访问级别
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryCreateDiskImage(guestID: string, volumeTag: string, spec: FileSpec, access_level: ResourceAccessLevel): Promise<BackendResult<string>>;
    /**
     * 尝试同步ISO文件，成功返回任务ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     * @throws 尝试同步ISO文件失败
     */
    trySyncISOFiles(): Promise<BackendResult<string>>;
    /**
     * 尝试同步磁盘文件，成功返回任务ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     * @throws 尝试同步磁盘文件失败
     */
    trySyncDiskFiles(): Promise<BackendResult<string>>;
    /**
     * 查询资源池
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult<DataStore[]>>} 资源池列表
     */
    queryResourcePools(nodeID: string): Promise<BackendResult<DataStore[]>>;
    /**
     * 修改资源存储策略
     * @param {string} nodeID 节点ID
     * @param {string} poolID 池ID
     * @param {VolumeContainerStrategy} strategy 存储策略
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyResourceStorageStrategy(nodeID: string, poolID: string, strategy: VolumeContainerStrategy): Promise<BackendResult>;
    /**
     * 添加资源容器
     * @param {string} nodeID 节点ID
     * @param {string} poolID 池ID
     * @param {VolumeContainer} container 容器配置
     * @returns {Promise<BackendResult>} 添加结果
     */
    addResourceContainer(nodeID: string, poolID: string, container: VolumeContainer): Promise<BackendResult>;
    /**
     * 修改资源容器
     * @param {string} nodeID 节点ID
     * @param {string} poolID 池ID
     * @param {number} index 容器索引
     * @param {VolumeContainer} container 容器配置
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyResourceContainer(nodeID: string, poolID: string, index: number, container: VolumeContainer): Promise<BackendResult>;
    /**
     * 删除资源容器
     * @param {string} nodeID 节点ID
     * @param {string} poolID 池ID
     * @param {number} index 容器索引
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeResourceContainer(nodeID: string, poolID: string, index: number): Promise<BackendResult>;
    /**
     * 更改资源容器标志
     * @param {string} nodeID 节点ID
     * @param {string} poolID 池ID
     * @param {number} index 容器索引
     * @param {boolean} enabled 是否启用
     * @returns {Promise<BackendResult>} 更改结果
     */
    changeResourceContainerFlag(nodeID: string, poolID: string, index: number, enabled: boolean): Promise<BackendResult>;
    /**
     * 查询快照
     * @param {string} guestID 云主机ID
     * @returns {Promise<BackendResult<SnapshotTreeNode[]>>} 快照树节点列表
     */
    querySnapshots(guestID: string): Promise<BackendResult<SnapshotTreeNode[]>>;
    /**
     * 获取快照
     * @param {string} guestID 云主机ID
     * @param {string} snapshotID 快照ID
     * @returns {Promise<BackendResult<SnapshotRecord>>} 快照记录
     */
    getSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<SnapshotRecord>>;
    /**
     * 尝试创建快照，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} label 标签
     * @param {string} [description] 描述
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryCreateSnapshot(guestID: string, label: string, description?: string): Promise<BackendResult<string>>;
    /**
     * 创建快照
     * @param {string} guestID 云主机ID
     * @param {string} label 标签
     * @param {string} [description] 描述
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 创建结果
     */
    createSnapshot(guestID: string, label: string, description?: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试恢复快照，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} snapshotID 快照ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryRestoreSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<string>>;
    /**
     * 恢复快照
     * @param {string} guestID 云主机ID
     * @param {string} snapshotID 快照ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 恢复结果
     */
    restoreSnapshot(guestID: string, snapshotID: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试删除快照，成功返回任务ID
     * @param {string} guestID 云主机ID
     * @param {string} snapshotID 快照ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryDeleteSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<string>>;
    /**
     * 删除快照
     * @param {string} guestID 云主机ID
     * @param {string} snapshotID 快照ID
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 删除结果
     */
    deleteSnapshot(guestID: string, snapshotID: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 查询资源使用情况
     * @param {string[]} targets 目标列表
     * @returns {Promise<BackendResult<GuestResourceUsageData[]>>} 资源使用数据列表
     */
    queryResourceUsages(targets: string[]): Promise<BackendResult<GuestResourceUsageData[]>>;
    /**
     * 查询资源统计信息
     * @param {string} guest 云主机ID
     * @param {StatisticRange} range 统计范围
     * @returns {Promise<BackendResult<ResourceStatisticUnit[]>>} 资源统计单元列表
     */
    queryResourceStatistic(guest: string, range: StatisticRange): Promise<BackendResult<ResourceStatisticUnit[]>>;
    /**
     * 查询计算节点
     * @param {string} poolID 池ID
     * @returns {Promise<BackendResult<ClusterNodeData[]>>} 集群节点数据列表
     */
    queryComputeNodes(poolID: string): Promise<BackendResult<ClusterNodeData[]>>;
    /**
     * 查询节点使用情况
     * @param {string[]} targets 目标列表
     * @returns {Promise<BackendResult<NodeResourceSnapshot[]>>} 节点资源快照列表
     */
    queryNodesUsage(targets: string[]): Promise<BackendResult<NodeResourceSnapshot[]>>;
    /**
     * 查询池使用情况
     * @param {string[]} targets 目标列表
     * @returns {Promise<BackendResult<PoolResourceSnapshot[]>>} 池资源快照列表
     */
    queryPoolsUsage(targets: string[]): Promise<BackendResult<PoolResourceSnapshot[]>>;
    /**
     * 查询集群使用情况
     * @returns {Promise<BackendResult<ClusterResourceSnapshot>>} 集群资源快照
     */
    queryClusterUsage(): Promise<BackendResult<ClusterResourceSnapshot>>;
    /**
     * 查询系统模板
     * @param {number} offset 起始位置
     * @param {number} pageSize 页面大小
     * @param {boolean} onlySelf 是否只查询当前用户的系统模板
     * @returns {Promise<BackendResult<GuestSystemView[]>>} 系统模板视图列表
     */
    querySystems(offset: number, pageSize: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<GuestSystemView>>>;
    /**
     * 获取系统模板
     * @param {string} systemID 系统ID
     * @returns {Promise<BackendResult<GuestSystemView>>} 系统模板视图
     */
    getSystem(systemID: string): Promise<BackendResult<GuestSystemView>>;
    /**
     * 添加系统模板
     * @param {string} label 标签
     * @param {GuestSystemSpec} spec 系统规格
     * @param {ResourceAccessLevel} access_level 资源访问级别
     * @returns {Promise<BackendResult>} 添加结果
     */
    addSystem(label: string, spec: GuestSystemSpec, access_level: ResourceAccessLevel): Promise<BackendResult>;
    /**
     * 修改系统模板
     * @param {string} systemID 系统ID
     * @param {string} label 标签
     * @param {GuestSystemSpec} spec 系统规格
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifySystem(systemID: string, label: string, spec: GuestSystemSpec): Promise<BackendResult>;
    /**
     * 删除系统模板
     * @param {string} id 系统ID
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeSystem(id: string): Promise<BackendResult>;
    /**
     * 重置系统模板
     * @returns {Promise<BackendResult>} 重置结果
     */
    resetSystems(): Promise<BackendResult>;
    /**
     * 查询日志
     * @param {string} date 日期,"yyyy-MM-dd"
     * @param {number} [offset] 偏移量
     * @param {number} [limit] 限制数量
     * @returns {Promise<BackendResult<PaginationResult<ConsoleEvent>>>} 日志分页结果
     */
    queryLogs(date: string, offset?: number, limit?: number): Promise<BackendResult<PaginationResult<ConsoleEvent>>>;
    /**
     * 查询警告
     * @param {ConsoleEventLevel} [level] 警告级别
     * @param {boolean} [unread_only] 是否只查询未读
     * @param {number} [offset] 偏移量
     * @param {number} [limit] 限制数量
     * @returns {Promise<BackendResult<WarningRecordSet>>} 警告记录集
     */
    queryWarnings(level?: ConsoleEventLevel, unread_only?: boolean, offset?: number, limit?: number): Promise<BackendResult<WarningRecordSet>>;
    /**
     * 统计节点警告数量
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
     */
    countWarnings(nodeID: string): Promise<BackendResult<WarningStatistic>>;
    /**
     * 统计多个节点警告总数
     * @param {string[]} nodeList 节点列表
     * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
     */
    sumWarnings(nodeList: string[]): Promise<BackendResult<WarningStatistic>>;
    /**
     * 删除警告
     * @param {string[]} idList 警告ID列表
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeWarnings(idList: string[]): Promise<BackendResult>;
    /**
     * 清除所有警告
     * @returns {Promise<BackendResult>} 清除结果
     */
    clearWarnings(): Promise<BackendResult>;
    /**
     * 标记警告为已读
     * @param {string[]} idList 警告ID列表
     * @returns {Promise<BackendResult>} 标记结果
     */
    markWarningsAsRead(idList: string[]): Promise<BackendResult>;
    /**
     * 标记所有警告为已读
     * @returns {Promise<BackendResult>} 标记结果
     */
    markAllWarningsAsRead(): Promise<BackendResult>;
    /**
     * 标记所有警告为未读
     * @returns {Promise<BackendResult>} 标记结果
     */
    markAllWarningsAsUnread(): Promise<BackendResult>;
    /**
     * 统计未读警告数量
     * @returns {Promise<BackendResult<WarningStatistic>>} 警告统计信息
     */
    countUnreadWarnings(): Promise<BackendResult<WarningStatistic>>;
    /**
     * 修改节点配置
     * @param {string} nodeID 节点ID
     * @param {NodeConfig} config 节点配置
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyConfig(nodeID: string, config: NodeConfig): Promise<BackendResult>;
    /**
     * 获取节点配置
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult<NodeConfigStatus>>} 节点配置状态
     */
    getConfig(nodeID: string): Promise<BackendResult<NodeConfigStatus>>;
    /**
     * 重启服务
     * @param {string} nodeID 节点ID
     * @returns {Promise<BackendResult>} 重启结果
     */
    restartService(nodeID: string): Promise<BackendResult>;
    /**
     * 添加SSH密钥
     * @param {string} label 标签
     * @param {string} content 密钥内容
     * @param {ResourceAccessLevel} access_level 资源访问级别
     * @returns {Promise<BackendResult>} 添加结果
     */
    addSSHKey(label: string, content: string, access_level: ResourceAccessLevel): Promise<BackendResult>;
    /**
     * 删除SSH密钥
     * @param {string} id 密钥ID
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeSSHKey(id: string): Promise<BackendResult>;
    /**
     * 查询SSH密钥
     * @param {number} offset 偏移量
     * @param {number} pageSize 页面大小
     * @returns {Promise<BackendResult<SSHKeyView[]>>} SSH密钥视图列表
     */
    querySSHKeys(offset: number, pageSize: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<SSHKeyView>>>;
    /**
     * 获取已激活的许可证
     * @returns {Promise<BackendResult<License>>} 许可证信息
     */
    getActivatedLicense(): Promise<BackendResult<License>>;
    /**
     * 激活许可证
     * @param {string} licenseID 许可证ID
     * @returns {Promise<BackendResult>} 激活结果
     */
    activateLicense(licenseID: string): Promise<BackendResult>;
    /**
     * 添加许可证
     * @param {License} license 许可证信息
     * @returns {Promise<BackendResult>} 添加结果
     */
    addLicense(license: License): Promise<BackendResult>;
    /**
     * 删除许可证
     * @param {string} licenseID 许可证ID
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeLicense(licenseID: string): Promise<BackendResult>;
    /**
     * 获取许可证
     * @param {string} licenseID 许可证ID
     * @returns {Promise<BackendResult<License>>} 许可证信息
     */
    getLicense(licenseID: string): Promise<BackendResult<License>>;
    /**
     * 查询所有许可证
     * @returns {Promise<BackendResult<LicenseRecord[]>>} 许可证记录列表
     * @throws 查询许可证失败
     */
    queryLicenses(): Promise<BackendResult<LicenseRecord[]>>;
    /**
     * 查询集群状态
     * @returns {Promise<BackendResult<ClusterStatus>>} 集群状态
     */
    queryClusterStatus(): Promise<BackendResult<ClusterStatus>>;
    /**
     * 查询网络拓扑图
     * @returns {Promise<BackendResult<NetworkGraphNode[]>>} 网络拓扑节点列表
     */
    queryNetworkGraph(): Promise<BackendResult<NetworkGraphNode[]>>;
    /**
     * 获取监控规则
     * @returns {Promise<BackendResult<ResourceMonitorConfig>>} 资源监控配置
     */
    getMonitorRules(): Promise<BackendResult<ResourceMonitorConfig>>;
    /**
     * 设置监控规则
     * @param {ResourceMonitorConfig} rules 资源监控配置
     * @returns {Promise<BackendResult>} 设置结果
     */
    setMonitorRules(rules: ResourceMonitorConfig): Promise<BackendResult>;
    /**
     * 尝试重新加载资源节点存储
     * @param {string} nodeID 节点ID
     * @param {string} poolID 节点存储标识
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryReloadResourceStorage(nodeID: string, poolID: string): Promise<BackendResult<string>>;
    /**
     * 更新磁盘卷大小
     * @param {string} fileID 文件ID
     * @param {number} sizeInMB 大小（MB）
     * @returns {Promise<BackendResult>} 更新结果
     */
    updateDiskVolumeSize(fileID: string, sizeInMB: number): Promise<BackendResult>;
    /**
     * 重置监控规则
     * @returns {Promise<BackendResult>} 重置结果
     */
    resetMonitorRules(): Promise<BackendResult>;
    /**
     * 清除任务
     * @returns {Promise<BackendResult>} 清除结果
     */
    clearTasks(): Promise<BackendResult>;
    /**
     * 添加导入源
     * @param {ImportVendor} vendor 供应商类型
     * @param {string} url 导入源URL
     * @param {string} token 认证token
     * @param {string} secret 认证secret
     * @returns {Promise<BackendResult>} 添加结果
     */
    addImportSource(vendor: ImportVendor, url: string, token: string, secret: string): Promise<BackendResult>;
    /**
     * 修改导入源
     * @param {string} id 导入源ID
     * @param {string} url 导入源URL
     * @param {string} token 认证token
     * @param {string} secret 认证secret
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyImportSource(id: string, url: string, token: string, secret: string): Promise<BackendResult>;
    /**
     * 删除导入源
     * @param {string} id 导入源ID
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeImportSource(id: string): Promise<BackendResult>;
    /**
     * 查询导入源
     * @param {number} start 起始索引
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<ImportSource>>>} 导入源分页结果
     */
    queryImportSources(start: number, limit: number): Promise<BackendResult<PaginationResult<ImportSource>>>;
    /**
     * 查询导入目标
     * @param {string} sourceID 导入源ID
     * @returns {Promise<BackendResult<ImportTarget[]>>} 导入目标列表
     */
    queryImportTargets(sourceID: string): Promise<BackendResult<ImportTarget[]>>;
    /**
     * 尝试导入云主机到节点
     * @param {string} sourceID 导入源ID
     * @param {string[]} targetIDs 目标云主机ID列表
     * @param {string} targetNode 目标节点ID
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryImportGuestsToNode(sourceID: string, targetIDs: string[], targetNode: string): Promise<BackendResult<string>>;
    /**
     * 尝试迁移云主机到节点
     * @param {string} targetNode 目标节点ID
     * @param {string[]} guests 云主机ID列表
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryMigrateToNode(targetNode: string, guests: string[]): Promise<BackendResult<string>>;
    /**
     * 尝试修改外部接口MAC地址
     * @param {string} guestID 云主机ID
     * @param {string} device 目标设备(当前MAC)
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryModifyExternalInterfaceMAC(guestID: string, device: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 修改外部接口MAC地址
     * @param {string} guestID 云主机ID
     * @param {string} device 目标设备(当前MAC)
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyExternalInterfaceMAC(guestID: string, device: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 尝试修改内部接口MAC地址
     * @param {string} guestID 云主机ID
     * @param {string} device 目标设备(当前MAC)
     * @param {string} macAddress MAC地址
     * @returns {Promise<BackendResult<string>>} 任务ID
     */
    tryModifyInternalInterfaceMAC(guestID: string, device: string, macAddress: string): Promise<BackendResult<string>>;
    /**
     * 修改内部接口MAC地址
     * @param {string} guestID 云主机ID
     * @param {string} device 目标设备(当前MAC)
     * @param {string} macAddress MAC地址
     * @param {number} timeoutSeconds 超时时间（秒），默认300秒
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyInternalInterfaceMAC(guestID: string, device: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>;
    /**
     * 查询用户角色
     * @returns {Promise<BackendResult<UserRole[]>>} 用户角色列表
     */
    queryUserRoles(): Promise<BackendResult<UserRole[]>>;
    /**
     * 修改用户组角色
     * @param {string} group 用户组
     * @param {UserRole[]} roles 角色列表
     * @returns {Promise<BackendResult>} 修改结果
     */
    modifyGroupRoles(group: string, roles: UserRole[]): Promise<BackendResult>;
    /**
     * 获取用户组角色
     * @param {string} group 用户组
     * @returns {Promise<BackendResult<UserRole[]>>} 用户角色列表
     */
    getGroupRoles(group: string): Promise<BackendResult<UserRole[]>>;
    /**
     * 查询用户组成员
     * @param {string} group 用户组
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<string>>>} 用户组成员分页结果
     */
    queryGroupMembers(group: string, offset: number, limit: number): Promise<BackendResult<PaginationResult<string>>>;
    /**
     * 添加用户组
     * @param {UserGroup} group 用户组
     * @returns {Promise<BackendResult>} 添加结果
     */
    addGroup(group: UserGroup): Promise<BackendResult>;
    /**
     * 删除用户组
     * @param {string} group 用户组
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeGroup(group: string): Promise<BackendResult>;
    /**
     * 查询用户组
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<UserGroupRecord>>>} 用户组分页结果
     */
    queryGroups(offset: number, limit: number): Promise<BackendResult<PaginationResult<UserGroupRecord>>>;
    /**
     * 添加用户
     * @param {string} user 用户名
     * @param {string} group 用户组
     * @param {string} password 密码
     * @returns {Promise<BackendResult>} 添加结果
     */
    addUser(user: string, group: string, password: string): Promise<BackendResult>;
    /**
     * 删除用户
     * @param {string} userId 用户ID
     * @returns {Promise<BackendResult>} 删除结果
     */
    removeUser(userId: string): Promise<BackendResult>;
    /**
     * 查询用户
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<UserCredentialRecord>>>} 用户分页结果
     */
    queryUsers(offset: number, limit: number): Promise<BackendResult<PaginationResult<UserCredentialRecord>>>;
    /**
     * 修改用户组
     * @param {string} userId 用户ID
     * @param {string} groupId 用户组ID
     * @returns {Promise<BackendResult>} 修改结果
     */
    changeUserGroup(userId: string, groupId: string): Promise<BackendResult>;
    /**
     * 查询用户令牌
     * @param {string} user 用户名
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<UserToken>>>} 用户令牌分页结果
     */
    queryUserTokens(user: string, offset: number, limit: number): Promise<BackendResult<PaginationResult<UserToken>>>;
    /**
     * 撤销用户令牌
     * @param {string} user 用户名
     * @param {string} serial 序列号
     * @returns {Promise<BackendResult>} 撤销结果
     */
    revokeUserToken(user: string, serial: string): Promise<BackendResult>;
    /**
     * 修改用户密码
     * @param {string} user 用户名
     * @param {string} password 新密码
     * @returns {Promise<BackendResult>} 修改结果
     */
    changeUserSecret(user: string, password: string): Promise<BackendResult>;
    /**
     * 重置用户密码
     * @param {string} user 用户名
     * @returns {Promise<BackendResult<string>>} 新密码
     */
    resetUserSecret(user: string): Promise<BackendResult<string>>;
    /**
     * 撤销访问权限
     * @param {string} token 令牌
     * @returns {Promise<BackendResult>} 撤销结果
     */
    revokeAccess(token: string): Promise<BackendResult>;
    /**
     * 使访问权限失效
     * @param {string} token 令牌
     * @returns {Promise<BackendResult>} 使访问权限失效结果
     */
    invalidateAccess(token: string): Promise<BackendResult>;
    /**
     * 查询访问记录
     * @param {string} user 用户名
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<UserAccessRecord>>>} 访问记录分页结果
     */
    queryAccesses(user: string, offset: number, limit: number): Promise<BackendResult<PaginationResult<UserAccessRecord>>>;
    /**
     * 添加白名单
     * @param {string} address 白名单地址
     * @returns {Promise<BackendResult>} 添加结果
     */
    addWhiteList(address: string): Promise<BackendResult>;
    /**
     * 移除白名单
     * @param {number} index 白名单索引
     * @returns {Promise<BackendResult>} 移除结果
     */
    removeWhiteList(index: number): Promise<BackendResult>;
    /**
     * 更新白名单
     * @param {number} index 白名单索引
     * @param {string} address 新的白名单地址
     * @returns {Promise<BackendResult>} 更新结果
     */
    updateWhiteList(index: number, address: string): Promise<BackendResult>;
    /**
     * 查询白名单
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<string>>>} 白名单分页结果
     */
    queryWhiteList(offset: number, limit: number): Promise<BackendResult<PaginationResult<string>>>;
    /**
     * 设置系统资源
     * @param {ResourceType} type 资源类型
     * @param {string} id 资源ID
     * @param {boolean} value 资源值
     * @returns {Promise<BackendResult>} 设置结果
     */
    setSystemResource(type: ResourceType, id: string, value: boolean): Promise<BackendResult>;
    /**
     * 获取资源权限
     * @param {ResourceType} type 资源类型
     * @param {string} id 资源ID
     * @returns {Promise<BackendResult<ResourcePermissions>>} 资源权限结果
     */
    getResourcePermissions(type: ResourceType, id: string): Promise<BackendResult<ResourcePermissions>>;
    /**
     * 设置资源权限
     * @param {ResourceType} type 资源类型
     * @param {string} id 资源ID
     * @param {ResourcePermissions} permissions 资源权限
     * @returns {Promise<BackendResult>} 设置结果
     */
    setResourcePermissions(type: ResourceType, id: string, permissions: ResourcePermissions): Promise<BackendResult>;
    /**
     * 检查是否可以创建更多云主机
     * @returns {Promise<boolean>} 是否可以创建更多云主机
     */
    couldHasMoreGuests(): Promise<boolean>;
    /**
     * 检查是否可以添加更多节点
     * @returns {Promise<boolean>} 是否可以添加更多节点
     */
    couldHasMoreNodes(): Promise<boolean>;
    /**
     * 检查指定功能是否已启用
     * @param {LicenseFeature} feature 要检查的功能
     * @returns {Promise<boolean>} 功能是否已启用
     */
    isFeatureEnabled(feature: LicenseFeature): Promise<boolean>;
    /**
     * 获取所有SSH密钥
     * @returns {Promise<BackendResult<SSHKeyView[]>>} SSH密钥列表
     */
    fetchAllSSHKeys(): Promise<BackendResult<SSHKeyView[]>>;
    /**
     * 获取所有系统模板
     * @returns {Promise<BackendResult<GuestSystemView[]>>} 系统列表
     */
    fetchAllSystems(): Promise<BackendResult<GuestSystemView[]>>;
    /**
     * 注销设备
     * @returns {Promise<BackendResult>} 注销结果
     */
    logoutDevice(): Promise<BackendResult>;
    /**
     * 查询当前用户已登录设备列表
     * @param {number} offset 偏移量
     * @param {number} limit 每页数量
     * @returns {Promise<BackendResult<PaginationResult<UserAccessRecord>>>} 设备列表
     */
    queryDevices(offset: number, limit: number): Promise<BackendResult<PaginationResult<UserAccessRecord>>>;
}
