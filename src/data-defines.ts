/**
 * API使用云主机、镜像等逻辑对象的数据结构定义
 */
import {
  AuthorizationMode,
  CloudInitBootMode,
  ComputePoolStrategy,
  ConsoleEventCategory,
  ConsoleEventLevel,
  ConsoleEventRange,
  DisplayDriver,
  FileCategory,
  FileState,
  GuestDiskMode,
  GuestFirmwareMode,
  GuestSoundModel,
  GuestState,
  GuestTabletMode,
  ImportVendor,
  InterfaceMode,
  LicenseFeature,
  Locale,
  NetworkMode,
  NetworkModelType,
  NodeMode,
  NodeState,
  Priority,
  RemoteProtocol,
  ResourceAccessLevel,
  ResourceAccessScope,
  ResourceAction,
  SignatureAlgorithm,
  StorageType,
  SystemCategory,
  TaskStatus,
  TaskType,
  TokenSigningMethod,
  USBModel,
  UserRole,
  VolumeContainerStrategy,
  VolumeFormat,
} from "./enums";
import { ResourceUsageDurationRecord } from "./request-params";

/**
 * 资源用量值
 * @interface
 * @property {number} average 平均值
 * @property {number} max 最大值
 * @property {number} min 最小值
 */
export interface ResourceStatisticValue {
  average: number;
  max: number;
  min: number;
}
/**
 * 资源用量单位
 * @interface
 * @property {ResourceStatisticValue} cores 核心占用, 0-100
 * @property {ResourceStatisticValue} memory 内存占用, 0-100
 * @property {ResourceStatisticValue} disk 磁盘占用, 0-100
 * @property {number} readRequests 读取请求数
 * @property {number} readBytes 读取字节数
 * @property {number} writeRequests 写入请求数
 * @property {number} writeBytes 写入字节数
 * @property {number} receivedPackets 接收数据包数
 * @property {number} receivedBytes 接收字节数
 * @property {number} transmittedPackets 发送数据包数
 * @property {number} transmittedBytes 发送字节数
 * @property {ResourceStatisticValue} readBytesPerSecond 每秒读取字节数
 * @property {ResourceStatisticValue} readPacketsPerSecond 每秒读取数据包数
 * @property {ResourceStatisticValue} writeBytesPerSecond 每秒写入字节数
 * @property {ResourceStatisticValue} writePacketsPerSecond 每秒写入数据包数
 * @property {ResourceStatisticValue} receivedBytesPerSecond 每秒接收字节数
 * @property {ResourceStatisticValue} receivedPacketsPerSecond 每秒接收数据包数
 * @property {ResourceStatisticValue} transmittedBytesPerSecond 每秒发送字节数
 * @property {ResourceStatisticValue} transmittedPacketsPerSecond 每秒发送数据包数
 * @property {string} timestamp 时间戳,RFC3339
 */
export interface ResourceStatisticUnit {
  cores: ResourceStatisticValue; // core usage, 0-100
  memory: ResourceStatisticValue; // memory usage, 0-100
  disk: ResourceStatisticValue; // disk usage, 0-100
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
  timestamp: string; // ISO string for time.Time
}

/**
 * 区间内资源用量
 * @interface
 * @property {number} cores 核心占用, 0~100(%)
 * @property {number} memory 内存占用, 0~100(%)
 * @property {number} disk 磁盘占用, 0~100(%)
 * @property {number} readRequests 读取请求数
 * @property {number} readBytes 读取字节数
 * @property {number} writeRequests 写入请求数
 * @property {number} writeBytes 写入字节数
 * @property {number} receivedPackets 接收数据包数
 * @property {number} receivedBytes 接收字节数
 * @property {number} transmittedPackets 发送数据包数
 * @property {number} transmittedBytes 发送字节数
 * @property {number} readBytesPerSecond 每秒读取字节数
 * @property {number} readPacketsPerSecond 每秒读取数据包数
 * @property {number} writeBytesPerSecond 每秒写入字节数
 * @property {number} writePacketsPerSecond 每秒写入数据包数
 * @property {number} receivedBytesPerSecond 每秒接收字节数
 * @property {number} receivedPacketsPerSecond 每秒接收数据包数
 * @property {number} transmittedBytesPerSecond 每秒发送字节数
 * @property {number} transmittedPacketsPerSecond 每秒发送数据包数
 * @property {string} timestamp 时间戳,RFC3339
 */
export interface ResourceUsageDuration {
  cores: number; // core usage, 0-100
  memory: number; // memory usage, 0-100
  disk: number; // disk usage, 0-100
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
  timestamp: string; // ISO string for time.Time
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
 * @property {string} uri 卷容器URI
 * @property {boolean} is_default 是否默认
 * @property {boolean} enabled 是否启用
 * @property {string} access_token 访问令牌
 * @property {string} access_secret 访问密钥
 * @property {string} mount_point 挂载点
 * @property {string} fs_entry 文件系统条目
 * @property {string} id 卷容器ID
 * @property {number} lun iSCSI类型的LUN
 * @property {boolean} disable_auto_initialize 禁用自动初始化
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
  lun?: number; // For iSCSI type
  disable_auto_initialize?: boolean; // for block device like iSCSI
}
/**
 * 卷容器状态
 * @interface
 * @property {string} uri 卷容器URI
 * @property {boolean} is_default 是否默认
 * @property {boolean} enabled 是否启用
 * @property {string} access_token 访问令牌
 * @property {string} access_secret 访问密钥
 * @property {string} mount_point 挂载点
 * @property {string} fs_entry 文件系统条目
 * @property {string} id 卷容器ID
 * @property {number} lun iSCSI类型的LUN
 * @property {boolean} disable_auto_initialize 禁用自动初始化
 * @property {number} allocated_volumes 已分配卷数
 * @property {number} used_size 已使用大小
 * @property {number} avaliable_size 可用大小
 * @property {number} max_size 最大大小
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
 * @property {string} id 存储池ID
 * @property {StorageType} type 存储类型
 * @property {VolumeContainerStrategy} strategy 卷容器策略
 * @property {string} description 描述
 * @property {VolumeContainerStatus[]} containers 卷容器状态列表
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
 * @property {string} id 存储池ID
 * @property {StorageType} type 存储类型
 * @property {VolumeContainerStrategy} strategy 卷容器策略
 * @property {string} description 描述
 * @property {number} containers 卷容器数量
 * @property {number} allocated_volumes 已分配卷数
 * @property {number} used_size 已使用大小
 * @property {number} avaliable_size 可用容量
 * @property {number} max_size 最大容量
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
 * @property {string} id 数据存储ID
 * @property {StorageType} type 存储类型
 * @property {VolumeContainerStrategy} strategy 卷容器策略
 * @property {string} description 描述
 * @property {VolumeContainerStatus[]} containers 卷容器状态列表
 * @property {boolean} current 是否当前生效的数据存储
 * @property {string} unique_id iSCSI唯一标识
 */
export interface DataStore extends StoragePool {
  current?: boolean;
  unique_id?: string;
}

export interface ServerResult<T> {
  id?: string; // Task ID for async calls
  error?: string; // Possible error message
  data?: T; // Data payload
}
/**
 * 磁盘规格
 * @interface
 * @property {string} tag 磁盘标签
 * @property {string} uri 磁盘URI
 * @property {VolumeFormat} format 磁盘格式
 * @property {string} device 磁盘设备
 * @property {string} access_token 访问令牌
 * @property {string} access_secret 访问密钥
 * @property {number} size 磁盘大小
 */
export interface DiskSpec {
  tag: string;
  uri: string;
  format: VolumeFormat;
  device?: string;
  access_token?: string;
  access_secret?: string;
  size?: number; // in MiB
}
/**
 * 监控规格
 * @interface
 * @property {string} protocol 协议
 * @property {number} port 端口
 * @property {string} secret 密钥
 */
export interface MonitorSpec {
  protocol: string;
  port: number;
  secret?: string;
}
/**
 * 目标系统规格
 * @interface
 * @property {SystemCategory} category 系统类别
 * @property {GuestDiskMode} removable 光驱接口模式
 * @property {GuestDiskMode} disk 磁盘模式
 * @property {NetworkModelType} network 网络模型类型
 * @property {DisplayDriver} display 显示驱动
 * @property {RemoteProtocol} control 远程协议
 * @property {USBModel} usb USB模型
 * @property {GuestFirmwareMode} firmware 固件模式
 * @property {GuestSoundModel} sound 声音模型
 * @property {GuestTabletMode} tablet 平板模式
 * @property {string} default_volume_group 默认卷组
 * @property {string} default_logical_volume 默认逻辑卷
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
 * @property {string} id 目标系统ID
 * @property {string} label 目标系统标签
 * @property {boolean} is_system 是否系统模板
 * @property {SystemCategory} category 系统类别
 * @property {GuestDiskMode} removable 光驱接口模式
 * @property {GuestDiskMode} disk 磁盘模式
 * @property {NetworkModelType} network 网络模型类型
 * @property {DisplayDriver} display 显示驱动
 * @property {RemoteProtocol} control 远程协议
 * @property {USBModel} usb USB模型
 * @property {GuestFirmwareMode} firmware 固件模式
 * @property {GuestSoundModel} sound 声音模型
 * @property {GuestTabletMode} tablet 平板模式
 * @property {string} default_volume_group 默认卷组
 * @property {string} default_logical_volume 默认逻辑卷
 */
export interface GuestSystemRecord extends GuestSystemSpec {
  id: string;
  label: string;
  is_system?: boolean;
}
/**
 * 目标系统视图
 * @interface
 * @property {string} id 目标系统ID
 * @property {string} label 目标系统标签
 * @property {boolean} is_system 是否系统模板
 * @property {SystemCategory} category 系统类别
 * @property {GuestDiskMode} removable 光驱接口模式
 * @property {GuestDiskMode} disk 磁盘模式
 * @property {NetworkModelType} network 网络模型类型
 * @property {DisplayDriver} display 显示驱动
 * @property {RemoteProtocol} control 远程协议
 * @property {USBModel} usb USB模型
 * @property {GuestFirmwareMode} firmware 固件模式
 * @property {GuestSoundModel} sound 声音模型
 * @property {GuestTabletMode} tablet 平板模式
 * @property {string} default_volume_group 默认卷组
 * @property {string} default_logical_volume 默认逻辑卷
 * @property {ResourcePermissions} permissions 资源权限
 * @property {ResourceAction[]} actions 可执行的资源操作列表
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
 * @property {InterfaceMode} mode 接口模式
 * @property {NetworkInterface[]} internal 内部网络接口
 * @property {NetworkInterface[]} external 外部网络接口
 */
export interface NetworkInterfaces {
  mode: InterfaceMode;
  internal?: NetworkInterface[];
  external?: NetworkInterface[];
}

// CloudInit types and interfaces
export interface CloudInitHostKey {
  algorithm: string;
  public_key: string;
  private_key: string;
  certificate: string;
}
/**
 * CloudInit用户基类
 * @interface
 * @property {string} name 用户名
 * @property {string} password 密码
 * @property {boolean} disable_password 禁用密码登录
 * @property {string[]} ssh_keys SSH密钥
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
 * @property {string} name 用户名
 * @property {string} password 密码
 * @property {boolean} disable_password 禁用密码登录
 * @property {string[]} ssh_keys SSH密钥
 * @property {boolean} is_admin 是否管理员
 * @property {string[]} groups 组
 */
export interface CloudInitUser extends CloudInitUserBase {
  is_admin?: boolean;
  groups?: string[];
}
/**
 * CloudInit CA证书
 * @interface
 * @property {boolean} remove_defaults 是否移除默认证书
 * @property {string[]} trusted 受信任的证书列表
 */
export interface CloudInitCACertificates {
  remove_defaults?: boolean;
  trusted?: string[];
}
/**
 * CloudInit配置
 * @interface
 * @property {CloudInitBootMode} boot_mode 引导模式
 * @property {CloudInitUserBase} default_user 默认用户
 * @property {boolean} root_disabled 禁用root用户
 * @property {boolean} password_disabled 禁用密码登录
 * @property {boolean} expire_passwords 密码过期
 * @property {CloudInitUser[]} users 用户列表
 * @property {CloudInitHostKey} host_key 主机密钥
 * @property {CloudInitCACertificates} ca_certificates CA证书
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
 * @property {string} name 云主机名称
 * @property {string} id 云主机ID
 * @property {number} cores 核心数
 * @property {number} memory 内存大小
 * @property {NetworkMode} network_mode 网络模式
 * @property {StorageType} storage_type 存储类型
 * @property {string} storage_pool 存储池
 * @property {string} address_pool 地址池
 * @property {DiskSpec[]} disks 磁盘规格列表
 * @property {MonitorSpec} monitor 监控规格
 * @property {string} boot_image 引导镜像
 * @property {NetworkInterfaces} network_interfaces 网络接口
 * @property {boolean} auto_start 自动启动
 * @property {string} created_time 创建时间,RFC3339
 * @property {GuestSystemSpec} system 目标系统
 * @property {CloudInitSpec} cloud_init CloudInit配置
 * @property {GuestQoS} qos QoS配置
 */
export interface GuestSpec {
  name: string;
  id: string;
  cores: number;
  memory: number; // in MiB
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
 * @property {string} name 云主机名称
 * @property {string} id 云主机ID
 * @property {number} cores 核心数
 * @property {number} memory 内存大小
 * @property {NetworkMode} network_mode 网络模式
 * @property {StorageType} storage_type 存储类型
 * @property {string} storage_pool 存储池
 * @property {string} address_pool 地址池
 * @property {DiskSpec[]} disks 磁盘规格列表
 * @property {MonitorSpec} monitor 监控规格
 * @property {string} boot_image 引导镜像
 * @property {NetworkInterfaces} network_interfaces 网络接口
 * @property {boolean} auto_start 自动启动
 * @property {string} created_time 创建时间,RFC3339
 * @property {GuestSystemSpec} system 目标系统
 * @property {CloudInitSpec} cloud_init CloudInit配置
 * @property {GuestState} state 云主机状态
 * @property {boolean} media_attached 是否已加载媒体
 * @property {string} media_source 媒体源
 * @property {string} host_id 资源节点ID
 * @property {string} host_address 资源节点地址
 * @property {string} pool 所属计算资源池
 * @property {boolean} tools_installed 是否已安装辅助工具
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
 * @property {boolean} by_keywords 是否按关键词过滤
 * @property {string[]} keywords 关键词列表
 * @property {boolean} by_state 是否按状态过滤
 * @property {GuestState} state 状态
 * @property {boolean} by_pool 是否按资源池过滤
 * @property {string} pool 资源池
 * @property {boolean} by_node 是否按资源节点过滤
 * @property {string} node 资源节点
 * @property {boolean} only_self 是否只查询当前用户的云主机
 */
export interface GuestFilter {
  by_keywords?: boolean;
  keywords?: string[]; // separator: space
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
 * @property {string} mac_address MAC地址
 * @property {string} ip_address IPv4地址
 * @property {string} ip_address_v6 IPv6地址
 * @property {string[]} name_servers 名称服务器
 * @property {string} gateway 网关
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
 * @property {Priority} cpu_priority CPU优先级
 * @property {number} write_speed 写入速度
 * @property {number} write_iops 写入IOPS
 * @property {number} read_speed 读取速度
 * @property {number} read_iops 读取IOPS
 * @property {number} receive_speed 接收速度
 * @property {number} send_speed 发送速度
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
 * @property {string} id 任务ID
 * @property {TaskType} type 任务类型
 * @property {TaskStatus} status 任务状态
 * @property {number} progress 进度,0~100(%)
 * @property {string} error 错误信息
 * @property {string} updated_time 更新时间,RFC3339
 * @property {string} expiration 过期时间,RFC3339
 * @property {string} target 目标
 * @property {string} cluster 集群
 * @property {string} pool 资源池
 * @property {string} guest 云主机
 * @property {string} volume 卷
 * @property {string} snapshot 快照
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
  import_source?: string; // For import tasks
}
/**
 * 卷规格
 * @interface
 * @property {string} tag 标签
 * @property {VolumeFormat} format 格式
 * @property {number} size 大小，单位MB
 */
export interface VolumeSpec {
  tag: string;
  format: VolumeFormat;
  size: number; // in MiB
}
/**
 * 控制用户配置
 * @interface
 * @property {string} name 用户名
 * @property {string} password 密码
 * @property {boolean} disable_password 禁用密码登录
 * @property {string[]} ssh_keys SSH密钥
 * @property {boolean} is_admin 是否管理员
 * @property {string[]} groups 组列表
 */
export interface ControlUserConfig extends CloudInitUserBase {
  is_admin?: boolean;
  groups?: string[];
}
/**
 * CloudInit配置
 * @interface
 * @property {CloudInitBootMode} boot_mode 引导模式
 * @property {CloudInitUserBase} default_user 默认用户
 * @property {boolean} root_disabled 禁用root用户
 * @property {boolean} password_disabled 禁用密码登录
 * @property {boolean} expire_passwords 密码过期
 * @property {ControlUserConfig[]} users 用户列表
 * @property {string} host_key 主机密钥
 * @property {string[]} ca_certificates CA证书列表
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
 * @property {string} name 名称
 * @property {number} cores 核心数
 * @property {number} memory 内存大小，单位MB
 * @property {number[]} disks 磁盘大小列表，单位MB
 * @property {string} source_image 源镜像
 * @property {boolean} auto_start 自动启动
 * @property {ControlCloudInitConfig} cloud_init CloudInit配置
 * @property {ResourceAccessLevel} access_level 资源访问级别
 */
export interface GuestConfig {
  name: string;
  cores: number;
  memory: number; // MB
  disks: number[]; // MB, [sys, data0, data1, ...]
  source_image?: string;
  auto_start?: boolean;
  cloud_init?: ControlCloudInitConfig;
  qos?: GuestQoS;
  access_level: ResourceAccessLevel;
}
/**
 * 资源节点数据
 * @interface
 * @property {NodeMode} mode 节点模式
 * @property {string} id 节点ID
 * @property {string} name 节点名称
 * @property {string} host 节点主机
 * @property {number} port 节点端口
 * @property {string} published_host 发布节点主机
 * @property {number} published_port 发布节点端口
 * @property {boolean} tls_enabled 是否启用TLS
 * @property {string} api_version API版本
 */
export interface NodeData {
  mode: NodeMode;
  id: string;
  name: string;
  host: string;
  port: number; // default: 5851
  published_host?: string;
  published_port?: number;
  tls_enabled?: boolean;
  api_version?: string;
}
/**
 * 资源节点配置
 * @interface
 * @property {NodeMode} mode 节点模式
 * @property {string} id 节点ID
 * @property {string} name 节点名称
 * @property {string} host 节点主机
 * @property {number} port 节点端口
 * @property {string} published_host 发布节点主机
 * @property {number} published_port 发布节点端口
 * @property {boolean} tls_enabled 是否启用TLS
 * @property {string} api_version API版本
 * @property {Locale} locale 区域
 * @property {number} portal_port 门户端口
 * @property {number} published_portal_port 发布门户端口
 * @property {number} max_guests 最大云主机数
 */
export interface NodeConfig extends NodeData {
  locale: Locale;
  portal_port?: number; //default: 5850
  published_portal_port?: number;
  max_guests?: number; //default:200
}
/**
 * 资源节点状态
 * @interface
 * @property {NodeMode} mode 节点模式
 * @property {string} id 节点ID
 * @property {string} name 节点名称
 * @property {string} host 节点主机
 * @property {number} port 节点端口
 * @property {string} published_host 发布节点主机
 * @property {number} published_port 发布节点端口
 * @property {boolean} tls_enabled 是否启用TLS
 * @property {string} api_version API版本
 * @property {Locale} locale 区域
 * @property {number} portal_port 门户端口
 * @property {number} published_portal_port 发布门户端口
 * @property {number} max_guests 最大云主机数
 * @property {boolean} modified 是否修改
 * @property {string} modified_time 修改时间, RFC3339
 */
export interface NodeConfigStatus extends NodeConfig {
  modified: boolean;
  modified_time?: string;
}
/**
 * 资源节点
 * @interface
 * @property {NodeMode} mode 节点模式
 * @property {string} id 节点ID
 * @property {string} name 节点名称
 * @property {string} host 节点主机
 * @property {number} port 节点端口
 * @property {string} published_host 发布节点主机
 * @property {number} published_port 发布节点端口
 * @property {boolean} tls_enabled 是否启用TLS
 * @property {string} api_version API版本
 * @property {string} public_key 公钥
 * @property {string} signature_algorithm 签名算法
 * @property {string} pool 所属资源池
 * @property {boolean} disabled 是否禁用
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
 * @property {NodeMode} mode 节点模式
 * @property {string} id 节点ID
 * @property {string} name 节点名称
 * @property {string} host 节点主机
 * @property {number} port 节点端口
 * @property {string} published_host 发布节点主机
 * @property {number} published_port 发布节点端口
 * @property {boolean} tls_enabled 是否启用TLS
 * @property {string} api_version API版本
 * @property {string} public_key 公钥
 * @property {string} signature_algorithm 签名算法
 * @property {string} pool 所属资源池
 * @property {boolean} disabled 是否禁用
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数
 * @property {NodeState} state 节点状态
 * @property {boolean} self 是否为当前节点
 * @property {string} last_heartbeat 最后心跳时间, RFC3339
 * @property {string} version 版本
 * @property {boolean} upgradable 是否可升级
 * @property {number} critical 关键状态数
 * @property {number} alert 警告状态数
 * @property {number} warning 警告状态数
 * @property {string} iqn IQN
 * @property {boolean} memory_merged 是否合并内存
 */
export interface ClusterNodeData extends ClusterNode, GuestContainerCapacity {
  state: NodeState;
  self?: boolean;
  last_heartbeat?: string; // RFC3339
  version?: string;
  upgradable?: boolean;
  critical: number;
  alert: number;
  warning: number;
  iqn?: string;
  memory_merged?: boolean; // 是否合并内存
}
/**
 * SSH密钥
 * @interface
 * @property {string} id 密钥ID
 * @property {string} label 密钥标签
 * @property {string} content 密钥内容
 * @property {string} created_time 创建时间, RFC3339
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
 * @property {string} id - SSH密钥ID
 * @property {string} label - SSH密钥标签
 * @property {string} content - SSH密钥内容
 * @property {string} created_time - SSH密钥创建时间, RFC3339
 * @property {ResourcePermissions} permissions - 资源权限
 * @property {ResourceAction[]} actions - 可执行的资源操作
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
 * @property {LicenseFeature[]} features 功能列表
 * @property {number} cluster 集群数
 * @property {number} nodes 节点数
 * @property {number} pools 资源池数
 * @property {number} guests 云主机数
 */
export interface AuthorizedAbility {
  features: LicenseFeature[];
  cluster: number;
  nodes: number;
  pools?: number; //deprecated
  guests: number;
}
/**
 * 授权
 * @interface
 * @property {string} id 授权ID
 * @property {string} version 版本
 * @property {AuthorizationMode} mode 授权模式
 * @property {string} plan 计划
 * @property {string} owner 所有者
 * @property {string} issued_time 发布时间, RFC3339
 * @property {string} issued_by 发布人
 * @property {string} issued_serial 发布序列号
 * @property {string} issued_public_key 发布公钥
 * @property {SignatureAlgorithm} issued_algorithm 发布算法
 * @property {string} nonce 随机数
 * @property {string} signature 签名
 * @property {string} not_before 生效时间, RFC3339
 * @property {string} not_after 失效时间, RFC3339
 * @property {LicenseFeature[]} features 功能列表
 * @property {number} cluster 集群数
 * @property {number} nodes 节点数
 * @property {number} pools 资源池数
 * @property {number} guests 云主机数
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
 * @property {string} id 授权记录ID
 * @property {string} plan 计划
 * @property {boolean} activated 是否激活
 * @property {number} cluster 集群数
 * @property {number} nodes 节点数
 * @property {number} guests 云主机数
 * @property {string} issued_time 发布时间, RFC3339
 * @property {string} not_before 生效时间, RFC3339
 * @property {string} not_after 失效时间, RFC3339
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
 * @property {string} id 存储池ID
 * @property {StorageType} type 存储池类型
 * @property {string} description 存储池描述
 * @property {string} uri 存储池URI
 * @property {string} access_token 访问令牌
 * @property {string} access_secret 访问密钥
 * @property {number} lun LUN ID
 * @property {boolean} disable_auto_initialize 禁用自动初始化
 */
export interface StoragePoolConfig {
  id: string;
  type: StorageType;
  description?: string;
  uri?: string; // URI For ceph, path for local
  access_token?: string; // For ceph type
  access_secret?: string; // For ceph type
  lun?: number; // For iSCSI type
  disable_auto_initialize?: boolean; // for block device like iSCSI
}
/**
 * 快照记录
 * @interface
 * @property {string} id 快照ID
 * @property {string} label 快照标签
 * @property {string} created_time 创建时间, RFC3339
 * @property {boolean} running 是否运行
 * @property {boolean} current 是否当前快照
 * @property {string} description 快照描述
 * @property {string} screenshot 快照截图
 * @property {boolean} primary 是否主快照
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
 * @property {string} id 快照ID
 * @property {string} label 快照标签
 * @property {boolean} running 是否运行
 * @property {number} depth 深度
 * @property {boolean} current 是否当前快照
 * @property {boolean} primary 是否主快照
 * @property {string} root 根快照ID
 * @property {string[]} leafs 子快照ID列表
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
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 */
export interface MachineCapacity {
  cores: number;
  memory: number;
  disk: number;
}
/**
 * 资源节点容器容量
 * @interface
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数
 */
export interface GuestContainerCapacity extends MachineCapacity {
  guests: number;
}
/**
 * 资源节点容器使用
 * @interface
 * @property {number} core_usage 核心使用率, 100% 表示 100%
 * @property {number} memory_used 内存使用量, MiB
 * @property {number} disk_used 磁盘使用量, MiB
 * @property {number} read_bytes_per_second 读取字节数
 * @property {number} read_packets_per_second 读取包数
 * @property {number} write_bytes_per_second 写入字节数
 * @property {number} write_packets_per_second 写入包数
 * @property {number} received_bytes_per_second 接收字节数
 * @property {number} received_packets_per_second 接收包数
 * @property {number} transmitted_bytes_per_second 发送字节数
 * @property {number} transmitted_packets_per_second 发送包数
 * @property {number} guest_stopped 已停止容器数
 * @property {number} guest_running 运行中容器数
 * @property {number} guest_unkown 未知容器数
 */
export interface GuestContainerUsage {
  core_usage: number; // base on 100
  memory_used: number; // in MiB
  disk_used: number; // in MiB
  //io
  read_bytes_per_second: number;
  read_packets_per_second: number;
  write_bytes_per_second: number;
  write_packets_per_second: number;
  //network
  received_bytes_per_second: number;
  received_packets_per_second: number;
  transmitted_bytes_per_second: number;
  transmitted_packets_per_second: number;
  //guests
  guest_stopped: number;
  guest_running: number;
  guest_unkown: number;
}
/**
 * 资源节点容器快照
 * @interface
 * @property {number} core_usage 核心使用率, 100% 表示 100%
 * @property {number} memory_used 内存使用量, MiB
 * @property {number} disk_used 磁盘使用量, MiB
 * @property {number} read_bytes_per_second 读取字节数
 * @property {number} read_packets_per_second 读取包数
 * @property {number} write_bytes_per_second 写入字节数
 * @property {number} write_packets_per_second 写入包数
 * @property {number} received_bytes_per_second 接收字节数
 * @property {number} received_packets_per_second 接收包数
 * @property {number} transmitted_bytes_per_second 发送字节数
 * @property {number} transmitted_packets_per_second 发送包数
 * @property {number} guest_stopped 已停止容器数
 * @property {number} guest_running 运行中容器数
 * @property {number} guest_unkown 未知容器数
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数 *
 * @property {number} critical 关键指标
 * @property {number} alert 告警指标
 * @property {number} warning 警告指标
 * @property {string} timestamp 时间戳, RFC3339
 */
export interface GuestContainerSnapshot
  extends GuestContainerCapacity,
    GuestContainerUsage {
  critical: number;
  alert: number;
  warning: number;
  timestamp: string; // RFC3339
}
/**
 * 资源节点快照
 * @interface
 * @property {string} node_id 节点ID
 * @property {number} core_usage 核心使用率, 100% 表示 100%
 * @property {number} memory_used 内存使用量, MiB
 * @property {number} disk_used 磁盘使用量, MiB
 * @property {number} read_bytes_per_second 读取字节数
 * @property {number} read_packets_per_second 读取包数
 * @property {number} write_bytes_per_second 写入字节数
 * @property {number} write_packets_per_second 写入包数
 * @property {number} received_bytes_per_second 接收字节数
 * @property {number} received_packets_per_second 接收包数
 * @property {number} transmitted_bytes_per_second 发送字节数
 * @property {number} transmitted_packets_per_second 发送包数
 * @property {number} guest_stopped 已停止容器数
 * @property {number} guest_running 运行中容器数
 * @property {number} guest_unkown 未知容器数
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数 *
 * @property {number} critical 关键指标
 * @property {number} alert 告警指标
 * @property {number} warning 警告指标
 * @property {string} timestamp 时间戳, RFC3339
 */
export interface NodeResourceSnapshot extends GuestContainerSnapshot {
  node_id: string;
}

/**
 * 资源池快照
 * @interface
 * @property {string} pool_id 资源池ID
 * @property {number} node_online 在线节点数
 * @property {number} node_offline 离线节点数
 * @property {number} node_lost 丢失节点数
 * @property {number} core_usage 核心使用率, 100% 表示 100%
 * @property {number} memory_used 内存使用量, MiB
 * @property {number} disk_used 磁盘使用量, MiB
 * @property {number} read_bytes_per_second 读取字节数
 * @property {number} read_packets_per_second 读取包数
 * @property {number} write_bytes_per_second 写入字节数
 * @property {number} write_packets_per_second 写入包数
 * @property {number} received_bytes_per_second 接收字节数
 * @property {number} received_packets_per_second 接收包数
 * @property {number} transmitted_bytes_per_second 发送字节数
 * @property {number} transmitted_packets_per_second 发送包数
 * @property {number} guest_stopped 已停止容器数
 * @property {number} guest_running 运行中容器数
 * @property {number} guest_unkown 未知容器数
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数 *
 * @property {number} critical 关键指标
 * @property {number} alert 告警指标
 * @property {number} warning 警告指标
 * @property {string} timestamp 时间戳, RFC3339
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
 * @property {string} cluster_id 资源集群ID
 * @property {number} node_online 在线节点数
 * @property {number} node_offline 离线节点数
 * @property {number} node_lost 丢失节点数
 * @property {number} pool_enabled 启用资源池数
 * @property {number} pool_disabled 禁用资源池数
 * @property {string} started_time 启动时间, RFC3339
 * @property {number} core_usage 核心使用率, 100% 表示 100%
 * @property {number} memory_used 内存使用量, MiB
 * @property {number} disk_used 磁盘使用量, MiB
 * @property {number} read_bytes_per_second 读取字节数
 * @property {number} read_packets_per_second 读取包数
 * @property {number} write_bytes_per_second 写入字节数
 * @property {number} write_packets_per_second 写入包数
 * @property {number} received_bytes_per_second 接收字节数
 * @property {number} received_packets_per_second 接收包数
 * @property {number} transmitted_bytes_per_second 发送字节数
 * @property {number} transmitted_packets_per_second 发送包数
 * @property {number} guest_stopped 已停止容器数
 * @property {number} guest_running 运行中容器数
 * @property {number} guest_unkown 未知容器数
 * @property {number} cores 核心数
 * @property {number} memory 内存大小, MiB
 * @property {number} disk 磁盘大小, MiB
 * @property {number} guests 容器数 *
 * @property {number} critical 关键指标
 * @property {number} alert 告警指标
 * @property {number} warning 警告指标
 * @property {string} timestamp 时间戳, RFC3339
 */
export interface ClusterResourceSnapshot extends GuestContainerSnapshot {
  node_online: number;
  node_offline: number;
  node_lost: number;
  pool_enabled: number;
  pool_disabled: number;
  cluster_id: string;
  started_time: string; // RFC3339
}

export interface NodeResourceSnapshotRecord {
  timestamp: string; // RFC3339
  node_id: string;
  fields: number[];
}

export interface PoolResourceSnapshotRecord {
  timestamp: string; // RFC3339
  pool_id: string;
  fields: number[];
}

export interface ClusterResourceSnapshotRecord {
  timestamp: string; // RFC3339
  cluster_id: string;
  started_time: string; // RFC3339
  fields: number[];
}

export interface ComputePoolCapability {
  resource: GuestContainerCapacity;
}

export interface ComputePoolStatus
  extends ComputePoolConfig,
    ComputePoolCapability {}
/**
 * 计算资源池配置
 * @interface
 * @property {string} id 资源池ID
 * @property {ComputePoolStrategy} strategy 资源池策略
 * @property {string} description 资源池描述
 * @property {string} storage 存储池ID
 * @property {string} address 地址池ID
 * @property {string[]} nodes 节点ID列表
 * @property {boolean} disabled 是否禁用
 * @property {boolean} merge_memory 是否合并内存
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
 * @property {string} id 资源池导入源ID
 * @property {ImportVendor} vendor 资源池导入源供应商
 * @property {string} url 资源池导入源URL
 * @property {string} token 资源池导入源Token
 * @property {string} secret 资源池导入源Secret
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
 * @property {string} name 资源池导入目标名称
 * @property {string} id 资源池导入目标ID
 * @property {string} source 资源池导入源ID
 * @property {number} cores 资源池导入目标核心数
 * @property {number} memory 资源池导入目标内存大小, MiB
 * @property {boolean} running 资源池导入目标是否运行中
 */
export interface ImportTarget {
  name: string;
  id: string;
  source: string;
  cores: number;
  memory: number; // in MB
  running?: boolean;
}

/**
 * 文件签名
 * @interface
 * @property {string} signature - 文件签名
 * @property {string} algorithm - 签名算法
 */
export interface FileSignature {
  signature: string;
  algorithm: string;
}
/**
 * 文件规格
 * @interface
 * @property {string} name - 文件名称
 * @property {string} format - 文件格式
 * @property {FileCategory} category - 文件分类
 * @property {string} description - 文件描述
 * @property {string[]} tags - 文件标签
 * @property {number} volume_size_in_mb - 文件大小，单位MB
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
 * @property {string} name - 文件名称
 * @property {string} format - 文件格式
 * @property {FileCategory} category - 文件分类
 * @property {string} description - 文件描述
 * @property {string[]} tags - 文件标签
 * @property {number} volume_size_in_mb - 文件大小，单位MB
 * @property {string} id - 文件ID
 * @property {number} size - 文件大小，单位B
 * @property {number} version - 文件版本
 * @property {string} checksum - 文件校验和
 * @property {string} sum_algorithm - 校验和算法
 * @property {string} created_time - 创建时间,RFC3339
 * @property {string} modified_time - 修改时间,RFC3339
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
 * @property {string} name - 文件名称
 * @property {string} format - 文件格式
 * @property {FileCategory} category - 文件分类
 * @property {string} description - 文件描述
 * @property {string[]} tags - 文件标签
 * @property {number} volume_size_in_mb - 文件大小，单位MB
 * @property {string} id - 文件ID
 * @property {number} size - 文件大小，单位B
 * @property {number} version - 文件版本
 * @property {string} checksum - 文件校验和
 * @property {string} sum_algorithm - 校验和算法
 * @property {string} created_time - 创建时间,RFC3339
 * @property {string} modified_time - 修改时间,RFC3339
 * @property {FileState} state - 文件状态
 * @property {number} progress - 文件上传进度，单位%
 * @property {boolean} update_lock - 是否锁定文件上传
 * @property {string} update_expiration - 文件上传锁定过期时间,RFC3339
 * @property {number} reader_count - 文件读取器数量
 * @property {string} reader_expiration - 文件读取器过期时间,RFC3339
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
 * @property {string} id - 文件ID
 * @property {boolean} is_system - 是否为系统文件
 * @property {string} name - 文件名称
 * @property {string} format - 文件格式
 * @property {FileCategory} category - 文件分类
 * @property {string} description - 文件描述
 * @property {string[]} tags - 文件标签
 * @property {number} volume_size_in_mb - 文件大小，单位MB
 * @property {number} size - 文件大小
 * @property {number} version - 文件版本
 * @property {string} checksum - 文件校验和
 * @property {string} sum_algorithm - 校验和算法
 * @property {string} created_time - 文件创建时间
 * @property {string} modified_time - 文件修改时间
 * @property {ResourcePermissions} permissions - 资源权限
 * @property {ResourceAction[]} actions - 允许的操作
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
 * @property {number} nodes - 节点数量
 * @property {number} guests - 云主机数量
 * @property {number} pools - 资源池数量
 * @property {number} tasks - 任务数量
 * @property {number} critical - 严重问题数量
 * @property {number} alert - 问题数量
 * @property {number} warning - 警告数量
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
 * @property {NodeMode} mode - 节点模式
 * @property {string} id - 节点ID
 * @property {string} name - 节点名称
 * @property {number} cores - 节点CPU数量
 * @property {number} memory - 节点内存大小，单位MiB
 * @property {number} disk - 节点磁盘大小，单位MiB
 * @property {string} address - 节点IP地址
 * @property {string} published_address - 节点外部访问地址
 * @property {boolean} disabled - 是否禁用
 * @property {NodeState} state - 节点状态
 * @property {boolean} upgradable - 是否可升级
 * @property {number} critical - 严重问题数量
 * @property {number} alert - 问题数量
 * @property {number} warning - 警告数量
 */
export interface NetworkGraphNode {
  mode: NodeMode;
  id: string;
  name: string;
  cores: number;
  memory: number; // in MiB
  disk: number; // in MiB
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
 * @property {string} name - 云主机名称
 * @property {string} id - 云主机ID
 * @property {number} cores - 云主机CPU数量
 * @property {number} memory - 云主机内存大小，单位MiB
 * @property {number} disk - 云主机磁盘大小，单位MiB
 * @property {string[]} external_addresses - 云主机外部访问地址
 * @property {string[]} internal_addresses - 云主机内部访问地址
 * @property {GuestState} state - 云主机状态
 * @property {boolean} media_attached - 是否挂载媒体
 */
export interface NetworkGraphGuest {
  name: string;
  id: string;
  cores: number;
  memory: number; // in MiB
  disk: number; // in MiB
  external_addresses?: string[];
  internal_addresses?: string[];
  state: GuestState;
  media_attached?: boolean;
}
/**
 * 告警规则
 * @interface
 * @property {boolean} enabled - 是否启用
 * @property {number} threshold - 阈值，0~100
 * @property {ConsoleEventLevel} alert_level - 告警等级
 */
export interface AlertRule {
  enabled: boolean;
  threshold: number; // 0~100
  alert_level: ConsoleEventLevel;
}
/**
 * 机器告警规则
 * @interface
 * @property {AlertRule} cpu - CPU告警规则
 * @property {AlertRule} memory - 内存告警规则
 * @property {AlertRule} disk - 磁盘告警规则
 */
export interface MachineAlertRules {
  cpu: {
    usage: AlertRule;
    cooldown_period: number; // seconds
  };
  memory: {
    usage: AlertRule;
    left: AlertRule;
    cooldown_period: number; // seconds
  };
  disk: {
    usage: AlertRule;
    left: AlertRule;
    cooldown_period: number; // seconds
  };
}
/**
 * 资源监控配置
 * @interface
 * @property {MachineAlertRules} guest - 云主机告警规则
 * @property {MachineAlertRules} host - 节点告警规则
 */
export interface ResourceMonitorConfig {
  guest: MachineAlertRules;
  host: MachineAlertRules;
}
/**
 * 统计图表数据
 * @interface
 * @extends Record<string, number | string>
 * @property {number} average - 平均值
 * @property {number} peak - 峰值
 * @property {number} valley - 谷值
 * @property {string} timestamp - 时间戳
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
 * @property {string} protocol - 协议
 * @property {string} secret - 密钥
 * @property {string} url - URL
 * @property {string} published_url - 发布URL
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
 * @property {boolean} found - 是否找到
 * @property {string} admin - 管理员
 * @property {string} secret - 密钥
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
 * @property {string} namespace - 所属命名空间
 * @property {string} owner - 资源所有者
 * @property {ResourceAccessScope} view - 查看权限
 * @property {ResourceAccessScope} edit - 编辑权限
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
 * @property {string} name - 云主机名称
 * @property {string} id - 云主机ID
 * @property {number} cores - 云主机核心数
 * @property {number} memory - 云主机内存大小, MiB
 * @property {NetworkMode} network_mode - 云主机网络模式
 * @property {StorageType} storage_type - 云主机存储类型
 * @property {string} storage_pool - 云主机存储池ID
 * @property {string} address_pool - 云主机地址池ID
 * @property {DiskSpec[]} disks - 云主机磁盘规格
 * @property {MonitorSpec} monitor - 云主机监控规格
 * @property {string} boot_image - 云主机启动镜像ID
 * @property {NetworkInterfaces} network_interfaces - 云主机网络接口
 * @property {boolean} auto_start - 云主机是否自动启动
 * @property {string} created_time - 云主机创建时间, RFC3339
 * @property {GuestSystemSpec} system - 云主机系统规格
 * @property {CloudInitSpec} cloud_init - 云主机云初始化规格
 * @property {GuestQoS} qos - 云主机QoS规格
 * @property {GuestState} state - 云主机状态
 * @property {boolean} media_attached - 云主机是否挂载媒体
 * @property {string} media_source - 云主机媒体源ID
 * @property {string} host_id - 承载节点ID
 * @property {string} host_address - 承载节点地址
 * @property {string} pool - 所属计算资源池
 * @property {boolean} tools_installed - 云主机是否安装工具
 * @property {ResourcePermissions} permissions - 资源权限
 * @property {ResourceAction[]} actions - 允许操作清单
 */
export interface GuestView {
  name: string;
  id: string;
  cores: number;
  memory: number; // in MiB
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
 * @property {string} id - 用户组ID
 * @property {number} members - 成员数量
 * @property {number} roles - 角色数量
 * @property {ResourceAction[]} actions - 允许操作清单
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
 * @property {string} id - 用户凭证ID
 * @property {string} group - 所属用户组
 * @property {boolean} password_auth - 是否启用密码认证
 * @property {number} token_count - 令牌数量
 * @property {string} created_time - 创建时间
 * @property {string} last_access - 最后访问时间，格式为RFC3339
 * @property {ResourceAction[]} actions - 允许操作清单
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
 * @property {string} id - 用户组ID
 * @property {string[]} members - 用户完整ID列表，可选字段
 * @property {UserRole[]} roles - 用户角色列表
 */
export interface UserGroup {
  id: string;
  members?: string[]; // list of full user id
  roles: UserRole[];
}
/**
 * 公钥序列号结构体
 * @interface
 * @property {string} serial - 序列号
 * @property {SignatureAlgorithm} algorithm - 签名算法
 * @property {string} public_key - 公钥
 * @property {string} created_time - 创建时间
 * @property {string} [not_before] - 生效时间
 * @property {string} [not_after] - 失效时间
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
 * @property {string} serial - 序列号
 * @property {SignatureAlgorithm} algorithm - 签名算法
 * @property {string} public_key - 公钥
 * @property {string} created_time - 创建时间
 * @property {string} [not_before] - 生效时间
 * @property {string} [not_after] - 失效时间
 * @property {string} last_access - 最后访问时间，格式为RFC3339
 * @property {string} description - 描述信息
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
 * @property {string} serial - 序列号
 * @property {SignatureAlgorithm} algorithm - 签名算法
 * @property {string} public_key - 公钥
 * @property {string} created_time - 创建时间
 * @property {string} [not_before] - 生效时间
 * @property {string} [not_after] - 失效时间
 * @property {string} private_key - 私钥
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
 * @property {string} serial - 序列号
 * @property {SignatureAlgorithm} algorithm - 签名算法
 * @property {string} public_key - 公钥
 * @property {string} created_time - 创建时间
 * @property {string} [not_before] - 生效时间
 * @property {string} [not_after] - 失效时间
 * @property {string} private_key - 私钥
 * @property {string} id - 私钥ID
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
 * @property {string} id - 用户访问记录ID
 * @property {string} user - 用户名称
 * @property {string} device - 设备名称
 * @property {string} [request_address] - 请求地址
 * @property {boolean} access_token_activated - 访问令牌是否激活
 * @property {string} [access_token_created_at] - 访问令牌创建时间，格式为RFC3339
 * @property {string} [access_token_expire_at] - 访问令牌过期时间，格式为RFC3339
 * @property {string} [refresh_token_created_at] - 刷新令牌创建时间，格式为RFC3339
 * @property {string} [refresh_token_expire_at] - 刷新令牌过期时间，格式为RFC3339
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
 * @property {boolean} initialized - 系统是否已初始化
 */
export interface SystemStatus {
  initialized: boolean;
  locale: Locale;
}
export interface WarningRecordSet
  extends WarningStatistic,
    PaginationResult<WarningRecord> {}

// Add this interface before ControlCommandResponse
export interface PaginationResult<T> {
  records: T[];
  total: number;
}

/**
 * 后端响应
 * @interface BackendResponse
 * @param {string} error 错误信息
 * @param {T} data 数据 payload
 */
export interface BackendResponse<T> {
  error?: string;
  data?: T;
}
/**
 * 后端执行结果
 * @interface BackendResult
 * @param {string} error 错误信息
 * @param {boolean} unauthenticated 是否未认证，令牌校验失败或者过期
 * @param {T} data 数据 payload
 */
export interface BackendResult<T = void> {
  error?: string; // Possible error message
  unauthenticated?: boolean;
  data?: T; // Data payload
}

/**
 * 分配的令牌集合
 * @interface AllocatedTokens
 * @property {string} access_token - 访问令牌，格式为 JWT
 * @property {string} refresh_token - 刷新令牌
 * @property {string} csrf_token - CSRF 令牌
 * @property {string} public_key - 公钥
 * @property {TokenSigningMethod} algorithm - 令牌签名方法
 * @property {string} access_expired_at - 访问令牌过期时间,RFC3339
 * @property {string} refresh_expired_at - 刷新令牌过期时间,RFC3339
 * @property {UserRole[]} roles - 用户角色列表
 * @property {string} user - 用户名称
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
