/*
 * API所需枚举定义
 */
/**
 * 控制命令枚举
 * @enum
 *
 */
export enum controlCommandEnum {
  /**
   * 创建云主机
   * 初始化新的虚拟机实例
   */
  CreateGuest = "create_guest",
  /**
   * 删除云主机
   * 移除指定的虚拟机实例
   */
  DeleteGuest = "delete_guest",
  /**
   * 添加卷
   * 为虚拟机添加存储卷
   */
  AddVolume = "add_volume",
  /**
   * 删除卷
   * 移除虚拟机的存储卷
   */
  DeleteVolume = "delete_volume",
  /**
   * 添加外部网卡
   * 为虚拟机添加外部网络接口
   */
  AddExternalInterface = "add_external_interface",
  /**
   * 删除外部网卡
   * 移除虚拟机的外部网络接口
   */
  RemoveExternalInterface = "remove_external_interface",
  /**
   * 添加内部网卡
   * 为虚拟机添加内部网络接口
   */
  AddInternalInterface = "add_internal_interface",
  /**
   * 删除内部网卡
   * 移除虚拟机的内部网络接口
   */
  RemoveInternalInterface = "remove_internal_interface",
  /**
   * 修改CPU
   * 调整虚拟机的CPU配置
   */
  ModifyCPU = "modify_cpu",
  /**
   * 修改内存
   * 调整虚拟机的内存配置
   */
  ModifyMemory = "modify_memory",
  /**
   * 修改主机名
   * 更新虚拟机的主机名
   */
  ModifyHostname = "modify_hostname",
  /**
   * 重置监控密码
   * 重新设置监控访问密码
   */
  ResetMonitor = "reset_monitor",
  /**
   * 启动云主机
   * 开启虚拟机电源
   */
  StartGuest = "start_guest",
  /**
   * 停止云主机
   * 关闭虚拟机电源
   */
  StopGuest = "stop_guest",
  /**
   * 修改密码
   * 更新虚拟机登录密码
   */
  ModifyPassword = "modify_password",
  /**
   * 修改自动启动
   * 调整虚拟机的自动启动设置
   */
  ModifyAutoStart = "modify_autostart",
  /**
   * 获取任务详情
   * 查询指定任务的详细信息
   */
  GetTask = "get_task",
  /**
   * 查询任务列表
   * 获取系统中所有任务的列表
   */
  QueryTasks = "query_tasks",
  /**
   * 添加节点
   * 将新节点加入集群
   */
  AddNode = "add_node",
  /**
   * 移除节点
   * 将节点从集群中移除
   */
  RemoveNode = "remove_node",
  /**
   * 查询节点列表
   * 获取集群中所有节点的信息
   */
  QueryNodes = "query_nodes",
  /**
   * 获取节点详情
   * 查询指定节点的详细信息
   */
  GetNode = "get_node", // 新增
  /**
   * 查询池列表
   * 获取系统中所有资源池的信息
   */
  QueryPools = "query_pools",
  /**
   * 获取池详情
   * 查询指定资源池的详细信息
   */
  GetPool = "get_pool",
  /**
   * 添加池
   * 创建新的资源池
   */
  AddPool = "add_pool",
  /**
   * 修改池
   * 更新资源池的配置信息
   */
  ModifyPool = "modify_pool",
  /**
   * 删除池
   * 移除指定的资源池
   */
  DeletePool = "delete_pool",
  /**
   * 添加池节点
   * 将节点添加到资源池中
   */
  AddPoolNode = "add_pool_node",
  /**
   * 移除池节点
   * 将节点从资源池中移除
   */
  RemovePoolNode = "remove_pool_node",
  /** 查询存储池列表 */
  QueryStoragePools = "query_storage_pools",
  /** 获取存储池详情 */
  GetStoragePool = "get_storage_pool",
  /** 添加存储池 */
  AddStoragePool = "add_storage_pool",
  /** 删除存储池 */
  RemoveStoragePool = "remove_storage_pool",
  /** 修改远程存储策略 */
  ModifyRemoteStorageStrategy = "modify_remote_storage_strategy",
  /** 添加远程容器 */
  AddRemoteContainer = "add_remote_container",
  /** 修改远程容器 */
  ModifyRemoteContainer = "modify_remote_container",
  /** 删除远程容器 */
  RemoveRemoteContainer = "remove_remote_container",
  /** 改变远程容器标志 */
  ChangeRemoteContainerFlag = "change_remote_container_flag",
  /** 查询地址池列表 */
  QueryAddressPools = "query_address_pools",
  /** 获取地址池详情 */
  GetAddressPool = "get_address_pool",
  /** 添加地址池 */
  AddAddressPool = "add_address_pool",
  /** 修改地址池 */
  ModifyAddressPool = "modify_address_pool",
  /** 删除地址池 */
  RemoveAddressPool = "remove_address_pool",
  /** 添加外部地址范围 */
  AddExternalAddressRange = "add_external_address_range",
  /** 删除外部地址范围 */
  RemoveExternalAddressRange = "remove_external_address_range",
  /** 添加内部地址范围 */
  AddInternalAddressRange = "add_internal_address_range",
  /** 删除内部地址范围 */
  RemoveInternalAddressRange = "remove_internal_address_range",
  /** 查询云主机列表 */
  QueryGuests = "query_guests",
  /** 获取云主机详情 */
  GetGuest = "get_guest",
  /** 创建ISO镜像 */
  CreateISO = "create_iso",
  /** 删除ISO镜像 */
  DeleteISO = "delete_iso",
  /** 修改ISO镜像 */
  ModifyISO = "modify_iso",
  /** 获取ISO镜像详情 */
  GetISO = "get_iso",
  /** 查询ISO镜像列表 */
  QueryISO = "query_iso",
  /** 创建磁盘镜像 */
  CreateDisk = "create_disk",
  /** 删除磁盘镜像 */
  DeleteDisk = "delete_disk",
  /** 修改磁盘镜像 */
  ModifyDisk = "modify_disk",
  /** 获取磁盘镜像详情 */
  GetDisk = "get_disk",
  /** 查询磁盘镜像列表 */
  QueryDisk = "query_disk",
  /** 插入媒体 */
  InsertMedia = "insert_media",
  /** 弹出媒体 */
  EjectMedia = "eject_media",
  /** 调整磁盘大小 */
  ResizeDisk = "resize_disk",
  /** 压缩磁盘 */
  ShrinkDisk = "shrink_disk",
  /** 安装磁盘镜像 */
  InstallDiskImage = "install_disk_image",
  /** 创建磁盘镜像 */
  CreateDiskImage = "create_disk_image",
  /** 同步ISO文件 */
  SyncISOFiles = "sync_iso_files",
  /** 同步磁盘文件 */
  SyncDiskFiles = "sync_disk_files",
  /** 查询资源池列表 */
  QueryResourcePools = "query_resource_pools",
  /** 修改资源存储策略 */
  ModifyResourceStorageStrategy = "modify_resource_storage_strategy",
  /** 添加资源容器 */
  AddResourceContainer = "add_resource_container",
  /** 修改资源容器 */
  ModifyResourceContainer = "modify_resource_container",
  /** 删除资源容器 */
  RemoveResourceContainer = "remove_resource_container",
  /** 改变资源容器标志 */
  ChangeResourceContainerFlag = "change_resource_container_flag",
  /** 查询快照列表 */
  QuerySnapshots = "query_snapshots",
  /** 获取快照详情 */
  GetSnapshot = "get_snapshot",
  /** 创建快照 */
  CreateSnapshot = "create_snapshot",
  /** 恢复快照 */
  RestoreSnapshot = "restore_snapshot",
  /** 删除快照 */
  DeleteSnapshot = "delete_snapshot",
  /**
   * 查询资源使用情况
   * 获取系统中各类资源的使用数据
   */
  QueryResourceUsages = "query_resource_usages",
  /**
   * 查询资源统计信息
   * 获取系统中资源的统计数据
   */
  QueryResourceStatistic = "query_resource_statistic",
  /**
   * 查询计算节点
   * 获取系统中所有计算节点的信息
   */
  QueryComputeNodes = "query_compute_nodes",
  /**
   * 查询节点使用情况
   * 获取系统中各节点的资源使用数据
   */
  QueryNodesUsage = "query_nodes_usage",
  /**
   * 查询资源池使用情况
   * 获取系统中各资源池的资源使用数据
   */
  QueryPoolsUsage = "query_pools_usage",
  /**
   * 查询集群使用情况
   * 获取整个集群的资源使用数据
   */
  QueryClusterUsage = "query_cluster_usage",
  /**
   * 启用节点
   * 将指定节点设置为可用状态
   */
  EnableNode = "enable_node",
  /**
   * 禁用节点
   * 将指定节点设置为不可用状态
   */
  DisableNode = "disable_node",
  /**
   * 修改计算池策略
   * 更新计算资源池的分配策略
   */
  ChangeComputePoolStrategy = "change_pool_strategy",
  /**
   * 查询系统列表
   * 获取系统中所有系统实例的信息
   */
  QuerySystems = "query_systems",
  /**
   * 查询日志
   * 获取系统中记录的日志信息
   */
  QueryLogs = "query_logs",
  /**
   * 查询警告信息
   * 获取系统中记录的警告信息
   */
  QueryWarnings = "query_warnings",
  /**
   * 统计警告数量
   * 计算系统中警告信息的总数
   */
  CountWarnings = "count_warnings",
  /**
   * 汇总警告数据
   * 对系统中的警告信息进行汇总统计
   */
  SumWarnings = "sum_warnings",
  /**
   * 移除警告
   * 删除指定的警告信息
   */
  RemoveWarnings = "remove_warnings",
  /**
   * 清除警告
   * 删除系统中所有的警告信息
   */
  ClearWarnings = "clear_warnings",
  /**
   * 将警告标记为已读
   * 将指定的警告信息标记为已读状态
   */
  MarkWarningsAsRead = "mark_warnings_as_read",
  /**
   * 将所有警告标记为已读
   * 将系统中所有的警告信息标记为已读状态
   */
  MarkAllWarningsAsRead = "mark_all_warnings_as_read",
  /**
   * 将所有警告标记为未读
   * 将系统中所有的警告信息标记为未读状态
   */
  MarkAllWarningsAsUnread = "mark_all_warnings_as_unread",
  /**
   * 统计未读警告数量
   * 计算系统中未读警告信息的总数
   */
  CountUnreadWarnings = "count_unread_warnings",
  /**
   * 修改配置
   * 更新系统的配置信息
   */
  ModifyConfig = "modify_config",
  /**
   * 获取配置
   * 获取系统的当前配置信息
   */
  GetConfig = "get_config",
  /**
   * 重启服务
   * 重新启动指定的系统服务
   */
  RestartService = "restart_service",
  /**
   * 添加SSH密钥
   * 向系统中添加新的SSH密钥
   */
  AddSSHKey = "add_ssh_key",
  /**
   * 移除SSH密钥
   * 从系统中删除指定的SSH密钥
   */
  RemoveSSHKey = "remove_ssh_key",
  /**
   * 查询SSH密钥
   * 获取系统中所有SSH密钥的信息
   */
  QuerySSHKeys = "query_ssh_keys",
  /**
   * 激活许可证
   * 对指定的许可证进行激活操作
   */
  ActiveLicense = "active_license",
  /**
   * 获取许可证信息
   * 获取指定许可证的详细信息
   */
  GetLicense = "get_license",
  /**
   * 添加许可证
   * 向系统中添加新的许可证
   */
  AddLicense = "add_license",
  /**
   * 移除许可证
   * 从系统中删除指定的许可证
   */
  RemoveLicense = "remove_license",
  /**
   * 查询许可证列表
   * 获取系统中所有许可证的信息
   */
  QueryLicenses = "query_licenses",
  /**
   * 获取已激活的许可证
   * 获取系统中已激活的许可证信息
   */
  GetActivatedLicense = "get_activated_license",
  /**
   * 查询集群状态
   * 获取整个集群的运行状态信息
   */
  QueryClusterStatus = "query_cluster_status",
  /**
   * 查询网络拓扑图
   * 获取系统的网络拓扑结构信息
   */
  QueryNetworkGraph = "query_network_graph",
  /**
   * 获取监控规则
   * 获取系统中配置的监控规则信息
   */
  GetMonitorRules = "get_monitor_rules",
  /**
   * 设置监控规则
   * 更新系统中的监控规则配置
   */
  SetMonitorRules = "set_monitor_rules",
  /** 清除任务信息 */
  ClearTasks = "clear_tasks",
  /** 重新加载资源节点存储 */
  ReloadResourceStorage = "reload_resource_storage",
  /** 修改磁盘镜像卷容量 */
  UpdateDiskVolumeSize = "update_disk_volume_size",
  /** 重置资源监控规则 */
  ResetMonitorRules = "reset_monitor_rules",
  /** 添加导入源 */
  AddImportSource = "add_import_source",
  /** 移除导入源 */
  RemoveImportSource = "remove_import_source",
  /** 修改导入源 */
  ModifyImportSource = "modify_import_source",
  /** 查询导入源 */
  QueryImportSources = "query_import_sources",
  /** 查询导入目标 */
  QueryImportTargets = "query_import_targets",
  /** 导入云主机 */
  ImportGuests = "import_guests",
  /** 获取系统模板 */
  GetSystem = "get_system",
  /** 添加系统模板 */
  AddSystem = "add_system",
  /** 修改系统模板 */
  ModifySystem = "modify_system",
  /** 移除系统模板 */
  RemoveSystem = "remove_system",
  /** 迁移云主机到节点 */
  MigrateToNode = "migrate_to_node",
  /** 修改外部网卡MAC地址 */
  ModifyExternalInterfaceMAC = "modify_external_interface_mac",
  /** 修改内部网卡MAC地址 */
  ModifyInternalInterfaceMAC = "modify_internal_interface_mac",
  /** 重置系统模板 */
  ResetSystems = "reset_systems",
  /** 查询用户角色 */
  QueryUserRoles = "query_user_roles",
  /** 修改用户组角色 */
  ModifyGroupRoles = "modify_group_roles",
  /** 查询用户角色 */
  GetGroupRoles = "get_group_roles",
  /** 查询用户组成员 */
  QueryGroupMembers = "query_group_members",
  /** 添加用户组 */
  AddGroup = "add_group",
  /** 移除用户组 */
  RemoveGroup = "remove_group",
  /** 查询用户组 */
  QueryGroups = "query_groups",
  /** 添加用户 */
  AddUser = "add_user",
  /** 移除用户 */
  RemoveUser = "remove_user",
  /** 查询用户 */
  QueryUsers = "query_users",
  /** 修改用户组 */
  ChangeUserGroup = "change_user_group",
  /** 查询用户令牌 */
  QueryUserTokens = "query_user_tokens",
  /** 生成用户令牌 */
  GenerateUserToken = "generate_user_token",
  /** 移除用户令牌 */
  RevokeUserToken = "revoke_user_token",
  /** 修改用户密码 */
  ChangeUserSecret = "change_user_secret",
  /** 重置用户密码 */
  ResetUserSecret = "reset_user_secret",
  /** 删除访问授权 */
  RevokeAccess = "revoke_access",
  /** 取消访问授权 */
  InvalidateAccess = "invalidate_access",
  /** 查询访问授权 */
  QueryAccesses = "query_accesses",
  /** 获取系统状态 */
  GetSystemStatus = "get_system_status",
  /** 初始化系统 */
  InitializeSystem = "initialize_system",
  /** 设置系统资源 */
  SetSystemResource = "set_system_resource",
  /** 获取资源权限 */
  GetResourcePermissions = "get_resource_permissions",
  /** 设置资源权限 */
  SetResourcePermissions = "set_resource_permissions",
  /** 添加白名单 */
  AddWhiteList = "add_white_list",
  /** 移除白名单 */
  RemoveWhiteList = "remove_white_list",
  /** 更新白名单 */
  UpdateWhiteList = "update_white_list",
  /** 查询白名单 */
  QueryWhiteList = "query_white_list",
  /** 注销设备 */
  LogoutDevice = "logout_device",
  /** 查询设备 */
  QueryDevices = "query_devices",
}
/**
 * 任务类型枚举
 * @enum
 */
export enum TaskType {
  /**
   * 创建云主机任务
   * 对应控制命令: create_guest
   */
  CreateGuest = "create_guest",
  /**
   * 删除云主机任务
   * 对应控制命令: delete_guest
   */
  DeleteGuest = "delete_guest",
  /**
   * 添加卷任务
   * 对应控制命令: add_volume
   */
  AddVolume = "add_volume",
  /**
   * 删除卷任务
   * 对应控制命令: delete_volume
   */
  DeleteVolume = "delete_volume",
  /**
   * 添加外部接口任务
   * 对应控制命令: add_external_interface
   */
  AddExternalInterface = "add_external_interface",
  /**
   * 移除外部接口任务
   * 对应控制命令: remove_external_interface
   */
  RemoveExternalInterface = "remove_external_interface",
  /**
   * 添加内部接口任务
   * 对应控制命令: add_internal_interface
   */
  AddInternalInterface = "add_internal_interface",
  /**
   * 移除内部接口任务
   * 对应控制命令: remove_internal_interface
   */
  RemoveInternalInterface = "remove_internal_interface",
  /**
   * 修改CPU任务
   * 对应控制命令: modify_cpu
   */
  ModifyCPU = "modify_cpu",
  /**
   * 修改内存任务
   * 对应控制命令: modify_memory
   */
  ModifyMemory = "modify_memory",
  /**
   * 修改主机名任务
   * 对应控制命令: modify_hostname
   */
  ModifyHostname = "modify_hostname",
  /**
   * 重置监控密码任务
   * 对应控制命令: reset_monitor
   */
  ResetMonitor = "reset_monitor",
  /**
   * 启动云主机任务
   * 对应控制命令: start_guest
   */
  StartGuest = "start_guest",
  /**
   * 停止云主机任务
   * 对应控制命令: stop_guest
   */
  StopGuest = "stop_guest",
  /**
   * 修改密码任务
   * 对应控制命令: modify_password
   */
  ModifyPassword = "modify_password",
  /**
   * 修改自动启动任务
   * 对应控制命令: modify_autostart
   */
  ModifyAutoStart = "modify_autostart",
  /**
   * 插入介质任务
   * 对应控制命令: insert_media
   */
  InsertMedia = "insert_media",
  /**
   * 弹出介质任务
   * 对应控制命令: eject_media
   */
  EjectMedia = "eject_media",
  /**
   * 调整磁盘大小任务
   * 对应控制命令: resize_disk
   */
  ResizeDisk = "resize_disk",
  /**
   * 收缩磁盘任务
   * 对应控制命令: shrink_disk
   */
  ShrinkDisk = "shrink_disk",
  /**
   * 安装磁盘镜像任务
   * 对应控制命令: install_disk_image
   */
  InstallDiskImage = "install_disk_image",
  /**
   * 创建磁盘镜像任务
   * 对应控制命令: create_disk_image
   */
  CreateDiskImage = "create_disk_image",
  /**
   * 同步ISO文件任务
   * 对应控制命令: sync_iso_files
   */
  SyncISOFiles = "sync_iso_files",
  /**
   * 同步磁盘文件任务
   * 对应控制命令: sync_disk_files
   */
  SyncDiskFiles = "sync_disk_files",
  /**
   * 创建快照任务
   * 对应控制命令: create_snapshot
   */
  CreateSnapshot = "create_snapshot",
  /**
   * 删除快照任务
   * 对应控制命令: delete_snapshot
   */
  DeleteSnapshot = "delete_snapshot",
  /**
   * 恢复快照任务
   * 对应控制命令: restore_snapshot
   */
  RestoreSnapshot = "restore_snapshot",
  /**
   * 添加远程存储容器任务
   * 对应控制命令: add_remote_container
   */
  AddRemoteContainer = "add_remote_container",
  /**
   * 修改远程存储容器任务
   * 对应控制命令: modify_remote_container
   */
  ModifyRemoteContainer = "modify_remote_container",
  /**
   * 移除远程存储容器任务
   * 对应控制命令: remove_remote_container
   */
  RemoveRemoteContainer = "remove_remote_container",
  /**
   * 重新加载资源存储任务
   * 对应控制命令: reload_resource_storage
   */
  ReloadResourceStorage = "reload_resource_storage",
  /**
   * 导入云主机任务
   * 对应控制命令: import_guests
   */
  ImportGuests = "import_guests",
  /**
   * 迁移到节点任务
   * 对应控制命令: migrate_to_node
   */
  MigrateToNode = "migrate_to_node",
}

/**
 * 资源类型枚举
 * @enum
 */
export enum ResourceType {
  /** SSH密钥   */
  SSHKey = "ssh_key",
  /** 系统模板   */
  System = "system",
  /** 磁盘镜像   */
  DiskImage = "disk_image",
  /** 光盘镜像资源   */
  ISOImage = "iso_image",
  /** 云主机资源    */
  Guest = "guest",
}

/**
 * 资源访问权限枚举
 * @enum
 */
export enum ResourceAccessLevel {
  /**
   * 全局可见权限
   * 所有用户均可查看该资源
   */
  GlobalView = "global_view",
  /**
   * 共享编辑权限
   * 同命名空间用户可查看和编辑该资源
   */
  ShareEdit = "share_edit",
  /**
   * 共享查看权限
   * 同命名空间用户可查看但不可编辑该资源
   */
  ShareView = "share_view",
  /**
   * 私有权限
   * 仅资源所有者可访问
   */
  Private = "private",
}

/**
 * 资源操作权限枚举
 * @enum
 */
export enum ResourceAction {
  /**
   * 查看权限
   * 允许查看资源信息
   */
  View = "view",
  /**
   * 编辑权限
   * 允许修改资源信息
   */
  Edit = "edit",
  /**
   * 删除权限
   * 允许移除资源
   */
  Delete = "delete",
}

/**
 * 资源访问范围枚举
 * @enum
 */
export enum ResourceAccessScope {
  /**
   * 所有人可访问
   * 系统中所有用户均可访问该资源
   */
  All = "all",
  /**
   * 同命名空间可访问
   * 仅同一命名空间内的用户可访问该资源
   */
  Namespace = "namespace",
  /**
   * 私有访问范围
   * 仅资源所有者可访问
   */
  Private = "private",
}
/**
 * 资源统计指标字段枚举
 * @enum
 */
export enum StatisticUnitRecordField {
  /**
   * CPU核心使用率平均值
   * 单位时间内CPU核心的平均使用率
   */
  CoresAverage,
  /**
   * CPU核心使用率最大值
   * 单位时间内CPU核心的最高使用率
   */
  CoresMax,
  /**
   * CPU核心使用率最小值
   * 单位时间内CPU核心的最低使用率
   */
  CoresMin,
  /**
   * 内存使用率平均值
   * 单位时间内内存的平均使用率
   */
  MemoryAverage,
  /**
   * 内存使用率最大值
   * 单位时间内内存的最高使用率
   */
  MemoryMax,
  /**
   * 内存使用率最小值
   * 单位时间内内存的最低使用率
   */
  MemoryMin,
  /**
   * 磁盘使用率平均值
   * 单位时间内磁盘的平均使用率
   */
  DiskAverage,
  /**
   * 磁盘使用率最大值
   * 单位时间内磁盘的最高使用率
   */
  DiskMax,
  /**
   * 磁盘使用率最小值
   * 单位时间内磁盘的最低使用率
   */
  DiskMin,
  /**
   * 读请求数量
   * 单位时间内的磁盘读操作次数
   */
  ReadRequests,
  /**
   * 读字节数
   * 单位时间内的磁盘读取数据量
   */
  ReadBytes,
  /**
   * 写请求数量
   * 单位时间内的磁盘写操作次数
   */
  WriteRequests,
  /**
   * 写字节数
   * 单位时间内的磁盘写入数据量
   */
  WriteBytes,
  /**
   * 接收数据包数量
   * 单位时间内网络接收的数据包总数
   */
  ReceivedPackets,
  /**
   * 接收字节数
   * 单位时间内网络接收的数据总量
   */
  ReceivedBytes,
  /**
   * 发送数据包数量
   * 单位时间内网络发送的数据包总数
   */
  TransmittedPackets,
  /**
   * 发送字节数
   * 单位时间内网络发送的数据总量
   */
  TransmittedBytes,
  /**
   * 每秒读字节数平均值
   * 单位时间内每秒读取数据量的平均值
   */
  ReadBytesPerSecondAverage,
  /**
   * 每秒读字节数最大值
   * 单位时间内每秒读取数据量的最大值
   */
  ReadBytesPerSecondMax,
  /**
   * 每秒读字节数最小值
   * 单位时间内每秒读取数据量的最小值
   */
  ReadBytesPerSecondMin,
  /**
   * 每秒读数据包平均值
   * 单位时间内每秒读取数据包的平均值
   */
  ReadPacketsPerSecondAverage,
  /**
   * 每秒读数据包最大值
   * 单位时间内每秒读取数据包的最大值
   */
  ReadPacketsPerSecondMax,
  /**
   * 每秒读数据包最小值
   * 单位时间内每秒读取数据包的最小值
   */
  ReadPacketsPerSecondMin,
  /**
   * 每秒写字节数平均值
   * 单位时间内每秒写入数据量的平均值
   */
  WriteBytesPerSecondAverage,
  /**
   * 每秒写字节数最大值
   * 单位时间内每秒写入数据量的最大值
   */
  WriteBytesPerSecondMax,
  /**
   * 每秒写字节数最小值
   * 单位时间内每秒写入数据量的最小值
   */
  WriteBytesPerSecondMin,
  /**
   * 每秒写数据包平均值
   * 单位时间内每秒写入数据包的平均值
   */
  WritePacketsPerSecondAverage,
  /**
   * 每秒写数据包最大值
   * 单位时间内每秒写入数据包的最大值
   */
  WritePacketsPerSecondMax,
  /**
   * 每秒写数据包最小值
   * 单位时间内每秒写入数据包的最小值
   */
  WritePacketsPerSecondMin,
  /**
   * 每秒接收字节数平均值
   * 单位时间内每秒网络接收数据量的平均值
   */
  ReceivedBytesPerSecondAverage,
  /**
   * 每秒接收字节数最大值
   * 单位时间内每秒网络接收数据量的最大值
   */
  ReceivedBytesPerSecondMax,
  /**
   * 每秒接收字节数最小值
   * 单位时间内每秒网络接收数据量的最小值
   */
  ReceivedBytesPerSecondMin,
  /**
   * 每秒接收数据包平均值
   * 单位时间内每秒网络接收数据包的平均值
   */
  ReceivedPacketsPerSecondAverage,
  /**
   * 每秒接收数据包最大值
   * 单位时间内每秒网络接收数据包的最大值
   */
  ReceivedPacketsPerSecondMax,
  /**
   * 每秒接收数据包最小值
   * 单位时间内每秒网络接收数据包的最小值
   */
  ReceivedPacketsPerSecondMin,
  /**
   * 每秒发送字节数平均值
   * 单位时间内每秒网络发送数据量的平均值
   */
  TransmittedBytesPerSecondAverage,
  /**
   * 每秒发送字节数最大值
   * 单位时间内每秒网络发送数据量的最大值
   */
  TransmittedBytesPerSecondMax,
  /**
   * 每秒发送字节数最小值
   * 单位时间内每秒网络发送数据量的最小值
   */
  TransmittedBytesPerSecondMin,
  /**
   * 每秒发送数据包平均值
   * 单位时间内每秒网络发送数据包的平均值
   */
  TransmittedPacketsPerSecondAverage,
  /**
   * 每秒发送数据包最大值
   * 单位时间内每秒网络发送数据包的最大值
   */
  TransmittedPacketsPerSecondMax,
  /**
   * 每秒发送数据包最小值
   * 单位时间内每秒网络发送数据包的最小值
   */
  TransmittedPacketsPerSecondMin,
  /**
   * 统计字段总数
   * 记录统计字段的总数量
   */
  Count,
}
/**
 * 资源快照字段枚举
 * @enum
 */
export enum ResourceSnapshotField {
  /**
   * 严重警报数量
   * 资源快照中记录的严重级别警报总数
   */
  Critical,
  /**
   * 警告警报数量
   * 资源快照中记录的警告级别警报总数
   */
  Alert,
  /**
   * 一般警告数量
   * 资源快照中记录的一般级别警告总数
   */
  Warning,
  /**
   * CPU核心数量
   * 资源分配的CPU核心总数
   */
  Cores,
  /**
   * 内存容量
   * 资源分配的内存总容量(GB)
   */
  Memory,
  /**
   * 磁盘容量
   * 资源分配的磁盘总容量(GB)
   */
  Disk,
  /**
   * 云主机数量
   * 当前活动的云主机实例总数
   */
  Guests,
  /**
   * CPU核心使用率
   * CPU核心的总体使用率百分比
   */
  CoreUsage,
  /**
   * 已用内存
   * 已使用的内存容量(GB)
   */
  MemoryUsed,
  /**
   * 已用磁盘
   * 已使用的磁盘容量(GB)
   */
  DiskUsed,
  /**
   * 读取字节数
   * 累计读取的磁盘数据量(GB)
   */
  ReadBytes,
  /**
   * 读取数据包数
   * 累计读取的网络数据包数量
   */
  ReadPackets,
  /**
   * 写入字节数
   * 累计写入的磁盘数据量(GB)
   */
  WriteBytes,
  /**
   * 写入数据包数
   * 累计写入的网络数据包数量
   */
  WritePackets,
  /**
   * 接收字节数
   * 累计接收的网络数据量(GB)
   */
  ReceivedBytes,
  /**
   * 接收数据包数
   * 累计接收的网络数据包数量
   */
  ReceivedPackets,
  /**
   * 发送字节数
   * 累计发送的网络数据量(GB)
   */
  TransmittedBytes,
  /**
   * 发送数据包数
   * 累计发送的网络数据包数量
   */
  TransmittedPackets,
  /**
   * 已停止云主机数量
   * 处于停止状态的云主机实例数量
   */
  GuestStopped,
  /**
   * 运行中云主机数量
   * 处于运行状态的云主机实例数量
   */
  GuestRunning,
  /**
   * 状态未知云主机数量
   * 状态无法确定的云主机实例数量
   */
  GuestUnknown,
  /**
   * 在线节点数量
   * 处于在线状态的集群节点数量
   */
  NodeOnline,
  /**
   * 离线节点数量
   * 处于离线状态的集群节点数量
   */
  NodeOffline,
  /**
   * 丢失节点数量
   * 完全失去连接的集群节点数量
   */
  NodeLost,
  /**
   * 启用状态池数量
   * 处于启用状态的资源池数量
   */
  PoolEnabled,
  /**
   * 禁用状态池数量
   * 处于禁用状态的资源池数量
   */
  PoolDisabled,
  /**
   * 字段总数
   * 资源快照字段的总数量
   */
  Count,
}

/**
 * 资源使用时长字段枚举
 * @enum
 */
export enum ResourceUsageDurationField {
  /**
   * CPU核心使用时长
   * 资源占用CPU核心的累计时长(分钟)
   */
  Cores,
  /**
   * 内存使用时长
   * 资源占用内存的累计时长(分钟)
   */
  Memory,
  /**
   * 磁盘使用时长
   * 资源占用磁盘的累计时长(分钟)
   */
  Disk,
  /**
   * 读请求累计次数
   * 资源产生的磁盘读请求总次数
   */
  ReadRequests,
  /**
   * 读字节数累计
   * 资源产生的磁盘读取数据总量(GB)
   */
  ReadBytes,
  /**
   * 写请求累计次数
   * 资源产生的磁盘写请求总次数
   */
  WriteRequests,
  /**
   * 写字节数累计
   * 资源产生的磁盘写入数据总量(GB)
   */
  WriteBytes,
  /**
   * 接收数据包累计次数
   * 资源产生的网络接收数据包总次数
   */
  ReceivedPackets,
  /**
   * 接收字节数累计
   * 资源产生的网络接收数据总量(GB)
   */
  ReceivedBytes,
  /**
   * 发送数据包累计次数
   * 资源产生的网络发送数据包总次数
   */
  TransmittedPackets,
  /**
   * 发送字节数累计
   * 资源产生的网络发送数据总量(GB)
   */
  TransmittedBytes,
  /**
   * 每秒读字节数
   * 资源的磁盘读取速率(GB/秒)
   */
  ReadBytesPerSecond,
  /**
   * 每秒读数据包数
   * 资源的磁盘读请求速率(次/秒)
   */
  ReadPacketsPerSecond,
  /**
   * 每秒写字节数
   * 资源的磁盘写入速率(GB/秒)
   */
  WriteBytesPerSecond,
  /**
   * 每秒写数据包数
   * 资源的磁盘写请求速率(次/秒)
   */
  WritePacketsPerSecond,
  /**
   * 每秒接收字节数
   * 资源的网络接收速率(GB/秒)
   */
  ReceivedBytesPerSecond,
  /**
   * 每秒接收数据包数
   * 资源的网络接收请求速率(次/秒)
   */
  ReceivedPacketsPerSecond,
  /**
   * 每秒发送字节数
   * 资源的网络发送速率(GB/秒)
   */
  TransmittedBytesPerSecond,
  /**
   * 每秒发送数据包数
   * 资源的网络发送请求速率(次/秒)
   */
  TransmittedPacketsPerSecond,
  /**
   * 字段总数
   * 资源使用时长字段的总数量
   */
  Count,
}
/**
 * 系统类别枚举
 * @enum
 */
export enum SystemCategory {
  /**
   * Linux操作系统
   * 包括所有Linux发行版系统
   */
  Linux = "linux",
  /**
   * BSD操作系统
   * 包括FreeBSD等BSD系列系统
   */
  BSD = "freebsd",
  /**
   * macOS操作系统
   * Apple的macOS系统
   */
  MacOS = "macos",
  /**
   * Windows操作系统
   * Microsoft的Windows系统
   */
  Windows = "windows",
}
/**
 * 云主机磁盘模式枚举
 * @enum
 */
export enum GuestDiskMode {
  /**
   * 禁用磁盘接口
   * 不使用任何磁盘接口
   */
  Disabled = "disabled",
  /**
   * IDE磁盘接口
   * 传统并行接口，兼容性好但性能较低
   */
  IDE = "ide",
  /**
   * SCSI磁盘接口
   * 小型计算机系统接口，支持多设备连接
   */
  SCSI = "scsi",
  /**
   * VirtIO磁盘接口
   * 虚拟化专用接口，性能最优
   */
  VirtIO = "virtio",
  /**
   * USB磁盘接口
   * 通用串行总线接口
   */
  USB = "usb",
  /**
   * SATA磁盘接口
   * 串行高级技术附件接口
   */
  SATA = "sata",
  /**
   * SD卡接口
   * 安全数字卡接口
   */
  SD = "sd",
}
/**
 * 网络模型类型枚举
 * @enum
 */
export enum NetworkModelType {
  /**
   * VirtIO网络模型
   * 半虚拟化网络驱动，性能优异
   */
  VIRTIO = "virtio",
  /**
   * VirtIO过渡版本
   * 兼容传统VirtIO驱动的过渡版本
   */
  VIRTIOTransitional = "virtio-transitional",
  /**
   * VirtIO非过渡版本
   * 最新VirtIO标准，不兼容旧驱动
   */
  VIRTIONonTransitional = "virtio-non-transitional",
  /**
   * Intel E1000网络模型
   * 模拟Intel千兆网卡
   */
  E1000 = "e1000",
  /**
   * Intel E1000E网络模型
   * 增强版Intel千兆网卡
   */
  E1000E = "e1000e",
  /**
   * Intel IGB网络模型
   * 模拟Intel万兆网卡
   */
  IGB = "igb",
  /**
   * Realtek RTL8139网络模型
   * 模拟Realtek快速以太网网卡
   */
  RTL8139 = "rtl8139",
  /**
   * Netfront网络模型
   * Xen前端网络驱动
   */
  Netfront = "netfront",
  /**
   * USB网络模型
   * USB网络适配器
   */
  USBNet = "usb-net",
  /**
   * SPAPR VLAN网络模型
   * PowerPC架构VLAN网络
   */
  SPAPRVLAN = "spapr-vlan",
  /**
   * LAN9118网络模型
   * SMSC LAN9118以太网控制器
   */
  LAN9118 = "lan9118",
  /**
   * SCM91C111网络模型
   * 模拟SCM91C111网卡
   */
  SCM91C111 = "scm91c111",
  /**
   * VLANCE网络模型
   * AMD Lance网卡
   */
  VLANCE = "vlance",
  /**
   * VMXNET网络模型
   * VMware早期虚拟网卡
   */
  VMXNET = "vmxnet",
  /**
   * VMXNET2网络模型
   * VMware增强型虚拟网卡
   */
  VMXNET2 = "vmxnet2",
  /**
   * VMXNET3网络模型
   * VMware高性能虚拟网卡
   */
  VMXNET3 = "vmxnet3",
  /**
   * Am79C970A网络模型
   * AMD PCnet-PCI II网卡
   */
  Am79C970A = "Am79C970A",
  /**
   * Am79C973网络模型
   * AMD PCnet-FAST III网卡
   */
  Am79C973 = "Am79C973",
  /**
   * 82540EM网络模型
   * Intel PRO/1000 MT网卡
   */
  Model82540EM = "82540EM",
  /**
   * 82545EM网络模型
   * Intel PRO/1000 GT网卡
   */
  Model82545EM = "82545EM",
  /**
   * 82543GC网络模型
   * Intel PRO/1000 T网卡
   */
  Model82543GC = "82543GC",
}
/**
 * 显示驱动枚举
 * @enum
 */
export enum DisplayDriver {
  /**
   * Cirrus显示驱动
   * 传统VGA兼容显示适配器，兼容性好
   */
  Cirrus = "cirrus",
  /**
   * 无显示驱动
   * 禁用显示输出
   */
  None = "none",
  /**
   * QXL显示驱动
   * 高性能虚拟化显示适配器
   */
  QXL = "qxl",
  /**
   * VGA显示驱动
   * 标准VGA显示适配器
   */
  VGA = "vga",
  /**
   * VirtIO显示驱动
   * 虚拟化专用显示适配器，性能优异
   */
  VirtIO = "virtio",
}
/**
 * 远程协议枚举
 * @enum
 */
export enum RemoteProtocol {
  /**
   * SPICE远程协议
   * 高性能远程桌面协议，支持音频和USB重定向
   */
  SPICE = "spice",
  /**
   * VNC远程协议
   * 虚拟网络计算协议，广泛兼容各种平台
   */
  VNC = "vnc",
}
/**
 * USB控制器模型枚举
 * @enum
 */
export enum USBModel {
  /**
   * 禁用USB控制器
   * 不启用任何USB控制器
   */
  Disabled = "none",
  /**
   * PIIX3 UHCI控制器
   * Intel PIIX3芯片组USB 1.1控制器
   */
  PIIX3UHCI = "piix3-uhci",
  /**
   * PIIX4 UHCI控制器
   * Intel PIIX4芯片组USB 1.1控制器
   */
  PIIX4UHCI = "piix4-uhci",
  /**
   * EHCI控制器
   * USB 2.0增强型主机控制器
   */
  EHCI = "ehci",
  /**
   * ICH9 EHCI控制器
   * Intel ICH9芯片组USB 2.0控制器
   */
  ICH9EHCI1 = "ich9-ehci1",
  /**
   * ICH9 UHCI控制器1
   * Intel ICH9芯片组USB 1.1控制器1
   */
  ICH9UHCI1 = "ich9-uhci1",
  /**
   * ICH9 UHCI控制器2
   * Intel ICH9芯片组USB 1.1控制器2
   */
  ICH9UHCI2 = "ich9-uhci2",
  /**
   * ICH9 UHCI控制器3
   * Intel ICH9芯片组USB 1.1控制器3
   */
  ICH9UHCI3 = "ich9-uhci3",
  /**
   * VT82C686B UHCI控制器
   * VIA VT82C686B芯片组USB控制器
   */
  VT82C686BUHCI = "vt82c686b-uhci",
  /**
   * PCI OHCI控制器
   * Open Host Controller Interface USB控制器
   */
  PCIOHCI = "pci-ohci",
  /**
   * NEC XHCI控制器
   * NEC USB 3.0扩展主机控制器
   */
  NECXHCI = "nec-xhci",
  /**
   * QEMU XHCI控制器
   * QEMU模拟的USB 3.0控制器
   */
  QEMU_XHCI = "qemu-xhci",
}

/**
 * 云主机固件模式枚举
 * @enum
 */
export enum GuestFirmwareMode {
  /**
   * BIOS固件模式
   * 传统基本输入输出系统，兼容性好
   */
  BIOS = "bios",
  /**
   * EFI固件模式
   * 可扩展固件接口，支持更大磁盘和更多功能
   */
  EFI = "efi",
  /**
   * 安全EFI模式
   * 支持安全启动的EFI固件
   */
  SecureEFI = "secure_efi",
  /**
   * 默认固件模式
   * 使用系统默认的固件设置
   */
  Default = "",
}

/**
 * 云主机声音模型枚举
 * @enum
 */
export enum GuestSoundModel {
  /**
   * SB16声音模型
   * Sound Blaster 16位音频控制器
   */
  SB16 = "sb16",
  /**
   * ES1370声音模型
   * Ensoniq ES1370音频控制器
   */
  ES1370 = "es1370",
  /**
   * PC扬声器模型
   * 系统蜂鸣器/PC扬声器
   */
  PCSPK = "pcspk",
  /**
   * AC97声音模型
   * 音频编码97标准控制器
   */
  AC97 = "ac97",
  /**
   * ICH6声音模型
   * Intel ICH6芯片组音频控制器
   */
  ICH6 = "ich6",
  /**
   * ICH9声音模型
   * Intel ICH9芯片组音频控制器
   */
  ICH9 = "ich9",
  /**
   * USB音频模型
   * USB音频设备
   */
  USB = "usb",
  /**
   * ICH7声音模型
   * Intel ICH7芯片组音频控制器
   */
  ICH7 = "ich7",
  /**
   * VirtIO声音模型
   * 虚拟化专用音频控制器
   */
  VirtIO = "virtio",
  /**
   * 禁用声音模型
   * 不启用任何音频控制器
   */
  Disabled = "",
}

/**
 * 云主机平板模式枚举
 * @enum
 */
export enum GuestTabletMode {
  /**
   * 禁用平板设备
   * 不启用任何平板输入设备
   */
  Disabled = "",
  /**
   * USB平板模式
   * 通过USB接口连接的平板设备
   */
  USB = "usb",
  /**
   * VirtIO平板模式
   * 虚拟化专用平板设备接口
   */
  VirtIO = "virtio",
}
/**
 * 任务状态枚举
 * @enum
 */
export enum TaskStatus {
  /**
   * 等待中状态
   * 任务已创建但尚未开始执行
   */
  Pending = "pending",
  /**
   * 运行中状态
   * 任务正在执行过程中
   */
  Running = "running",
  /**
   * 已完成状态
   * 任务已执行完成（包含成功和失败结果）
   */
  Completed = "completed",
}
/**
 * 云主机状态
 * @enum
 */
export enum GuestState {
  /**
   * 已停止状态
   * 虚拟机已关闭电源
   */
  Stopped = "stopped",
  /**
   * 启动中状态
   * 虚拟机正在启动过程中
   */
  Starting = "starting",
  /**
   * 运行中状态
   * 虚拟机正常运行中
   */
  Running = "running",
  /**
   * 关闭中状态
   * 虚拟机正在关闭过程中
   */
  Stopping = "stopping",
  /**
   * 挂起中状态
   * 虚拟机正在挂起过程中
   */
  Suspending = "suspending",
  /**
   * 已挂起状态
   * 虚拟机已暂停执行
   */
  Suspended = "suspended",
  /**
   * 未知状态
   * 无法确定虚拟机当前状态
   */
  Unknown = "unknown",
}
/**
 * 网络模式
 * @enum
 */
export enum NetworkMode {
  /** 桥接模式 */
  Bridge = "bridge",
}
/**
 * 卷容器策略
 * @enum
 */
export enum VolumeContainerStrategy {
  /** 最少分配磁盘卷的路径 */
  LeastVolumes = "least_volumes",
  /** 最小占用空间的路径 */
  LeastUsed = "least_used",
  /** 最大可用空间的路径 */
  MaximumAvailable = "maximum_available",
}
export enum Priority {
  High = 0,
  Medium = 1,
  Low = 2,
}
export enum StorageType {
  Local = "local",
  NFS = "nfs",
  CephFS = "cephfs",
  SMB = "smb",
  WebDav = "webdav",
  S3 = "s3",
  iSCSI = "iscsi",
}
export enum VolumeFormat {
  Raw = "raw",
  Qcow = "qcow2",
}
/**
 * 接口模式
 * @enum
 */
export enum InterfaceMode {
  /** 直接模式 */
  Direct = "direct", // external only
  /** 网络地址转换模式 */
  NAT = "nat", // internal NAT => external
  /** 双NIC模式 */
  DualNIC = "dual-nic",
}
/**
 * 节点模式
 * @enum
 */
export enum NodeMode {
  /** 主控节点 */
  Control = "control",
  /** 资源节点 */
  Resource = "resource",
}
/**
 * 节点状态
 * @enum
 */
export enum NodeState {
  /** 已连接 */
  Connected = "connected",
  /** 已断开 */
  Disconnected = "disconnected",
  /** 已就绪 */
  Ready = "ready",
  /** 已丢失 */
  Lost = "lost",
}
/**
 * 计算资源池分配资源节点策略
 * @enum
 */
export enum ComputePoolStrategy {
  /** 最多可用内存 */
  MostAvailableMemory = "most_available_memory",
  /** 最多可用磁盘 */
  MostAvailableDisk = "most_available_disk",
  /** 最小内存负载 */
  LeastMemoryLoad = "least_memory_load",
  /** 最小磁盘负载 */
  LeastDiskLoad = "least_disk_load",
  /** 最小核心负载 */
  LeastCoreLoad = "least_core_load",
}
export enum CloudInitBootMode {
  None = "",
  DMI = "dmi",
  ISO = "iso",
  ISONet = "iso_net",
}
export enum Locale {
  Chinese = "zh-cn",
  English = "en-us",
}
export enum AuthorizationMode {
  Machine = "machine",
  Project = "project",
  Account = "account",
}
/**
 * 许可证功能
 * @enum
 */
export enum LicenseFeature {
  /** 快照 */
  Snapshot = "snapshot",
  /** 多路径存储 */
  StorageMultiPaths = "storage_multi_paths",
  /** 网络存储 */
  StorageNetwork = "storage_network",
  /** 计划快照 */
  SnapshotSchedule = "snapshot_schedule",
  /** 备份 */
  Backup = "backup",
  /** 高可用 */
  HighAvailability = "high_availability",
  /** 批量操作 */
  BatchOperation = "batch_operation",
  /** 导入 */
  Import = "import",
  /** 通知消息 */
  NotifyMessage = "notify_message",
  /** 图形透传 */
  GraphicPassthrough = "graphic_passthrough",
  /** 迁移 */
  Migration = "migration",
  /** 地址池 */
  AddressPool = "address_pool",
  /** 内存合并 */
  MemoryMerge = "memory_merge",
}
export enum SignatureAlgorithm {
  //"ed25519"
  Ed25519 = "ed25519",
}
export enum FileCategory {
  ISO = "iso",
  Disk = "disk",
}
export enum FileFormat {
  ISO = "iso",
  Qcow2 = "qcow2",
}
/**
 * 文件状态
 * @enum
 */
export enum FileState {
  /** 已分配，无数据 */
  Allocated = "allocated",
  /** 已就绪 */
  Ready = "ready",
  /** 更新中 */
  Updating = "updating",
  /** 已损坏 */
  Corrupted = "corrupted",
}
/**
 * 统计范围
 * @enum
 */
export enum StatisticRange {
  /** 最近1小时 */
  LastHour = "last_hour",
  /** 最近24小时 */
  Last24Hours = "last_24_hours",
  /** 最近7天 */
  Last7Days = "last_7_days",
  /** 最近30天 */
  Last30Days = "last_30_days",
}
/**
 * 控制台事件等级
 * @enum
 */
export enum ConsoleEventLevel {
  /** 信息 */
  Info = "info",
  /** 警告 */
  Warning = "warning",
  /** 警报 */
  Alert = "alert",
  /** 严重 */
  Critical = "critical",
}
/**
 * 控制台事件范围
 * @enum
 */
export enum ConsoleEventRange {
  /** 系统 */
  System = "system",
  /** 集群 */
  Cluster = "cluster",
  /** 资源池 */
  Pool = "pool",
  /** 节点 */
  Node = "node",
}
/**
 * 控制台事件分类
 * @enum
 */
export enum ConsoleEventCategory {
  /** 云主机 */
  Guest = "guest",
  /** 存储 */
  Storage = "storage",
  /** 网络 */
  Network = "network",
  /** 系统 */
  System = "system",
  /** 资源 */
  Resource = "resource",
  /** 配置 */
  Config = "config",
  /** 安全 */
  Security = "security",
  /** 认证 */
  Auth = "auth",
  /** 任务 */
  Task = "task",
}
/**
 * 导入云主机供应商
 * @enum
 */
export enum ImportVendor {
  /** VMware ESXi */
  VMWareESXi = "vmware_esxi",
}

export const NODE_RESOURCE_SNAPSHOT_FIELD_COUNT =
  ResourceSnapshotField.GuestUnknown + 1;
export const POOL_RESOURCE_SNAPSHOT_FIELD_COUNT =
  ResourceSnapshotField.NodeLost + 1;

/**
 * 用户角色枚举
 * @enum
 */
export enum UserRole {
  /**
   * 超级管理员角色
   */
  Super = "super",
  /**
   * 管理员角色
   */
  Manager = "manager",
  /**
   * 普通用户角色
   */
  User = "user",
}

/**
 * 密码哈希算法枚举
 * @enum
 */
export enum PasswordHasher {
  /**
   * bcrypt 密码哈希算法
   */
  Bcrypt = "bcrypt",
}

/**
 * 令牌签名方法枚举
 * @enum
 * secret - ['HS256', 'HS384', 'HS512']
 * rsa - ['RS256', 'RS384', 'RS512']
 * ec - ['ES256', 'ES384', 'ES512']
 */
export enum TokenSigningMethod {
  /** HMAC 使用 SHA-256 哈希算法 */
  HS256 = "HS256",
  /** HMAC 使用 SHA-384 哈希算法 */
  HS384 = "HS384",
  /** HMAC 使用 SHA-512 哈希算法 */
  HS512 = "HS512",
  /** RSA 使用 SHA-256 哈希算法 */
  RS256 = "RS256",
  /** RSA 使用 SHA-384 哈希算法 */
  RS384 = "RS384",
  /** RSA 使用 SHA-512 哈希算法 */
  RS512 = "RS512",
  /** ECDSA 使用 SHA-256 哈希算法 */
  ES256 = "ES256",
  /** ECDSA 使用 SHA-384 哈希算法 */
  ES384 = "ES384",
  /** ECDSA 使用 SHA-512 哈希算法 */
  ES512 = "ES512",
}
