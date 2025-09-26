/**
 * API使用云主机、镜像等逻辑对象的数据结构定义
 */
import { AuthorizationMode, CloudInitBootMode, ComputePoolStrategy, ConsoleEventCategory, ConsoleEventLevel, ConsoleEventRange, DisplayDriver, FileCategory, FileState, GuestDiskMode, GuestFirmwareMode, GuestSoundModel, GuestState, GuestTabletMode, ImportVendor, InterfaceMode, LicenseFeature, Locale, NetworkMode, NetworkModelType, NodeMode, NodeState, Priority, RemoteProtocol, ResourceAccessLevel, ResourceAccessScope, ResourceAction, SignatureAlgorithm, StorageType, SystemCategory, TaskStatus, TaskType, TokenSigningMethod, USBModel, UserRole, VolumeContainerStrategy, VolumeFormat } from "./enums";
import { ResourceUsageDurationRecord } from "./request-params";
/**
 * 资源用量值
 * @interface
 * @property average - 平均值
 * @property max - 最大值
 * @property min - 最小值
 */
export interface ResourceStatisticValue {
    average: number;
    max: number;
    min: number;
}
/**
 * 资源用量单位
 * @interface
 * @property average - 平均值
 * @property max - 最大值
 * @property min - 最小值
 * @property readRequests - 读取请求数
 * @property readBytes - 读取字节数
 * @property writeRequests - 写入请求数
 * @property writeBytes - 写入字节数
 * @property receivedPackets - 接收数据包数
 * @property receivedBytes - 接收字节数
 * @property transmittedPackets - 发送数据包数
 * @property transmittedBytes - 发送字节数
 * @property readBytesPerSecond - 每秒读取字节数
 * @property readPacketsPerSecond - 每秒读取数据包数
 * @property writeBytesPerSecond - 每秒写入字节数
 * @property writePacketsPerSecond - 每秒写入数据包数
 * @property receivedBytesPerSecond - 每秒接收字节数
 * @property receivedPacketsPerSecond - 每秒接收数据包数
 * @property transmittedBytesPerSecond - 每秒发送字节数
 * @property transmittedPacketsPerSecond - 每秒发送数据包数
 * @property timestamp - 时间戳,RFC3339
 */
export interface ResourceStatisticUnit {
    cores: ResourceStatisticValue;
    memory: ResourceStatisticValue;
    disk: ResourceStatisticValue;
    readRequests: number;
    readBytes: number;
    writeRequests: number;
    writeBytes: number;
    receivedPackets: number;
    receivedBytes: number;
    transmittedPackets: number;
    transmittedBytes: number;
    readBytesPerSecond: ResourceStatisticValue;
    readPacketsPerSecond: ResourceStatisticValue;
    writeBytesPerSecond: ResourceStatisticValue;
    writePacketsPerSecond: ResourceStatisticValue;
    receivedBytesPerSecond: ResourceStatisticValue;
    receivedPacketsPerSecond: ResourceStatisticValue;
    transmittedBytesPerSecond: ResourceStatisticValue;
    transmittedPacketsPerSecond: ResourceStatisticValue;
    timestamp: string;
}
/**
 * 区间内资源用量
 * @interface
 * @property cores - 核心占用, 0~100(%)
 * @property memory - 内存占用, 0~100(%)
 * @property disk - 磁盘占用, 0~100(%)
 * @property readRequests - 读取请求数
 * @property readBytes - 读取字节数
 * @property writeRequests - 写入请求数
 * @property writeBytes - 写入字节数
 * @property receivedPackets - 接收数据包数
 * @property receivedBytes - 接收字节数
 * @property transmittedPackets - 发送数据包数
 * @property transmittedBytes - 发送字节数
 * @property readBytesPerSecond - 每秒读取字节数
 * @property readPacketsPerSecond - 每秒读取数据包数
 * @property writeBytesPerSecond - 每秒写入字节数
 * @property writePacketsPerSecond - 每秒写入数据包数
 * @property receivedBytesPerSecond - 每秒接收字节数
 * @property receivedPacketsPerSecond - 每秒接收数据包数
 * @property transmittedBytesPerSecond - 每秒发送字节数
 * @property transmittedPacketsPerSecond - 每秒发送数据包数
 * @property timestamp - 时间戳,RFC3339
 */
export interface ResourceUsageDuration {
    cores: number;
    memory: number;
    disk: number;
    readRequests: number;
    readBytes: number;
    writeRequests: number;
    writeBytes: number;
    receivedPackets: number;
    receivedBytes: number;
    transmittedPackets: number;
    transmittedBytes: number;
    readBytesPerSecond: number;
    readPacketsPerSecond: number;
    writeBytesPerSecond: number;
    writePacketsPerSecond: number;
    receivedBytesPerSecond: number;
    receivedPacketsPerSecond: number;
    transmittedBytesPerSecond: number;
    transmittedPacketsPerSecond: number;
    timestamp: string;
}
export interface GuestResourceUsageData extends ResourceUsageDuration {
    guest_id: string;
}
export interface GuestResourceUsageRecord extends ResourceUsageDurationRecord {
    guest_id: string;
}
/**
 * 卷容器
 * @interface
 * @property uri - 卷容器URI
 * @property is_default - 是否默认
 * @property enabled - 是否启用
 * @property access_token - 访问令牌
 * @property access_secret - 访问密钥
 * @property mount_point - 挂载点
 * @property fs_entry - 文件系统条目
 * @property id - 卷容器ID
 * @property lun - iSCSI类型的LUN
 * @property disable_auto_initialize - 禁用自动初始化
 */
export interface VolumeContainer {
    uri: string;
    is_default: boolean;
    enabled: boolean;
    access_token?: string;
    access_secret?: string;
    mount_point?: string;
    fs_entry?: string;
    id?: string;
    lun?: number;
    disable_auto_initialize?: boolean;
}
/**
 * 卷容器状态
 * @interface
 * @property uri - 卷容器URI
 * @property is_default - 是否默认
 * @property enabled - 是否启用
 * @property access_token - 访问令牌
 * @property access_secret - 访问密钥
 * @property mount_point - 挂载点
 * @property fs_entry - 文件系统条目
 * @property id - 卷容器ID
 * @property lun - iSCSI类型的LUN
 * @property disable_auto_initialize - 禁用自动初始化
 * @property allocated_volumes - 已分配卷数
 * @property used_size - 已使用大小
 * @property avaliable_size - 可用大小
 * @property max_size - 最大大小
 */
export interface VolumeContainerStatus extends VolumeContainer {
    allocated_volumes: number;
    used_size: number;
    avaliable_size: number;
    max_size: number;
}
/**
 * 存储池
 * @interface
 * @property id - 存储池ID
 * @property type - 存储类型
 * @property strategy - 卷容器策略
 * @property description - 描述
 * @property containers - 卷容器状态列表
 */
export interface StoragePool {
    id: string;
    type: StorageType;
    strategy: VolumeContainerStrategy;
    description?: string;
    containers: VolumeContainerStatus[];
}
/**
 * 存储池列表记录
 * @interface
 * @property id - 存储池ID
 * @property type - 存储类型
 * @property strategy - 卷容器策略
 * @property description - 描述
 * @property containers - 卷容器数量
 * @property allocated_volumes - 已分配卷数
 * @property used_size - 已使用大小
 * @property avaliable_size - 可用容量
 * @property max_size - 最大容量
 */
export interface StoragePoolListRecord {
    id: string;
    type: StorageType;
    strategy: VolumeContainerStrategy;
    description?: string;
    containers: number;
    allocated_volumes: number;
    used_size: number;
    avaliable_size: number;
    max_size: number;
}
/**
 * 数据存储
 * @interface
 * @property id - 数据存储ID
 * @property type - 存储类型
 * @property strategy - 卷容器策略
 * @property description - 描述
 * @property containers - 卷容器状态列表
 * @property current - 是否当前生效的数据存储
 * @property unique_id - iSCSI唯一标识
 */
export interface DataStore extends StoragePool {
    current?: boolean;
    unique_id?: string;
}
export interface ServerResult<T> {
    id?: string;
    error?: string;
    data?: T;
}
/**
 * 磁盘规格
 * @interface
 * @property tag - 磁盘标签
 * @property uri - 磁盘URI
 * @property format - 磁盘格式
 * @property device - 磁盘设备
 * @property access_token - 访问令牌
 * @property access_secret - 访问密钥
 * @property size - 磁盘大小
 */
export interface DiskSpec {
    tag: string;
    uri: string;
    format: VolumeFormat;
    device?: string;
    access_token?: string;
    access_secret?: string;
    size?: number;
}
/**
 * 监控规格
 * @interface
 * @property protocol - 协议
 * @property port - 端口
 * @property secret - 密钥
 */
export interface MonitorSpec {
    protocol: string;
    port: number;
    secret?: string;
}
/**
 * 目标系统规格
 * @interface
 * @property category - 系统类别
 * @property removable - 光驱接口模式
 * @property disk - 磁盘模式
 * @property network - 网络模型类型
 * @property display - 显示驱动
 * @property control - 远程协议
 * @property usb - USB模型
 * @property firmware - 固件模式
 * @property sound - 声音模型
 * @property tablet - 平板模式
 * @property default_volume_group - 默认卷组
 * @property default_logical_volume - 默认逻辑卷
 */
export interface GuestSystemSpec {
    category: SystemCategory;
    removable: GuestDiskMode;
    disk: GuestDiskMode;
    network: NetworkModelType;
    display: DisplayDriver;
    control: RemoteProtocol;
    usb: USBModel;
    firmware?: GuestFirmwareMode;
    sound?: GuestSoundModel;
    tablet?: GuestTabletMode;
    default_volume_group?: string;
    default_logical_volume?: string;
}
/**
 * 目标系统记录
 * @interface
 * @property id - 目标系统ID
 * @property label - 目标系统标签
 * @property is_system - 是否系统模板
 * @property category - 系统类别
 * @property removable - 光驱接口模式
 * @property disk - 磁盘模式
 * @property network - 网络模型类型
 * @property display - 显示驱动
 * @property control - 远程协议
 * @property usb - USB模型
 * @property firmware - 固件模式
 * @property sound - 声音模型
 * @property tablet - 平板模式
 * @property default_volume_group - 默认卷组
 * @property default_logical_volume - 默认逻辑卷
 */
export interface GuestSystemRecord extends GuestSystemSpec {
    id: string;
    label: string;
    is_system?: boolean;
}
/**
 * 目标系统视图
 * @interface
 * @property id - 目标系统ID
 * @property label - 目标系统标签
 * @property is_system - 是否系统模板
 * @property category - 系统类别
 * @property removable - 光驱接口模式
 * @property disk - 磁盘模式
 * @property network - 网络模型类型
 * @property display - 显示驱动
 * @property control - 远程协议
 * @property usb - USB模型
 * @property firmware - 固件模式
 * @property sound - 声音模型
 * @property tablet - 平板模式
 * @property default_volume_group - 默认卷组
 * @property default_logical_volume - 默认逻辑卷
 * @property permissions - 资源权限
 * @property actions - 可执行的资源操作列表
 */
export interface GuestSystemView extends GuestSystemSpec {
    id: string;
    label: string;
    is_system?: boolean;
    permissions: ResourcePermissions;
    actions: ResourceAction[];
}
/**
 * 网络接口
 * @interface
 * @property mode - 接口模式
 * @property internal - 内部网络接口
 * @property external - 外部网络接口
 */
export interface NetworkInterfaces {
    mode: InterfaceMode;
    internal?: NetworkInterface[];
    external?: NetworkInterface[];
}
/**
 * CloudInit主机密钥
 * @interface
 * @property algorithm - 算法
 * @property public_key - 公钥
 * @property private_key - 私钥
 * @property certificate - 证书
 */
export interface CloudInitHostKey {
    algorithm: string;
    public_key: string;
    private_key: string;
    certificate: string;
}
/**
 * CloudInit用户基类
 * @interface
 * @property name - 用户名
 * @property password - 密码
 * @property disable_password - 禁用密码登录
 * @property ssh_keys - SSH密钥
 */
export interface CloudInitUserBase {
    name: string;
    password?: string;
    disable_password?: boolean;
    ssh_keys?: string[];
}
/**
 * CloudInit用户
 * @interface
 * @property name - 用户名
 * @property password - 密码
 * @property disable_password - 禁用密码登录
 * @property ssh_keys - SSH密钥
 * @property is_admin - 是否管理员
 * @property groups - 组
 */
export interface CloudInitUser extends CloudInitUserBase {
    is_admin?: boolean;
    groups?: string[];
}
/**
 * CloudInit CA证书
 * @interface
 * @property remove_defaults - 是否移除默认证书
 * @property trusted - 受信任的证书列表
 */
export interface CloudInitCACertificates {
    remove_defaults?: boolean;
    trusted?: string[];
}
/**
 * CloudInit配置
 * @interface
 * @property boot_mode - 引导模式
 * @property default_user - 默认用户
 * @property root_disabled - 禁用root用户
 * @property password_disabled - 禁用密码登录
 * @property expire_passwords - 密码过期
 * @property users - 用户列表
 * @property host_key - 主机密钥
 * @property ca_certificates - CA证书
 */
export interface CloudInitSpec {
    boot_mode?: CloudInitBootMode;
    default_user: CloudInitUserBase;
    root_disabled?: boolean;
    password_disabled?: boolean;
    expire_passwords?: boolean;
    users?: CloudInitUser[];
    host_key?: CloudInitHostKey;
    ca_certificates?: CloudInitCACertificates;
}
/**
 * 云主机规格
 * @interface
 * @property name - 云主机名称
 * @property id - 云主机ID
 * @property cores - 核心数
 * @property memory - 内存大小
 * @property network_mode - 网络模式
 * @property storage_type - 存储类型
 * @property storage_pool - 存储池
 * @property address_pool - 地址池
 * @property disks - 磁盘规格列表
 * @property monitor - 监控规格
 * @property boot_image - 引导镜像
 * @property network_interfaces - 网络接口
 * @property auto_start - 自动启动
 * @property created_time - 创建时间,RFC3339
 * @property system - 目标系统
 * @property cloud_init - CloudInit配置
 * @property qos - QoS配置
 */
export interface GuestSpec {
    name: string;
    id: string;
    cores: number;
    memory: number;
    network_mode: NetworkMode;
    storage_type: StorageType;
    storage_pool: string;
    address_pool?: string;
    disks: DiskSpec[];
    monitor: MonitorSpec;
    boot_image?: string;
    network_interfaces: NetworkInterfaces;
    auto_start: boolean;
    created_time: string;
    system: GuestSystemSpec;
    cloud_init?: CloudInitSpec;
    qos?: GuestQoS;
}
/**
 * 云主机状态
 * @interface
 * @property name - 云主机名称
 * @property id - 云主机ID
 * @property cores - 核心数
 * @property memory - 内存大小
 * @property network_mode - 网络模式
 * @property storage_type - 存储类型
 * @property storage_pool - 存储池
 * @property address_pool - 地址池
 * @property disks - 磁盘规格列表
 * @property monitor - 监控规格
 * @property boot_image - 引导镜像
 * @property network_interfaces - 网络接口
 * @property auto_start - 自动启动
 * @property created_time - 创建时间,RFC3339
 * @property system - 目标系统
 * @property cloud_init - CloudInit配置
 * @property state - 云主机状态
 * @property media_attached - 是否已加载媒体
 * @property media_source - 媒体源
 * @property host_id - 资源节点ID
 * @property host_address - 资源节点地址
 * @property pool - 所属计算资源池
 * @property tools_installed - 是否已安装辅助工具
 */
export interface GuestStatus extends GuestSpec {
    state: GuestState;
    media_attached?: boolean;
    media_source?: string;
    host_id?: string;
    host_address?: string;
    pool?: string;
    tools_installed?: boolean;
}
/**
 * 云主机过滤条件
 * @interface
 * @property by_keywords - 是否按关键词过滤
 * @property keywords - 关键词列表
 * @property by_state - 是否按状态过滤
 * @property state - 状态
 * @property by_pool - 是否按资源池过滤
 * @property pool - 资源池
 * @property by_node - 是否按资源节点过滤
 * @property node - 资源节点
 * @property only_self - 是否只查询当前用户的云主机
 */
export interface GuestFilter {
    by_keywords?: boolean;
    keywords?: string[];
    by_state?: boolean;
    state?: GuestState;
    by_pool?: boolean;
    pool?: string;
    by_node?: boolean;
    node?: string;
    only_self?: boolean;
}
/**
 * 网络接口
 * @interface
 * @property mac_address - MAC地址
 * @property ip_address - IPv4地址
 * @property ip_address_v6 - IPv6地址
 * @property name_servers - 名称服务器
 * @property gateway - 网关
 */
export interface NetworkInterface {
    mac_address: string;
    ip_address?: string;
    ip_address_v6?: string;
    name_servers?: string[];
    gateway?: string;
}
/**
 * QoS配置
 * @interface
 * @property cpu_priority - CPU优先级
 * @property write_speed - 写入速度
 * @property write_iops - 写入IOPS
 * @property read_speed - 读取速度
 * @property read_iops - 读取IOPS
 * @property receive_speed - 接收速度
 * @property send_speed - 发送速度
 */
export interface GuestQoS {
    cpu_priority?: Priority;
    write_speed?: number;
    write_iops?: number;
    read_speed?: number;
    read_iops?: number;
    receive_speed?: number;
    send_speed?: number;
}
/**
 * 任务数据
 * @interface
 * @property id - 任务ID
 * @property type - 任务类型
 * @property status - 任务状态
 * @property progress - 进度,0~100(%)
 * @property error - 错误信息
 * @property updated_time - 更新时间,RFC3339
 * @property expiration - 过期时间,RFC3339
 * @property target - 目标
 * @property cluster - 集群
 * @property pool - 资源池
 * @property guest - 云主机
 * @property volume - 卷
 * @property snapshot - 快照
 */
export interface TaskData {
    id: string;
    type: TaskType;
    status: TaskStatus;
    progress?: number;
    error?: string;
    updated_time?: string;
    expiration?: string;
    target?: string;
    cluster?: string;
    pool?: string;
    guest?: string;
    volume?: string;
    snapshot?: string;
    message?: string;
    node?: string;
    import_source?: string;
}
/**
 * 卷规格
 * @interface
 * @property tag - 标签
 * @property format - 格式
 * @property size - 大小，单位MB
 */
export interface VolumeSpec {
    tag: string;
    format: VolumeFormat;
    size: number;
}
/**
 * 控制用户配置
 * @interface
 * @property name - 用户名
 * @property password - 密码
 * @property disable_password - 禁用密码登录
 * @property ssh_keys - SSH密钥
 * @property is_admin - 是否管理员
 * @property groups - 组列表
 */
export interface ControlUserConfig extends CloudInitUserBase {
    is_admin?: boolean;
    groups?: string[];
}
/**
 * CloudInit配置
 * @interface
 * @property boot_mode - 引导模式
 * @property default_user - 默认用户
 * @property root_disabled - 禁用root用户
 * @property password_disabled - 禁用密码登录
 * @property expire_passwords - 密码过期
 * @property users - 用户列表
 * @property host_key - 主机密钥
 * @property ca_certificates - CA证书列表
 */
export interface ControlCloudInitConfig {
    boot_mode: CloudInitBootMode;
    default_user: CloudInitUserBase;
    root_disabled?: boolean;
    password_disabled?: boolean;
    expire_passwords?: boolean;
    users?: ControlUserConfig[];
    host_key?: string;
    ca_certificates?: string[];
}
/**
 * 云主机配置
 * @interface
 * @property name - 名称
 * @property cores - 核心数
 * @property memory - 内存大小，单位MB
 * @property disks - 磁盘大小列表，单位MB
 * @property source_image - 源镜像
 * @property auto_start - 自动启动
 * @property cloud_init - CloudInit配置
 * @property access_level - 资源访问级别
 */
export interface GuestConfig {
    name: string;
    cores: number;
    memory: number;
    disks: number[];
    source_image?: string;
    auto_start?: boolean;
    cloud_init?: ControlCloudInitConfig;
    qos?: GuestQoS;
    access_level: ResourceAccessLevel;
}
/**
 * 资源节点数据
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property host - 节点主机
 * @property port - 节点端口
 * @property published_host - 发布节点主机
 * @property published_port - 发布节点端口
 * @property tls_enabled - 是否启用TLS
 * @property api_version - API版本
 */
export interface NodeData {
    mode: NodeMode;
    id: string;
    name: string;
    host: string;
    port: number;
    published_host?: string;
    published_port?: number;
    tls_enabled?: boolean;
    api_version?: string;
}
/**
 * 资源节点配置
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property host - 节点主机
 * @property port - 节点端口
 * @property published_host - 发布节点主机
 * @property published_port - 发布节点端口
 * @property tls_enabled - 是否启用TLS
 * @property api_version - API版本
 * @property locale - 区域
 * @property portal_port - 门户端口
 * @property published_portal_port - 发布门户端口
 * @property max_guests - 最大云主机数
 */
export interface NodeConfig extends NodeData {
    locale: Locale;
    portal_port?: number;
    published_portal_port?: number;
    max_guests?: number;
}
/**
 * 资源节点状态
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property host - 节点主机
 * @property port - 节点端口
 * @property published_host - 发布节点主机
 * @property published_port - 发布节点端口
 * @property tls_enabled - 是否启用TLS
 * @property api_version - API版本
 * @property locale - 区域
 * @property portal_port - 门户端口
 * @property published_portal_port - 发布门户端口
 * @property max_guests - 最大云主机数
 * @property modified - 是否修改
 * @property modified_time - 修改时间, RFC3339
 */
export interface NodeConfigStatus extends NodeConfig {
    modified: boolean;
    modified_time?: string;
}
/**
 * 资源节点
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property host - 节点主机
 * @property port - 节点端口
 * @property published_host - 发布节点主机
 * @property published_port - 发布节点端口
 * @property tls_enabled - 是否启用TLS
 * @property api_version - API版本
 * @property public_key - 公钥
 * @property signature_algorithm - 签名算法
 * @property pool - 所属资源池
 * @property disabled - 是否禁用
 */
export interface ClusterNode extends NodeData {
    public_key: string;
    signature_algorithm: string;
    pool?: string;
    disabled?: boolean;
}
/**
 * 资源节点数据
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property host - 节点主机
 * @property port - 节点端口
 * @property published_host - 发布节点主机
 * @property published_port - 发布节点端口
 * @property tls_enabled - 是否启用TLS
 * @property api_version - API版本
 * @property public_key - 公钥
 * @property signature_algorithm - 签名算法
 * @property pool - 所属资源池
 * @property disabled - 是否禁用
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 * @property state - 节点状态
 * @property self - 是否为当前节点
 * @property last_heartbeat - 最后心跳时间, RFC3339
 * @property version - 版本
 * @property upgradable - 是否可升级
 * @property critical - 关键状态数
 * @property alert - 警告状态数
 * @property warning - 警告状态数
 * @property iqn - IQN
 * @property memory_merged - 是否合并内存
 */
export interface ClusterNodeData extends ClusterNode, GuestContainerCapacity {
    state: NodeState;
    self?: boolean;
    last_heartbeat?: string;
    version?: string;
    upgradable?: boolean;
    critical: number;
    alert: number;
    warning: number;
    iqn?: string;
    memory_merged?: boolean;
}
/**
 * SSH密钥
 * @interface
 * @property id - 密钥ID
 * @property label - 密钥标签
 * @property content - 密钥内容
 * @property created_time - 密钥创建时间, RFC3339
 */
export interface SSHKey {
    id: string;
    label: string;
    content: string;
    created_time: string;
}
/**
 * SSH密钥视图
 * @interface
 * @property id - SSH密钥ID
 * @property label - SSH密钥标签
 * @property content - SSH密钥内容
 * @property created_time - SSH密钥创建时间, RFC3339
 * @property permissions - 资源权限
 * @property actions - 可执行的资源操作
 */
export interface SSHKeyView {
    id: string;
    label: string;
    content: string;
    created_time: string;
    permissions: ResourcePermissions;
    actions: ResourceAction[];
}
/**
 * 授权能力
 * @interface
 * @property features - 功能列表
 * @property cluster - 集群数
 * @property nodes - 节点数
 * @property pools - 资源池数
 * @property guests - 云主机数
 */
export interface AuthorizedAbility {
    features: LicenseFeature[];
    cluster: number;
    nodes: number;
    pools?: number;
    guests: number;
}
/**
 * 授权
 * @interface
 * @property id - 授权ID
 * @property version - 版本
 * @property mode - 授权模式
 * @property plan - 计划
 * @property owner - 所有者
 * @property issued_time - 发布时间, RFC3339
 * @property issued_by - 发布人
 * @property issued_serial - 发布序列号
 * @property issued_public_key - 发布公钥
 * @property issued_algorithm - 发布算法
 * @property nonce - 随机数
 * @property signature - 签名
 * @property not_before - 生效时间, RFC3339
 * @property not_after - 失效时间, RFC3339
 * @property features - 功能列表
 * @property cluster - 集群数
 * @property nodes - 节点数
 * @property pools - 资源池数
 * @property guests - 云主机数
 */
export interface License extends AuthorizedAbility {
    id: string;
    version: string;
    mode: AuthorizationMode;
    plan: string;
    owner: string;
    issued_time: string;
    issued_by: string;
    issued_serial: string;
    issued_public_key: string;
    issued_algorithm: SignatureAlgorithm;
    nonce: string;
    signature: string;
    not_before: string;
    not_after: string;
}
/**
 * 授权记录
 * @interface
 * @property id - 授权记录ID
 * @property plan - 计划
 * @property activated - 是否激活
 * @property cluster - 集群数
 * @property nodes - 节点数
 * @property guests - 云主机数
 * @property issued_time - 发布时间, RFC3339
 * @property not_before - 生效时间, RFC3339
 * @property not_after - 失效时间, RFC3339
 */
export interface LicenseRecord {
    id: string;
    plan: string;
    activated?: boolean;
    cluster: number;
    nodes: number;
    guests: number;
    issued_time: string;
    not_before?: string;
    not_after?: string;
}
/**
 * 存储池配置
 * @interface
 * @property id - 存储池ID
 * @property type - 存储池类型
 * @property description - 存储池描述
 * @property uri - 存储池URI
 * @property access_token - 访问令牌
 * @property access_secret - 访问密钥
 * @property lun - LUN ID
 * @property disable_auto_initialize - 禁用自动初始化
 */
export interface StoragePoolConfig {
    id: string;
    type: StorageType;
    description?: string;
    uri?: string;
    access_token?: string;
    access_secret?: string;
    lun?: number;
    disable_auto_initialize?: boolean;
}
/**
 * 快照记录
 * @interface
 * @property id - 快照ID
 * @property label - 快照标签
 * @property created_time - 创建时间, RFC3339
 * @property running - 是否运行
 * @property current - 是否当前快照
 * @property description - 快照描述
 * @property screenshot - 快照截图
 * @property primary - 是否主快照
 */
export interface SnapshotRecord {
    id: string;
    label: string;
    created_time: string;
    running: boolean;
    current?: boolean;
    description?: string;
    screenshot?: string;
    primary?: boolean;
}
/**
 * 快照树节点
 * @interface
 * @property id - 快照ID
 * @property label - 快照标签
 * @property running - 是否运行
 * @property depth - 深度
 * @property current - 是否当前快照
 * @property primary - 是否主快照
 * @property root - 根快照ID
 * @property leafs - 子快照ID列表
 */
export interface SnapshotTreeNode {
    id: string;
    label: string;
    running: boolean;
    depth: number;
    current?: boolean;
    primary?: boolean;
    root?: string;
    leafs?: string[];
}
export interface AddressPoolRecord {
    id: string;
    mode: InterfaceMode;
    is_v6?: boolean;
    description?: string;
}
export interface AddressPool {
    id: string;
    mode: InterfaceMode;
    is_v6?: boolean;
    description?: string;
    internal?: AddressRanges;
    external?: AddressRanges;
}
/**
 * 资源节点容量
 * @interface
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 */
export interface MachineCapacity {
    cores: number;
    memory: number;
    disk: number;
}
/**
 * 资源节点容器容量
 * @interface
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 */
export interface GuestContainerCapacity extends MachineCapacity {
    guests: number;
}
/**
 * 资源节点容器使用
 * @interface
 * @property core_usage - 核心使用率, 100% 表示 100%
 * @property memory_used - 内存使用量, MiB
 * @property disk_used - 磁盘使用量, MiB
 * @property read_bytes_per_second - 读取字节数
 * @property read_packets_per_second - 读取包数
 * @property write_bytes_per_second - 写入字节数
 * @property write_packets_per_second - 写入包数
 * @property received_bytes_per_second - 接收字节数
 * @property received_packets_per_second - 接收包数
 * @property transmitted_bytes_per_second - 发送字节数
 * @property transmitted_packets_per_second - 发送包数
 * @property guest_stopped - 已停止容器数
 * @property guest_running - 运行中容器数
 * @property guest_unkown - 未知容器数
 */
export interface GuestContainerUsage {
    core_usage: number;
    memory_used: number;
    disk_used: number;
    read_bytes_per_second: number;
    read_packets_per_second: number;
    write_bytes_per_second: number;
    write_packets_per_second: number;
    received_bytes_per_second: number;
    received_packets_per_second: number;
    transmitted_bytes_per_second: number;
    transmitted_packets_per_second: number;
    guest_stopped: number;
    guest_running: number;
    guest_unkown: number;
}
/**
 * 资源节点容器快照
 * @interface
 * @property core_usage - 核心使用率, 100% 表示 100%
 * @property memory_used - 内存使用量, MiB
 * @property disk_used - 磁盘使用量, MiB
 * @property read_bytes_per_second - 读取字节数
 * @property read_packets_per_second - 读取包数
 * @property write_bytes_per_second - 写入字节数
 * @property write_packets_per_second - 写入包数
 * @property received_bytes_per_second - 接收字节数
 * @property received_packets_per_second - 接收包数
 * @property transmitted_bytes_per_second - 发送字节数
 * @property transmitted_packets_per_second - 发送包数
 * @property guest_stopped - 已停止容器数
 * @property guest_running - 运行中容器数
 * @property guest_unkown - 未知容器数
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 * @property critical - 致命故障数
 * @property alert - 报警数量
 * @property warning - 警告数量
 * @property timestamp - 时间戳, RFC3339
 */
export interface GuestContainerSnapshot extends GuestContainerCapacity, GuestContainerUsage {
    critical: number;
    alert: number;
    warning: number;
    timestamp: string;
}
/**
 * 资源节点快照
 * @interface
 * @property node_id - 节点ID
 * @property core_usage - 核心使用率, 100% 表示 100%
 * @property memory_used - 内存使用量, MiB
 * @property disk_used - 磁盘使用量, MiB
 * @property read_bytes_per_second - 读取字节数
 * @property read_packets_per_second - 读取包数
 * @property write_bytes_per_second - 写入字节数
 * @property write_packets_per_second - 写入包数
 * @property received_bytes_per_second - 接收字节数
 * @property received_packets_per_second - 接收包数
 * @property transmitted_bytes_per_second - 发送字节数
 * @property transmitted_packets_per_second - 发送包数
 * @property guest_stopped - 已停止容器数
 * @property guest_running - 运行中容器数
 * @property guest_unkown - 未知容器数
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 * @property critical - 致命故障数
 * @property alert - 报警数量
 * @property warning - 警告数量
 * @property timestamp - 时间戳, RFC3339
 */
export interface NodeResourceSnapshot extends GuestContainerSnapshot {
    node_id: string;
}
/**
 * 资源池快照
 * @interface
 * @property pool_id - 资源池ID
 * @property node_online - 在线节点数
 * @property node_offline - 离线节点数
 * @property node_lost - 丢失节点数
 * @property core_usage - 核心使用率, 100% 表示 100%
 * @property memory_used - 内存使用量, MiB
 * @property disk_used - 磁盘使用量, MiB
 * @property read_bytes_per_second - 读取字节数
 * @property read_packets_per_second - 读取包数
 * @property write_bytes_per_second - 写入字节数
 * @property write_packets_per_second - 写入包数
 * @property received_bytes_per_second - 接收字节数
 * @property received_packets_per_second - 接收包数
 * @property transmitted_bytes_per_second - 发送字节数
 * @property transmitted_packets_per_second - 发送包数
 * @property guest_stopped - 已停止容器数
 * @property guest_running - 运行中容器数
 * @property guest_unkown - 未知容器数
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 * @property critical - 致命故障数
 * @property alert - 报警数量
 * @property warning - 警告数量
 * @property timestamp - 时间戳, RFC3339
 */
export interface PoolResourceSnapshot extends GuestContainerSnapshot {
    node_online: number;
    node_offline: number;
    node_lost: number;
    pool_id: string;
}
/**
 * 资源集群快照
 * @interface
 * @property cluster_id - 资源集群ID
 * @property node_online - 在线节点数
 * @property node_offline - 离线节点数
 * @property node_lost - 丢失节点数
 * @property pool_enabled - 启用资源池数
 * @property pool_disabled - 禁用资源池数
 * @property started_time - 启动时间, RFC3339
 * @property core_usage - 核心使用率, 100% 表示 100%
 * @property memory_used - 内存使用量, MiB
 * @property disk_used - 磁盘使用量, MiB
 * @property read_bytes_per_second - 读取字节数
 * @property read_packets_per_second - 读取包数
 * @property write_bytes_per_second - 写入字节数
 * @property write_packets_per_second - 写入包数
 * @property received_bytes_per_second - 接收字节数
 * @property received_packets_per_second - 接收包数
 * @property transmitted_bytes_per_second - 发送字节数
 * @property transmitted_packets_per_second - 发送包数
 * @property guest_stopped - 已停止容器数
 * @property guest_running - 运行中容器数
 * @property guest_unkown - 未知容器数
 * @property cores - 核心数
 * @property memory - 内存大小, MiB
 * @property disk - 磁盘大小, MiB
 * @property guests - 容器数
 * @property critical - 致命故障数
 * @property alert - 报警数量
 * @property warning - 警告数量
 * @property timestamp - 时间戳, RFC3339
 */
export interface ClusterResourceSnapshot extends GuestContainerSnapshot {
    node_online: number;
    node_offline: number;
    node_lost: number;
    pool_enabled: number;
    pool_disabled: number;
    cluster_id: string;
    started_time: string;
}
export interface NodeResourceSnapshotRecord {
    timestamp: string;
    node_id: string;
    fields: number[];
}
export interface PoolResourceSnapshotRecord {
    timestamp: string;
    pool_id: string;
    fields: number[];
}
export interface ClusterResourceSnapshotRecord {
    timestamp: string;
    cluster_id: string;
    started_time: string;
    fields: number[];
}
export interface ComputePoolCapability {
    resource: GuestContainerCapacity;
}
export interface ComputePoolStatus extends ComputePoolConfig, ComputePoolCapability {
}
/**
 * 计算资源池配置
 * @interface
 * @property id - 资源池ID
 * @property strategy - 资源池策略
 * @property description - 资源池描述
 * @property storage - 存储池ID
 * @property address - 地址池ID
 * @property nodes - 节点ID列表
 * @property disabled - 是否禁用
 * @property merge_memory - 是否合并内存
 */
export interface ComputePoolConfig {
    id: string;
    strategy: ComputePoolStrategy;
    description?: string;
    storage?: string;
    address?: string;
    nodes?: string[];
    disabled?: boolean;
    merge_memory?: boolean;
}
/**
 * 计算资源池导入源
 * @interface
 * @property id - 资源池导入源ID
 * @property vendor - 资源池导入源供应商
 * @property url - 资源池导入源URL
 * @property token - 资源池导入源Token
 * @property secret - 资源池导入源Secret
 */
export interface ImportSource {
    id: string;
    vendor: ImportVendor;
    url: string;
    token: string;
    secret: string;
}
/**
 * 计算资源池导入目标
 * @interface
 * @property name - 资源池导入目标名称
 * @property id - 资源池导入目标ID
 * @property source - 资源池导入源ID
 * @property cores - 资源池导入目标核心数
 * @property memory - 资源池导入目标内存大小, MiB
 * @property running - 资源池导入目标是否运行中
 */
export interface ImportTarget {
    name: string;
    id: string;
    source: string;
    cores: number;
    memory: number;
    running?: boolean;
}
/**
 * 文件签名
 * @interface
 * @property signature - 文件签名
 * @property algorithm - 签名算法
 */
export interface FileSignature {
    signature: string;
    algorithm: string;
}
/**
 * 文件规格
 * @interface
 * @property name - 文件名称
 * @property format - 文件格式
 * @property category - 文件分类
 * @property description - 文件描述
 * @property tags - 文件标签
 * @property volume_size_in_mb - 文件大小，单位MB
 */
export interface FileSpec {
    name: string;
    format?: string;
    category?: FileCategory;
    description?: string;
    tags?: string[];
    volume_size_in_mb?: number;
}
/**
 * 文件记录
 * @interface
 * @property name - 文件名称
 * @property format - 文件格式
 * @property category - 文件分类
 * @property description - 文件描述
 * @property tags - 文件标签
 * @property volume_size_in_mb - 文件大小，单位MB
 * @property id - 文件ID
 * @property size - 文件大小，单位B
 * @property version - 文件版本
 * @property checksum - 文件校验和
 * @property sum_algorithm - 校验和算法
 * @property created_time - 创建时间,RFC3339
 * @property modified_time - 修改时间,RFC3339
 */
export interface FileRecord extends FileSpec {
    id: string;
    size?: number;
    version?: number;
    checksum?: string;
    sum_algorithm?: string;
    created_time?: string;
    modified_time?: string;
}
/**
 * 文件状态
 * @interface
 * @property name - 文件名称
 * @property format - 文件格式
 * @property category - 文件分类
 * @property description - 文件描述
 * @property tags - 文件标签
 * @property volume_size_in_mb - 文件大小，单位MB
 * @property id - 文件ID
 * @property size - 文件大小，单位B
 * @property version - 文件版本
 * @property checksum - 文件校验和
 * @property sum_algorithm - 校验和算法
 * @property created_time - 创建时间,RFC3339
 * @property modified_time - 修改时间,RFC3339
 * @property state - 文件状态
 * @property progress - 文件上传进度，单位%
 * @property update_lock - 是否锁定文件上传
 * @property update_expiration - 文件上传锁定过期时间,RFC3339
 * @property reader_count - 文件读取器数量
 * @property reader_expiration - 文件读取器过期时间,RFC3339
 */
export interface FileStatus extends FileRecord {
    state: FileState;
    progress?: number;
    update_lock: boolean;
    update_expiration?: string;
    reader_count: number;
    reader_expiration?: string;
}
/**
 * 文件视图接口，用于描述文件的相关信息
 * @interface
 * @property id - 文件ID
 * @property is_system - 是否为系统文件
 * @property name - 文件名称
 * @property format - 文件格式
 * @property category - 文件分类
 * @property description - 文件描述
 * @property tags - 文件标签
 * @property volume_size_in_mb - 文件大小，单位MB
 * @property size - 文件大小，单位B
 * @property version - 文件版本
 * @property checksum - 文件校验和
 * @property sum_algorithm - 校验和算法
 * @property created_time - 文件创建时间
 * @property modified_time - 文件修改时间
 * @property permissions - 资源权限
 * @property actions - 允许的操作
 */
export interface FileView extends FileSpec {
    id: string;
    is_system?: boolean;
    size?: number;
    version?: number;
    checksum?: string;
    sum_algorithm?: string;
    created_time?: string;
    modified_time?: string;
    permissions: ResourcePermissions;
    actions?: ResourceAction[];
}
/**
 * 集群状态
 * @interface
 * @property nodes - 节点数量
 * @property guests - 云主机数量
 * @property pools - 资源池数量
 * @property tasks - 任务数量
 * @property critical - 严重问题数量
 * @property alert - 问题数量
 * @property warning - 警告数量
 */
export interface ClusterStatus {
    nodes: number;
    guests: number;
    pools: number;
    tasks: number;
    critical: number;
    alert: number;
    warning: number;
}
/**
 * 网络拓扑图节点信息
 * @interface
 * @property mode - 节点模式
 * @property id - 节点ID
 * @property name - 节点名称
 * @property cores - 节点CPU数量
 * @property memory - 节点内存大小，单位MiB
 * @property disk - 节点磁盘大小，单位MiB
 * @property address - 节点IP地址
 * @property published_address - 节点外部访问地址
 * @property disabled - 是否禁用
 * @property state - 节点状态
 * @property upgradable - 是否可升级
 * @property critical - 严重问题数量
 * @property alert - 问题数量
 * @property warning - 警告数量
 */
export interface NetworkGraphNode {
    mode: NodeMode;
    id: string;
    name: string;
    cores: number;
    memory: number;
    disk: number;
    address: string;
    published_address: string;
    disabled?: boolean;
    state: NodeState;
    upgradable?: boolean;
    critical: number;
    alert: number;
    warning: number;
    guests?: NetworkGraphGuest[];
}
/**
 * 网络拓扑图云主机信息
 * @interface
 * @property name - 云主机名称
 * @property id - 云主机ID
 * @property cores - 云主机CPU数量
 * @property memory - 云主机内存大小，单位MiB
 * @property disk - 云主机磁盘大小，单位MiB
 * @property external_addresses - 云主机外部访问地址
 * @property internal_addresses - 云主机内部访问地址
 * @property state - 云主机状态
 * @property media_attached - 是否挂载媒体
 */
export interface NetworkGraphGuest {
    name: string;
    id: string;
    cores: number;
    memory: number;
    disk: number;
    external_addresses?: string[];
    internal_addresses?: string[];
    state: GuestState;
    media_attached?: boolean;
}
/**
 * 告警规则
 * @interface
 * @property enabled - 是否启用
 * @property threshold - 阈值，0~100
 * @property alert_level - 告警等级
 */
export interface AlertRule {
    enabled: boolean;
    threshold: number;
    alert_level: ConsoleEventLevel;
}
/**
 * 机器告警规则
 * @interface
 * @property cpu - CPU告警规则
 * @property memory - 内存告警规则
 * @property disk - 磁盘告警规则
 */
export interface MachineAlertRules {
    cpu: {
        usage: AlertRule;
        cooldown_period: number;
    };
    memory: {
        usage: AlertRule;
        left: AlertRule;
        cooldown_period: number;
    };
    disk: {
        usage: AlertRule;
        left: AlertRule;
        cooldown_period: number;
    };
}
/**
 * 资源监控配置
 * @interface
 * @property guest - 云主机告警规则
 * @property host - 节点告警规则
 */
export interface ResourceMonitorConfig {
    guest: MachineAlertRules;
    host: MachineAlertRules;
}
/**
 * 统计图表数据
 * @interface
 * @property average - 平均值
 * @property peak - 峰值
 * @property valley - 谷值
 * @property timestamp - 时间戳
 */
export interface StatisticChartData extends Record<string, number | string> {
    average: number;
    peak: number;
    valley: number;
    timestamp: string;
}
/**
 * 远程监控响应消息
 * @interface
 * @property protocol - 协议
 * @property secret - 密钥
 * @property url - URL
 * @property published_url - 发布URL
 */
export interface MonitorResponse {
    protocol: string;
    secret: string;
    url: string;
    published_url?: string;
}
/**
 * 云主机管理员密码检查结果
 * @interface
 * @property found - 是否找到
 * @property admin - 管理员
 * @property secret - 密钥
 */
export interface FoundAdminSecret {
    found?: boolean;
    admin?: string;
    secret?: string;
}
export interface AllocatedAddress {
    owner: string;
    used: boolean;
    interfaces?: NetworkInterface[];
}
export interface AddressRange {
    begin: string;
    end: string;
}
export interface AddressRanges {
    ranges?: AddressRange[];
    allocated?: AllocatedAddress[];
}
export interface ConsoleEvent {
    level: ConsoleEventLevel;
    range: ConsoleEventRange;
    id: string;
    source: string;
    category?: ConsoleEventCategory;
    message: string;
    timestamp: string;
}
export interface WarningRecord extends ConsoleEvent {
    is_read?: boolean;
}
export interface WarningStatistic {
    critical: number;
    alert: number;
    warning: number;
}
/**
 * 资源权限
 * @interface
 * @property namespace - 所属命名空间
 * @property owner - 资源所有者
 * @property view - 查看权限
 * @property edit - 编辑权限
 */
export interface ResourcePermissions {
    namespace: string;
    owner: string;
    view: ResourceAccessScope;
    edit: ResourceAccessScope;
}
/**
 * 云主机视图
 * @interface
 * @property name - 云主机名称
 * @property id - 云主机ID
 * @property cores - 云主机核心数
 * @property memory - 云主机内存大小, MiB
 * @property network_mode - 云主机网络模式
 * @property storage_type - 云主机存储类型
 * @property storage_pool - 云主机存储池ID
 * @property address_pool - 云主机地址池ID
 * @property disks - 云主机磁盘规格
 * @property monitor - 云主机监控规格
 * @property boot_image - 云主机启动镜像ID
 * @property network_interfaces - 云主机网络接口
 * @property auto_start - 云主机是否自动启动
 * @property created_time - 云主机创建时间, RFC3339
 * @property system - 云主机系统规格
 * @property cloud_init - 云主机云初始化规格
 * @property qos - 云主机QoS规格
 * @property state - 云主机状态
 * @property media_attached - 云主机是否挂载媒体
 * @property media_source - 云主机媒体源ID
 * @property host_id - 承载节点ID
 * @property host_address - 承载节点地址
 * @property pool - 所属计算资源池
 * @property tools_installed - 云主机是否安装工具
 * @property permissions - 资源权限
 * @property actions - 允许操作清单
 */
export interface GuestView {
    name: string;
    id: string;
    cores: number;
    memory: number;
    network_mode: NetworkMode;
    storage_type: StorageType;
    storage_pool: string;
    address_pool?: string;
    disks: DiskSpec[];
    monitor: MonitorSpec;
    boot_image?: string;
    network_interfaces: NetworkInterfaces;
    auto_start: boolean;
    created_time: string;
    system: GuestSystemSpec;
    cloud_init?: CloudInitSpec;
    qos?: GuestQoS;
    state: GuestState;
    media_attached?: boolean;
    media_source?: string;
    host_id?: string;
    host_address?: string;
    pool?: string;
    tools_installed?: boolean;
    permissions: ResourcePermissions;
    actions: ResourceAction[];
}
/**
 * 查询列表使用
 * @interface
 * @property id - 用户组ID
 * @property members - 成员数量
 * @property roles - 角色数量
 * @property actions - 允许操作清单
 */
export interface UserGroupRecord {
    /** 用户组ID */
    id: string;
    /** 成员数量 */
    members: number;
    /** 角色数量 */
    roles: number;
    actions: ResourceAction[];
}
/**
 * 用户凭证记录
 * @interface
 * @property id - 用户凭证ID
 * @property group - 所属用户组
 * @property password_auth - 是否启用密码认证
 * @property token_count - 令牌数量
 * @property created_time - 创建时间
 * @property last_access - 最后访问时间，格式为RFC3339
 * @property actions - 允许操作清单
 */
export interface UserCredentialRecord {
    /** 用户凭证ID */
    id: string;
    /** 所属用户组 */
    group: string;
    /** 是否启用密码认证 */
    password_auth: boolean;
    /** 令牌数量 */
    token_count: number;
    /** 创建时间 */
    created_time?: string;
    /** 最后访问时间，格式为RFC3339 */
    last_access?: string;
    actions: ResourceAction[];
}
/**
 * 用户组结构体
 * @interface
 * @property id - 用户组ID
 * @property members - 用户完整ID列表，可选字段
 * @property roles - 用户角色列表
 */
export interface UserGroup {
    id: string;
    members?: string[];
    roles: UserRole[];
}
/**
 * 公钥序列号结构体
 * @interface
 * @property serial - 序列号
 * @property algorithm - 签名算法
 * @property public_key - 公钥
 * @property created_time - 创建时间
 * @property not_before - 生效时间
 * @property not_after - 失效时间
 */
export interface PublicKeySerial {
    serial: string;
    algorithm: SignatureAlgorithm;
    public_key: string;
    created_time: string;
    not_before?: string;
    not_after?: string;
}
/**
 * 用户令牌
 * @interface
 * @property serial - 序列号
 * @property algorithm - 签名算法
 * @property public_key - 公钥
 * @property created_time - 创建时间
 * @property not_before - 生效时间
 * @property not_after - 失效时间
 * @property last_access - 最后访问时间，格式为RFC3339
 * @property description - 描述信息
 */
export interface UserToken extends PublicKeySerial {
    /** 最后访问时间，格式为RFC3339 */
    last_access: string;
    /** 描述信息 */
    description?: string;
}
/**
 * 私钥序列化结构
 * @interface
 * @property serial - 序列号
 * @property algorithm - 签名算法
 * @property public_key - 公钥
 * @property created_time - 创建时间
 * @property not_before - 生效时间
 * @property not_after - 失效时间
 * @property private_key - 私钥
 */
export interface PrivateKeySerial extends PublicKeySerial {
    /**
     * 私钥字符串
     */
    private_key: string;
}
/**
 * 私钥结构
 * @interface
 * @property serial - 序列号
 * @property algorithm - 签名算法
 * @property public_key - 公钥
 * @property created_time - 创建时间
 * @property not_before - 生效时间
 * @property not_after - 失效时间
 * @property private_key - 私钥
 * @property id - 私钥ID
 */
export interface PrivateKey extends PrivateKeySerial {
    /**
     * 私钥ID
     */
    id: string;
}
/**
 * 用户授权记录
 * @interface
 * @property id - 用户访问记录ID
 * @property user - 用户名称
 * @property device - 设备名称
 * @property request_address - 请求地址
 * @property access_token_activated - 访问令牌是否激活
 * @property access_token_created_at - 访问令牌创建时间，格式为RFC3339
 * @property access_token_expire_at - 访问令牌过期时间，格式为RFC3339
 * @property refresh_token_created_at - 刷新令牌创建时间，格式为RFC3339
 * @property refresh_token_expire_at - 刷新令牌过期时间，格式为RFC3339
 */
export interface UserAccessRecord {
    id: string;
    user: string;
    device: string;
    request_address?: string;
    access_token_activated: boolean;
    access_token_created_at?: string;
    access_token_expire_at?: string;
    refresh_token_created_at: string;
    refresh_token_expire_at: string;
}
/**
 * 系统状态
 * @interface SystemStatus
 * @property initialized - 系统是否已初始化
 * @property locale - 系统Locale
 */
export interface SystemStatus {
    initialized: boolean;
    locale: Locale;
}
export interface WarningRecordSet extends WarningStatistic, PaginationResult<WarningRecord> {
}
export interface PaginationResult<T> {
    records: T[];
    total: number;
}
/**
 * 后端响应
 * @interface BackendResponse
 * @property error - 错误信息
 * @property data - 数据 payload
 */
export interface BackendResponse<T> {
    error?: string;
    data?: T;
}
/**
 * 后端执行结果
 * @interface BackendResult
 * @property error - 错误信息
 * @property unauthenticated - 是否未认证，令牌校验失败或者过期
 * @property data - 数据 payload
 */
export interface BackendResult<T = void> {
    error?: string;
    unauthenticated?: boolean;
    data?: T;
}
/**
 * 分配的令牌集合
 * @interface AllocatedTokens
 * @property access_token - 访问令牌，格式为 JWT
 * @property refresh_token - 刷新令牌
 * @property csrf_token - CSRF 令牌
 * @property public_key - 公钥
 * @property algorithm - 令牌签名方法
 * @property access_expired_at - 访问令牌过期时间,RFC3339
 * @property refresh_expired_at - 刷新令牌过期时间,RFC3339
 * @property roles - 用户角色列表
 * @property user - 用户名称
 */
export interface AllocatedTokens {
    access_token: string;
    refresh_token: string;
    csrf_token: string;
    public_key: string;
    algorithm: TokenSigningMethod;
    access_expired_at: string;
    refresh_expired_at: string;
    roles: UserRole[];
    user: string;
}
