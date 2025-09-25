"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSigningMethod = exports.PasswordHasher = exports.UserRole = exports.POOL_RESOURCE_SNAPSHOT_FIELD_COUNT = exports.NODE_RESOURCE_SNAPSHOT_FIELD_COUNT = exports.ImportVendor = exports.ConsoleEventCategory = exports.ConsoleEventRange = exports.ConsoleEventLevel = exports.StatisticRange = exports.FileState = exports.FileFormat = exports.FileCategory = exports.SignatureAlgorithm = exports.LicenseFeature = exports.AuthorizationMode = exports.Locale = exports.CloudInitBootMode = exports.ComputePoolStrategy = exports.NodeState = exports.NodeMode = exports.InterfaceMode = exports.VolumeFormat = exports.StorageType = exports.Priority = exports.VolumeContainerStrategy = exports.NetworkMode = exports.GuestState = exports.TaskStatus = exports.GuestTabletMode = exports.GuestSoundModel = exports.GuestFirmwareMode = exports.USBModel = exports.RemoteProtocol = exports.DisplayDriver = exports.NetworkModelType = exports.GuestDiskMode = exports.SystemCategory = exports.ResourceUsageDurationField = exports.ResourceSnapshotField = exports.StatisticUnitRecordField = exports.ResourceAccessScope = exports.ResourceAction = exports.ResourceAccessLevel = exports.ResourceType = exports.TaskType = exports.controlCommandEnum = void 0;
/*
 * API所需枚举定义
 */
/**
 * 控制命令枚举
 * @enum {string}
 *
 */
var controlCommandEnum;
(function (controlCommandEnum) {
    /**
     * 创建云主机
     * 初始化新的虚拟机实例
     */
    controlCommandEnum["CreateGuest"] = "create_guest";
    /**
     * 删除云主机
     * 移除指定的虚拟机实例
     */
    controlCommandEnum["DeleteGuest"] = "delete_guest";
    /**
     * 添加卷
     * 为虚拟机添加存储卷
     */
    controlCommandEnum["AddVolume"] = "add_volume";
    /**
     * 删除卷
     * 移除虚拟机的存储卷
     */
    controlCommandEnum["DeleteVolume"] = "delete_volume";
    /**
     * 添加外部网卡
     * 为虚拟机添加外部网络接口
     */
    controlCommandEnum["AddExternalInterface"] = "add_external_interface";
    /**
     * 删除外部网卡
     * 移除虚拟机的外部网络接口
     */
    controlCommandEnum["RemoveExternalInterface"] = "remove_external_interface";
    /**
     * 添加内部网卡
     * 为虚拟机添加内部网络接口
     */
    controlCommandEnum["AddInternalInterface"] = "add_internal_interface";
    /**
     * 删除内部网卡
     * 移除虚拟机的内部网络接口
     */
    controlCommandEnum["RemoveInternalInterface"] = "remove_internal_interface";
    /**
     * 修改CPU
     * 调整虚拟机的CPU配置
     */
    controlCommandEnum["ModifyCPU"] = "modify_cpu";
    /**
     * 修改内存
     * 调整虚拟机的内存配置
     */
    controlCommandEnum["ModifyMemory"] = "modify_memory";
    /**
     * 修改主机名
     * 更新虚拟机的主机名
     */
    controlCommandEnum["ModifyHostname"] = "modify_hostname";
    /**
     * 重置监控密码
     * 重新设置监控访问密码
     */
    controlCommandEnum["ResetMonitor"] = "reset_monitor";
    /**
     * 启动云主机
     * 开启虚拟机电源
     */
    controlCommandEnum["StartGuest"] = "start_guest";
    /**
     * 停止云主机
     * 关闭虚拟机电源
     */
    controlCommandEnum["StopGuest"] = "stop_guest";
    /**
     * 修改密码
     * 更新虚拟机登录密码
     */
    controlCommandEnum["ModifyPassword"] = "modify_password";
    /**
     * 修改自动启动
     * 调整虚拟机的自动启动设置
     */
    controlCommandEnum["ModifyAutoStart"] = "modify_autostart";
    /**
     * 获取任务详情
     * 查询指定任务的详细信息
     */
    controlCommandEnum["GetTask"] = "get_task";
    /**
     * 查询任务列表
     * 获取系统中所有任务的列表
     */
    controlCommandEnum["QueryTasks"] = "query_tasks";
    /**
     * 添加节点
     * 将新节点加入集群
     */
    controlCommandEnum["AddNode"] = "add_node";
    /**
     * 移除节点
     * 将节点从集群中移除
     */
    controlCommandEnum["RemoveNode"] = "remove_node";
    /**
     * 查询节点列表
     * 获取集群中所有节点的信息
     */
    controlCommandEnum["QueryNodes"] = "query_nodes";
    /**
     * 获取节点详情
     * 查询指定节点的详细信息
     */
    controlCommandEnum["GetNode"] = "get_node";
    /**
     * 查询池列表
     * 获取系统中所有资源池的信息
     */
    controlCommandEnum["QueryPools"] = "query_pools";
    /**
     * 获取池详情
     * 查询指定资源池的详细信息
     */
    controlCommandEnum["GetPool"] = "get_pool";
    /**
     * 添加池
     * 创建新的资源池
     */
    controlCommandEnum["AddPool"] = "add_pool";
    /**
     * 修改池
     * 更新资源池的配置信息
     */
    controlCommandEnum["ModifyPool"] = "modify_pool";
    /**
     * 删除池
     * 移除指定的资源池
     */
    controlCommandEnum["DeletePool"] = "delete_pool";
    /**
     * 添加池节点
     * 将节点添加到资源池中
     */
    controlCommandEnum["AddPoolNode"] = "add_pool_node";
    /**
     * 移除池节点
     * 将节点从资源池中移除
     */
    controlCommandEnum["RemovePoolNode"] = "remove_pool_node";
    /** 查询存储池列表 */
    controlCommandEnum["QueryStoragePools"] = "query_storage_pools";
    /** 获取存储池详情 */
    controlCommandEnum["GetStoragePool"] = "get_storage_pool";
    /** 添加存储池 */
    controlCommandEnum["AddStoragePool"] = "add_storage_pool";
    /** 删除存储池 */
    controlCommandEnum["RemoveStoragePool"] = "remove_storage_pool";
    /** 修改远程存储策略 */
    controlCommandEnum["ModifyRemoteStorageStrategy"] = "modify_remote_storage_strategy";
    /** 添加远程容器 */
    controlCommandEnum["AddRemoteContainer"] = "add_remote_container";
    /** 修改远程容器 */
    controlCommandEnum["ModifyRemoteContainer"] = "modify_remote_container";
    /** 删除远程容器 */
    controlCommandEnum["RemoveRemoteContainer"] = "remove_remote_container";
    /** 改变远程容器标志 */
    controlCommandEnum["ChangeRemoteContainerFlag"] = "change_remote_container_flag";
    /** 查询地址池列表 */
    controlCommandEnum["QueryAddressPools"] = "query_address_pools";
    /** 获取地址池详情 */
    controlCommandEnum["GetAddressPool"] = "get_address_pool";
    /** 添加地址池 */
    controlCommandEnum["AddAddressPool"] = "add_address_pool";
    /** 修改地址池 */
    controlCommandEnum["ModifyAddressPool"] = "modify_address_pool";
    /** 删除地址池 */
    controlCommandEnum["RemoveAddressPool"] = "remove_address_pool";
    /** 添加外部地址范围 */
    controlCommandEnum["AddExternalAddressRange"] = "add_external_address_range";
    /** 删除外部地址范围 */
    controlCommandEnum["RemoveExternalAddressRange"] = "remove_external_address_range";
    /** 添加内部地址范围 */
    controlCommandEnum["AddInternalAddressRange"] = "add_internal_address_range";
    /** 删除内部地址范围 */
    controlCommandEnum["RemoveInternalAddressRange"] = "remove_internal_address_range";
    /** 查询云主机列表 */
    controlCommandEnum["QueryGuests"] = "query_guests";
    /** 获取云主机详情 */
    controlCommandEnum["GetGuest"] = "get_guest";
    /** 创建ISO镜像 */
    controlCommandEnum["CreateISO"] = "create_iso";
    /** 删除ISO镜像 */
    controlCommandEnum["DeleteISO"] = "delete_iso";
    /** 修改ISO镜像 */
    controlCommandEnum["ModifyISO"] = "modify_iso";
    /** 获取ISO镜像详情 */
    controlCommandEnum["GetISO"] = "get_iso";
    /** 查询ISO镜像列表 */
    controlCommandEnum["QueryISO"] = "query_iso";
    /** 创建磁盘镜像 */
    controlCommandEnum["CreateDisk"] = "create_disk";
    /** 删除磁盘镜像 */
    controlCommandEnum["DeleteDisk"] = "delete_disk";
    /** 修改磁盘镜像 */
    controlCommandEnum["ModifyDisk"] = "modify_disk";
    /** 获取磁盘镜像详情 */
    controlCommandEnum["GetDisk"] = "get_disk";
    /** 查询磁盘镜像列表 */
    controlCommandEnum["QueryDisk"] = "query_disk";
    /** 插入媒体 */
    controlCommandEnum["InsertMedia"] = "insert_media";
    /** 弹出媒体 */
    controlCommandEnum["EjectMedia"] = "eject_media";
    /** 调整磁盘大小 */
    controlCommandEnum["ResizeDisk"] = "resize_disk";
    /** 压缩磁盘 */
    controlCommandEnum["ShrinkDisk"] = "shrink_disk";
    /** 安装磁盘镜像 */
    controlCommandEnum["InstallDiskImage"] = "install_disk_image";
    /** 创建磁盘镜像 */
    controlCommandEnum["CreateDiskImage"] = "create_disk_image";
    /** 同步ISO文件 */
    controlCommandEnum["SyncISOFiles"] = "sync_iso_files";
    /** 同步磁盘文件 */
    controlCommandEnum["SyncDiskFiles"] = "sync_disk_files";
    /** 查询资源池列表 */
    controlCommandEnum["QueryResourcePools"] = "query_resource_pools";
    /** 修改资源存储策略 */
    controlCommandEnum["ModifyResourceStorageStrategy"] = "modify_resource_storage_strategy";
    /** 添加资源容器 */
    controlCommandEnum["AddResourceContainer"] = "add_resource_container";
    /** 修改资源容器 */
    controlCommandEnum["ModifyResourceContainer"] = "modify_resource_container";
    /** 删除资源容器 */
    controlCommandEnum["RemoveResourceContainer"] = "remove_resource_container";
    /** 改变资源容器标志 */
    controlCommandEnum["ChangeResourceContainerFlag"] = "change_resource_container_flag";
    /** 查询快照列表 */
    controlCommandEnum["QuerySnapshots"] = "query_snapshots";
    /** 获取快照详情 */
    controlCommandEnum["GetSnapshot"] = "get_snapshot";
    /** 创建快照 */
    controlCommandEnum["CreateSnapshot"] = "create_snapshot";
    /** 恢复快照 */
    controlCommandEnum["RestoreSnapshot"] = "restore_snapshot";
    /** 删除快照 */
    controlCommandEnum["DeleteSnapshot"] = "delete_snapshot";
    /**
     * 查询资源使用情况
     * 获取系统中各类资源的使用数据
     */
    controlCommandEnum["QueryResourceUsages"] = "query_resource_usages";
    /**
     * 查询资源统计信息
     * 获取系统中资源的统计数据
     */
    controlCommandEnum["QueryResourceStatistic"] = "query_resource_statistic";
    /**
     * 查询计算节点
     * 获取系统中所有计算节点的信息
     */
    controlCommandEnum["QueryComputeNodes"] = "query_compute_nodes";
    /**
     * 查询节点使用情况
     * 获取系统中各节点的资源使用数据
     */
    controlCommandEnum["QueryNodesUsage"] = "query_nodes_usage";
    /**
     * 查询资源池使用情况
     * 获取系统中各资源池的资源使用数据
     */
    controlCommandEnum["QueryPoolsUsage"] = "query_pools_usage";
    /**
     * 查询集群使用情况
     * 获取整个集群的资源使用数据
     */
    controlCommandEnum["QueryClusterUsage"] = "query_cluster_usage";
    /**
     * 启用节点
     * 将指定节点设置为可用状态
     */
    controlCommandEnum["EnableNode"] = "enable_node";
    /**
     * 禁用节点
     * 将指定节点设置为不可用状态
     */
    controlCommandEnum["DisableNode"] = "disable_node";
    /**
     * 修改计算池策略
     * 更新计算资源池的分配策略
     */
    controlCommandEnum["ChangeComputePoolStrategy"] = "change_pool_strategy";
    /**
     * 查询系统列表
     * 获取系统中所有系统实例的信息
     */
    controlCommandEnum["QuerySystems"] = "query_systems";
    /**
     * 查询日志
     * 获取系统中记录的日志信息
     */
    controlCommandEnum["QueryLogs"] = "query_logs";
    /**
     * 查询警告信息
     * 获取系统中记录的警告信息
     */
    controlCommandEnum["QueryWarnings"] = "query_warnings";
    /**
     * 统计警告数量
     * 计算系统中警告信息的总数
     */
    controlCommandEnum["CountWarnings"] = "count_warnings";
    /**
     * 汇总警告数据
     * 对系统中的警告信息进行汇总统计
     */
    controlCommandEnum["SumWarnings"] = "sum_warnings";
    /**
     * 移除警告
     * 删除指定的警告信息
     */
    controlCommandEnum["RemoveWarnings"] = "remove_warnings";
    /**
     * 清除警告
     * 删除系统中所有的警告信息
     */
    controlCommandEnum["ClearWarnings"] = "clear_warnings";
    /**
     * 将警告标记为已读
     * 将指定的警告信息标记为已读状态
     */
    controlCommandEnum["MarkWarningsAsRead"] = "mark_warnings_as_read";
    /**
     * 将所有警告标记为已读
     * 将系统中所有的警告信息标记为已读状态
     */
    controlCommandEnum["MarkAllWarningsAsRead"] = "mark_all_warnings_as_read";
    /**
     * 将所有警告标记为未读
     * 将系统中所有的警告信息标记为未读状态
     */
    controlCommandEnum["MarkAllWarningsAsUnread"] = "mark_all_warnings_as_unread";
    /**
     * 统计未读警告数量
     * 计算系统中未读警告信息的总数
     */
    controlCommandEnum["CountUnreadWarnings"] = "count_unread_warnings";
    /**
     * 修改配置
     * 更新系统的配置信息
     */
    controlCommandEnum["ModifyConfig"] = "modify_config";
    /**
     * 获取配置
     * 获取系统的当前配置信息
     */
    controlCommandEnum["GetConfig"] = "get_config";
    /**
     * 重启服务
     * 重新启动指定的系统服务
     */
    controlCommandEnum["RestartService"] = "restart_service";
    /**
     * 添加SSH密钥
     * 向系统中添加新的SSH密钥
     */
    controlCommandEnum["AddSSHKey"] = "add_ssh_key";
    /**
     * 移除SSH密钥
     * 从系统中删除指定的SSH密钥
     */
    controlCommandEnum["RemoveSSHKey"] = "remove_ssh_key";
    /**
     * 查询SSH密钥
     * 获取系统中所有SSH密钥的信息
     */
    controlCommandEnum["QuerySSHKeys"] = "query_ssh_keys";
    /**
     * 激活许可证
     * 对指定的许可证进行激活操作
     */
    controlCommandEnum["ActiveLicense"] = "active_license";
    /**
     * 获取许可证信息
     * 获取指定许可证的详细信息
     */
    controlCommandEnum["GetLicense"] = "get_license";
    /**
     * 添加许可证
     * 向系统中添加新的许可证
     */
    controlCommandEnum["AddLicense"] = "add_license";
    /**
     * 移除许可证
     * 从系统中删除指定的许可证
     */
    controlCommandEnum["RemoveLicense"] = "remove_license";
    /**
     * 查询许可证列表
     * 获取系统中所有许可证的信息
     */
    controlCommandEnum["QueryLicenses"] = "query_licenses";
    /**
     * 获取已激活的许可证
     * 获取系统中已激活的许可证信息
     */
    controlCommandEnum["GetActivatedLicense"] = "get_activated_license";
    /**
     * 查询集群状态
     * 获取整个集群的运行状态信息
     */
    controlCommandEnum["QueryClusterStatus"] = "query_cluster_status";
    /**
     * 查询网络拓扑图
     * 获取系统的网络拓扑结构信息
     */
    controlCommandEnum["QueryNetworkGraph"] = "query_network_graph";
    /**
     * 获取监控规则
     * 获取系统中配置的监控规则信息
     */
    controlCommandEnum["GetMonitorRules"] = "get_monitor_rules";
    /**
     * 设置监控规则
     * 更新系统中的监控规则配置
     */
    controlCommandEnum["SetMonitorRules"] = "set_monitor_rules";
    /** 清除任务信息 */
    controlCommandEnum["ClearTasks"] = "clear_tasks";
    /** 重新加载资源节点存储 */
    controlCommandEnum["ReloadResourceStorage"] = "reload_resource_storage";
    /** 修改磁盘镜像卷容量 */
    controlCommandEnum["UpdateDiskVolumeSize"] = "update_disk_volume_size";
    /** 重置资源监控规则 */
    controlCommandEnum["ResetMonitorRules"] = "reset_monitor_rules";
    /** 添加导入源 */
    controlCommandEnum["AddImportSource"] = "add_import_source";
    /** 移除导入源 */
    controlCommandEnum["RemoveImportSource"] = "remove_import_source";
    /** 修改导入源 */
    controlCommandEnum["ModifyImportSource"] = "modify_import_source";
    /** 查询导入源 */
    controlCommandEnum["QueryImportSources"] = "query_import_sources";
    /** 查询导入目标 */
    controlCommandEnum["QueryImportTargets"] = "query_import_targets";
    /** 导入云主机 */
    controlCommandEnum["ImportGuests"] = "import_guests";
    /** 获取系统模板 */
    controlCommandEnum["GetSystem"] = "get_system";
    /** 添加系统模板 */
    controlCommandEnum["AddSystem"] = "add_system";
    /** 修改系统模板 */
    controlCommandEnum["ModifySystem"] = "modify_system";
    /** 移除系统模板 */
    controlCommandEnum["RemoveSystem"] = "remove_system";
    /** 迁移云主机到节点 */
    controlCommandEnum["MigrateToNode"] = "migrate_to_node";
    /** 修改外部网卡MAC地址 */
    controlCommandEnum["ModifyExternalInterfaceMAC"] = "modify_external_interface_mac";
    /** 修改内部网卡MAC地址 */
    controlCommandEnum["ModifyInternalInterfaceMAC"] = "modify_internal_interface_mac";
    /** 重置系统模板 */
    controlCommandEnum["ResetSystems"] = "reset_systems";
    /** 查询用户角色 */
    controlCommandEnum["QueryUserRoles"] = "query_user_roles";
    /** 修改用户组角色 */
    controlCommandEnum["ModifyGroupRoles"] = "modify_group_roles";
    /** 查询用户角色 */
    controlCommandEnum["GetGroupRoles"] = "get_group_roles";
    /** 查询用户组成员 */
    controlCommandEnum["QueryGroupMembers"] = "query_group_members";
    /** 添加用户组 */
    controlCommandEnum["AddGroup"] = "add_group";
    /** 移除用户组 */
    controlCommandEnum["RemoveGroup"] = "remove_group";
    /** 查询用户组 */
    controlCommandEnum["QueryGroups"] = "query_groups";
    /** 添加用户 */
    controlCommandEnum["AddUser"] = "add_user";
    /** 移除用户 */
    controlCommandEnum["RemoveUser"] = "remove_user";
    /** 查询用户 */
    controlCommandEnum["QueryUsers"] = "query_users";
    /** 修改用户组 */
    controlCommandEnum["ChangeUserGroup"] = "change_user_group";
    /** 查询用户令牌 */
    controlCommandEnum["QueryUserTokens"] = "query_user_tokens";
    /** 生成用户令牌 */
    controlCommandEnum["GenerateUserToken"] = "generate_user_token";
    /** 移除用户令牌 */
    controlCommandEnum["RevokeUserToken"] = "revoke_user_token";
    /** 修改用户密码 */
    controlCommandEnum["ChangeUserSecret"] = "change_user_secret";
    /** 重置用户密码 */
    controlCommandEnum["ResetUserSecret"] = "reset_user_secret";
    /** 删除访问授权 */
    controlCommandEnum["RevokeAccess"] = "revoke_access";
    /** 取消访问授权 */
    controlCommandEnum["InvalidateAccess"] = "invalidate_access";
    /** 查询访问授权 */
    controlCommandEnum["QueryAccesses"] = "query_accesses";
    /** 获取系统状态 */
    controlCommandEnum["GetSystemStatus"] = "get_system_status";
    /** 初始化系统 */
    controlCommandEnum["InitializeSystem"] = "initialize_system";
    /** 设置系统资源 */
    controlCommandEnum["SetSystemResource"] = "set_system_resource";
    /** 获取资源权限 */
    controlCommandEnum["GetResourcePermissions"] = "get_resource_permissions";
    /** 设置资源权限 */
    controlCommandEnum["SetResourcePermissions"] = "set_resource_permissions";
    /** 添加白名单 */
    controlCommandEnum["AddWhiteList"] = "add_white_list";
    /** 移除白名单 */
    controlCommandEnum["RemoveWhiteList"] = "remove_white_list";
    /** 更新白名单 */
    controlCommandEnum["UpdateWhiteList"] = "update_white_list";
    /** 查询白名单 */
    controlCommandEnum["QueryWhiteList"] = "query_white_list";
    /** 注销设备 */
    controlCommandEnum["LogoutDevice"] = "logout_device";
    /** 查询设备 */
    controlCommandEnum["QueryDevices"] = "query_devices";
})(controlCommandEnum || (exports.controlCommandEnum = controlCommandEnum = {}));
/**
 * 任务类型枚举
 * @enum {string}
 */
var TaskType;
(function (TaskType) {
    /**
     * 创建云主机任务
     * 对应控制命令: create_guest
     */
    TaskType["CreateGuest"] = "create_guest";
    /**
     * 删除云主机任务
     * 对应控制命令: delete_guest
     */
    TaskType["DeleteGuest"] = "delete_guest";
    /**
     * 添加卷任务
     * 对应控制命令: add_volume
     */
    TaskType["AddVolume"] = "add_volume";
    /**
     * 删除卷任务
     * 对应控制命令: delete_volume
     */
    TaskType["DeleteVolume"] = "delete_volume";
    /**
     * 添加外部接口任务
     * 对应控制命令: add_external_interface
     */
    TaskType["AddExternalInterface"] = "add_external_interface";
    /**
     * 移除外部接口任务
     * 对应控制命令: remove_external_interface
     */
    TaskType["RemoveExternalInterface"] = "remove_external_interface";
    /**
     * 添加内部接口任务
     * 对应控制命令: add_internal_interface
     */
    TaskType["AddInternalInterface"] = "add_internal_interface";
    /**
     * 移除内部接口任务
     * 对应控制命令: remove_internal_interface
     */
    TaskType["RemoveInternalInterface"] = "remove_internal_interface";
    /**
     * 修改CPU任务
     * 对应控制命令: modify_cpu
     */
    TaskType["ModifyCPU"] = "modify_cpu";
    /**
     * 修改内存任务
     * 对应控制命令: modify_memory
     */
    TaskType["ModifyMemory"] = "modify_memory";
    /**
     * 修改主机名任务
     * 对应控制命令: modify_hostname
     */
    TaskType["ModifyHostname"] = "modify_hostname";
    /**
     * 重置监控密码任务
     * 对应控制命令: reset_monitor
     */
    TaskType["ResetMonitor"] = "reset_monitor";
    /**
     * 启动云主机任务
     * 对应控制命令: start_guest
     */
    TaskType["StartGuest"] = "start_guest";
    /**
     * 停止云主机任务
     * 对应控制命令: stop_guest
     */
    TaskType["StopGuest"] = "stop_guest";
    /**
     * 修改密码任务
     * 对应控制命令: modify_password
     */
    TaskType["ModifyPassword"] = "modify_password";
    /**
     * 修改自动启动任务
     * 对应控制命令: modify_autostart
     */
    TaskType["ModifyAutoStart"] = "modify_autostart";
    /**
     * 插入介质任务
     * 对应控制命令: insert_media
     */
    TaskType["InsertMedia"] = "insert_media";
    /**
     * 弹出介质任务
     * 对应控制命令: eject_media
     */
    TaskType["EjectMedia"] = "eject_media";
    /**
     * 调整磁盘大小任务
     * 对应控制命令: resize_disk
     */
    TaskType["ResizeDisk"] = "resize_disk";
    /**
     * 收缩磁盘任务
     * 对应控制命令: shrink_disk
     */
    TaskType["ShrinkDisk"] = "shrink_disk";
    /**
     * 安装磁盘镜像任务
     * 对应控制命令: install_disk_image
     */
    TaskType["InstallDiskImage"] = "install_disk_image";
    /**
     * 创建磁盘镜像任务
     * 对应控制命令: create_disk_image
     */
    TaskType["CreateDiskImage"] = "create_disk_image";
    /**
     * 同步ISO文件任务
     * 对应控制命令: sync_iso_files
     */
    TaskType["SyncISOFiles"] = "sync_iso_files";
    /**
     * 同步磁盘文件任务
     * 对应控制命令: sync_disk_files
     */
    TaskType["SyncDiskFiles"] = "sync_disk_files";
    /**
     * 创建快照任务
     * 对应控制命令: create_snapshot
     */
    TaskType["CreateSnapshot"] = "create_snapshot";
    /**
     * 删除快照任务
     * 对应控制命令: delete_snapshot
     */
    TaskType["DeleteSnapshot"] = "delete_snapshot";
    /**
     * 恢复快照任务
     * 对应控制命令: restore_snapshot
     */
    TaskType["RestoreSnapshot"] = "restore_snapshot";
    /**
     * 添加远程存储容器任务
     * 对应控制命令: add_remote_container
     */
    TaskType["AddRemoteContainer"] = "add_remote_container";
    /**
     * 修改远程存储容器任务
     * 对应控制命令: modify_remote_container
     */
    TaskType["ModifyRemoteContainer"] = "modify_remote_container";
    /**
     * 移除远程存储容器任务
     * 对应控制命令: remove_remote_container
     */
    TaskType["RemoveRemoteContainer"] = "remove_remote_container";
    /**
     * 重新加载资源存储任务
     * 对应控制命令: reload_resource_storage
     */
    TaskType["ReloadResourceStorage"] = "reload_resource_storage";
    /**
     * 导入云主机任务
     * 对应控制命令: import_guests
     */
    TaskType["ImportGuests"] = "import_guests";
    /**
     * 迁移到节点任务
     * 对应控制命令: migrate_to_node
     */
    TaskType["MigrateToNode"] = "migrate_to_node";
})(TaskType || (exports.TaskType = TaskType = {}));
/**
 * 资源类型枚举
 * @enum {string}
 */
var ResourceType;
(function (ResourceType) {
    /** SSH密钥   */
    ResourceType["SSHKey"] = "ssh_key";
    /** 系统模板   */
    ResourceType["System"] = "system";
    /** 磁盘镜像   */
    ResourceType["DiskImage"] = "disk_image";
    /** 光盘镜像资源   */
    ResourceType["ISOImage"] = "iso_image";
    /** 云主机资源    */
    ResourceType["Guest"] = "guest";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
/**
 * 资源访问权限枚举
 * @enum {string}
 */
var ResourceAccessLevel;
(function (ResourceAccessLevel) {
    /**
     * 全局可见权限
     * 所有用户均可查看该资源
     */
    ResourceAccessLevel["GlobalView"] = "global_view";
    /**
     * 共享编辑权限
     * 同命名空间用户可查看和编辑该资源
     */
    ResourceAccessLevel["ShareEdit"] = "share_edit";
    /**
     * 共享查看权限
     * 同命名空间用户可查看但不可编辑该资源
     */
    ResourceAccessLevel["ShareView"] = "share_view";
    /**
     * 私有权限
     * 仅资源所有者可访问
     */
    ResourceAccessLevel["Private"] = "private";
})(ResourceAccessLevel || (exports.ResourceAccessLevel = ResourceAccessLevel = {}));
/**
 * 资源操作权限枚举
 * @enum {string}
 */
var ResourceAction;
(function (ResourceAction) {
    /**
     * 查看权限
     * 允许查看资源信息
     */
    ResourceAction["View"] = "view";
    /**
     * 编辑权限
     * 允许修改资源信息
     */
    ResourceAction["Edit"] = "edit";
    /**
     * 删除权限
     * 允许移除资源
     */
    ResourceAction["Delete"] = "delete";
})(ResourceAction || (exports.ResourceAction = ResourceAction = {}));
/**
 * 资源访问范围枚举
 * @enum {string}
 */
var ResourceAccessScope;
(function (ResourceAccessScope) {
    /**
     * 所有人可访问
     * 系统中所有用户均可访问该资源
     */
    ResourceAccessScope["All"] = "all";
    /**
     * 同命名空间可访问
     * 仅同一命名空间内的用户可访问该资源
     */
    ResourceAccessScope["Namespace"] = "namespace";
    /**
     * 私有访问范围
     * 仅资源所有者可访问
     */
    ResourceAccessScope["Private"] = "private";
})(ResourceAccessScope || (exports.ResourceAccessScope = ResourceAccessScope = {}));
/**
 * 资源统计指标字段枚举
 * @enum {number}
 */
var StatisticUnitRecordField;
(function (StatisticUnitRecordField) {
    /**
     * CPU核心使用率平均值
     * 单位时间内CPU核心的平均使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["CoresAverage"] = 0] = "CoresAverage";
    /**
     * CPU核心使用率最大值
     * 单位时间内CPU核心的最高使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["CoresMax"] = 1] = "CoresMax";
    /**
     * CPU核心使用率最小值
     * 单位时间内CPU核心的最低使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["CoresMin"] = 2] = "CoresMin";
    /**
     * 内存使用率平均值
     * 单位时间内内存的平均使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["MemoryAverage"] = 3] = "MemoryAverage";
    /**
     * 内存使用率最大值
     * 单位时间内内存的最高使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["MemoryMax"] = 4] = "MemoryMax";
    /**
     * 内存使用率最小值
     * 单位时间内内存的最低使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["MemoryMin"] = 5] = "MemoryMin";
    /**
     * 磁盘使用率平均值
     * 单位时间内磁盘的平均使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["DiskAverage"] = 6] = "DiskAverage";
    /**
     * 磁盘使用率最大值
     * 单位时间内磁盘的最高使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["DiskMax"] = 7] = "DiskMax";
    /**
     * 磁盘使用率最小值
     * 单位时间内磁盘的最低使用率
     */
    StatisticUnitRecordField[StatisticUnitRecordField["DiskMin"] = 8] = "DiskMin";
    /**
     * 读请求数量
     * 单位时间内的磁盘读操作次数
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadRequests"] = 9] = "ReadRequests";
    /**
     * 读字节数
     * 单位时间内的磁盘读取数据量
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadBytes"] = 10] = "ReadBytes";
    /**
     * 写请求数量
     * 单位时间内的磁盘写操作次数
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WriteRequests"] = 11] = "WriteRequests";
    /**
     * 写字节数
     * 单位时间内的磁盘写入数据量
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WriteBytes"] = 12] = "WriteBytes";
    /**
     * 接收数据包数量
     * 单位时间内网络接收的数据包总数
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedPackets"] = 13] = "ReceivedPackets";
    /**
     * 接收字节数
     * 单位时间内网络接收的数据总量
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedBytes"] = 14] = "ReceivedBytes";
    /**
     * 发送数据包数量
     * 单位时间内网络发送的数据包总数
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedPackets"] = 15] = "TransmittedPackets";
    /**
     * 发送字节数
     * 单位时间内网络发送的数据总量
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedBytes"] = 16] = "TransmittedBytes";
    /**
     * 每秒读字节数平均值
     * 单位时间内每秒读取数据量的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadBytesPerSecondAverage"] = 17] = "ReadBytesPerSecondAverage";
    /**
     * 每秒读字节数最大值
     * 单位时间内每秒读取数据量的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadBytesPerSecondMax"] = 18] = "ReadBytesPerSecondMax";
    /**
     * 每秒读字节数最小值
     * 单位时间内每秒读取数据量的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadBytesPerSecondMin"] = 19] = "ReadBytesPerSecondMin";
    /**
     * 每秒读数据包平均值
     * 单位时间内每秒读取数据包的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadPacketsPerSecondAverage"] = 20] = "ReadPacketsPerSecondAverage";
    /**
     * 每秒读数据包最大值
     * 单位时间内每秒读取数据包的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadPacketsPerSecondMax"] = 21] = "ReadPacketsPerSecondMax";
    /**
     * 每秒读数据包最小值
     * 单位时间内每秒读取数据包的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReadPacketsPerSecondMin"] = 22] = "ReadPacketsPerSecondMin";
    /**
     * 每秒写字节数平均值
     * 单位时间内每秒写入数据量的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WriteBytesPerSecondAverage"] = 23] = "WriteBytesPerSecondAverage";
    /**
     * 每秒写字节数最大值
     * 单位时间内每秒写入数据量的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WriteBytesPerSecondMax"] = 24] = "WriteBytesPerSecondMax";
    /**
     * 每秒写字节数最小值
     * 单位时间内每秒写入数据量的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WriteBytesPerSecondMin"] = 25] = "WriteBytesPerSecondMin";
    /**
     * 每秒写数据包平均值
     * 单位时间内每秒写入数据包的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WritePacketsPerSecondAverage"] = 26] = "WritePacketsPerSecondAverage";
    /**
     * 每秒写数据包最大值
     * 单位时间内每秒写入数据包的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WritePacketsPerSecondMax"] = 27] = "WritePacketsPerSecondMax";
    /**
     * 每秒写数据包最小值
     * 单位时间内每秒写入数据包的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["WritePacketsPerSecondMin"] = 28] = "WritePacketsPerSecondMin";
    /**
     * 每秒接收字节数平均值
     * 单位时间内每秒网络接收数据量的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedBytesPerSecondAverage"] = 29] = "ReceivedBytesPerSecondAverage";
    /**
     * 每秒接收字节数最大值
     * 单位时间内每秒网络接收数据量的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedBytesPerSecondMax"] = 30] = "ReceivedBytesPerSecondMax";
    /**
     * 每秒接收字节数最小值
     * 单位时间内每秒网络接收数据量的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedBytesPerSecondMin"] = 31] = "ReceivedBytesPerSecondMin";
    /**
     * 每秒接收数据包平均值
     * 单位时间内每秒网络接收数据包的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedPacketsPerSecondAverage"] = 32] = "ReceivedPacketsPerSecondAverage";
    /**
     * 每秒接收数据包最大值
     * 单位时间内每秒网络接收数据包的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedPacketsPerSecondMax"] = 33] = "ReceivedPacketsPerSecondMax";
    /**
     * 每秒接收数据包最小值
     * 单位时间内每秒网络接收数据包的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["ReceivedPacketsPerSecondMin"] = 34] = "ReceivedPacketsPerSecondMin";
    /**
     * 每秒发送字节数平均值
     * 单位时间内每秒网络发送数据量的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedBytesPerSecondAverage"] = 35] = "TransmittedBytesPerSecondAverage";
    /**
     * 每秒发送字节数最大值
     * 单位时间内每秒网络发送数据量的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedBytesPerSecondMax"] = 36] = "TransmittedBytesPerSecondMax";
    /**
     * 每秒发送字节数最小值
     * 单位时间内每秒网络发送数据量的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedBytesPerSecondMin"] = 37] = "TransmittedBytesPerSecondMin";
    /**
     * 每秒发送数据包平均值
     * 单位时间内每秒网络发送数据包的平均值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedPacketsPerSecondAverage"] = 38] = "TransmittedPacketsPerSecondAverage";
    /**
     * 每秒发送数据包最大值
     * 单位时间内每秒网络发送数据包的最大值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedPacketsPerSecondMax"] = 39] = "TransmittedPacketsPerSecondMax";
    /**
     * 每秒发送数据包最小值
     * 单位时间内每秒网络发送数据包的最小值
     */
    StatisticUnitRecordField[StatisticUnitRecordField["TransmittedPacketsPerSecondMin"] = 40] = "TransmittedPacketsPerSecondMin";
    /**
     * 统计字段总数
     * 记录统计字段的总数量
     */
    StatisticUnitRecordField[StatisticUnitRecordField["Count"] = 41] = "Count";
})(StatisticUnitRecordField || (exports.StatisticUnitRecordField = StatisticUnitRecordField = {}));
/**
 * 资源快照字段枚举
 * @enum {number}
 */
var ResourceSnapshotField;
(function (ResourceSnapshotField) {
    /**
     * 严重警报数量
     * 资源快照中记录的严重级别警报总数
     */
    ResourceSnapshotField[ResourceSnapshotField["Critical"] = 0] = "Critical";
    /**
     * 警告警报数量
     * 资源快照中记录的警告级别警报总数
     */
    ResourceSnapshotField[ResourceSnapshotField["Alert"] = 1] = "Alert";
    /**
     * 一般警告数量
     * 资源快照中记录的一般级别警告总数
     */
    ResourceSnapshotField[ResourceSnapshotField["Warning"] = 2] = "Warning";
    /**
     * CPU核心数量
     * 资源分配的CPU核心总数
     */
    ResourceSnapshotField[ResourceSnapshotField["Cores"] = 3] = "Cores";
    /**
     * 内存容量
     * 资源分配的内存总容量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["Memory"] = 4] = "Memory";
    /**
     * 磁盘容量
     * 资源分配的磁盘总容量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["Disk"] = 5] = "Disk";
    /**
     * 云主机数量
     * 当前活动的云主机实例总数
     */
    ResourceSnapshotField[ResourceSnapshotField["Guests"] = 6] = "Guests";
    /**
     * CPU核心使用率
     * CPU核心的总体使用率百分比
     */
    ResourceSnapshotField[ResourceSnapshotField["CoreUsage"] = 7] = "CoreUsage";
    /**
     * 已用内存
     * 已使用的内存容量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["MemoryUsed"] = 8] = "MemoryUsed";
    /**
     * 已用磁盘
     * 已使用的磁盘容量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["DiskUsed"] = 9] = "DiskUsed";
    /**
     * 读取字节数
     * 累计读取的磁盘数据量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["ReadBytes"] = 10] = "ReadBytes";
    /**
     * 读取数据包数
     * 累计读取的网络数据包数量
     */
    ResourceSnapshotField[ResourceSnapshotField["ReadPackets"] = 11] = "ReadPackets";
    /**
     * 写入字节数
     * 累计写入的磁盘数据量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["WriteBytes"] = 12] = "WriteBytes";
    /**
     * 写入数据包数
     * 累计写入的网络数据包数量
     */
    ResourceSnapshotField[ResourceSnapshotField["WritePackets"] = 13] = "WritePackets";
    /**
     * 接收字节数
     * 累计接收的网络数据量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["ReceivedBytes"] = 14] = "ReceivedBytes";
    /**
     * 接收数据包数
     * 累计接收的网络数据包数量
     */
    ResourceSnapshotField[ResourceSnapshotField["ReceivedPackets"] = 15] = "ReceivedPackets";
    /**
     * 发送字节数
     * 累计发送的网络数据量(GB)
     */
    ResourceSnapshotField[ResourceSnapshotField["TransmittedBytes"] = 16] = "TransmittedBytes";
    /**
     * 发送数据包数
     * 累计发送的网络数据包数量
     */
    ResourceSnapshotField[ResourceSnapshotField["TransmittedPackets"] = 17] = "TransmittedPackets";
    /**
     * 已停止云主机数量
     * 处于停止状态的云主机实例数量
     */
    ResourceSnapshotField[ResourceSnapshotField["GuestStopped"] = 18] = "GuestStopped";
    /**
     * 运行中云主机数量
     * 处于运行状态的云主机实例数量
     */
    ResourceSnapshotField[ResourceSnapshotField["GuestRunning"] = 19] = "GuestRunning";
    /**
     * 状态未知云主机数量
     * 状态无法确定的云主机实例数量
     */
    ResourceSnapshotField[ResourceSnapshotField["GuestUnknown"] = 20] = "GuestUnknown";
    /**
     * 在线节点数量
     * 处于在线状态的集群节点数量
     */
    ResourceSnapshotField[ResourceSnapshotField["NodeOnline"] = 21] = "NodeOnline";
    /**
     * 离线节点数量
     * 处于离线状态的集群节点数量
     */
    ResourceSnapshotField[ResourceSnapshotField["NodeOffline"] = 22] = "NodeOffline";
    /**
     * 丢失节点数量
     * 完全失去连接的集群节点数量
     */
    ResourceSnapshotField[ResourceSnapshotField["NodeLost"] = 23] = "NodeLost";
    /**
     * 启用状态池数量
     * 处于启用状态的资源池数量
     */
    ResourceSnapshotField[ResourceSnapshotField["PoolEnabled"] = 24] = "PoolEnabled";
    /**
     * 禁用状态池数量
     * 处于禁用状态的资源池数量
     */
    ResourceSnapshotField[ResourceSnapshotField["PoolDisabled"] = 25] = "PoolDisabled";
    /**
     * 字段总数
     * 资源快照字段的总数量
     */
    ResourceSnapshotField[ResourceSnapshotField["Count"] = 26] = "Count";
})(ResourceSnapshotField || (exports.ResourceSnapshotField = ResourceSnapshotField = {}));
/**
 * 资源使用时长字段枚举
 * @enum {number}
 */
var ResourceUsageDurationField;
(function (ResourceUsageDurationField) {
    /**
     * CPU核心使用时长
     * 资源占用CPU核心的累计时长(分钟)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["Cores"] = 0] = "Cores";
    /**
     * 内存使用时长
     * 资源占用内存的累计时长(分钟)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["Memory"] = 1] = "Memory";
    /**
     * 磁盘使用时长
     * 资源占用磁盘的累计时长(分钟)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["Disk"] = 2] = "Disk";
    /**
     * 读请求累计次数
     * 资源产生的磁盘读请求总次数
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReadRequests"] = 3] = "ReadRequests";
    /**
     * 读字节数累计
     * 资源产生的磁盘读取数据总量(GB)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReadBytes"] = 4] = "ReadBytes";
    /**
     * 写请求累计次数
     * 资源产生的磁盘写请求总次数
     */
    ResourceUsageDurationField[ResourceUsageDurationField["WriteRequests"] = 5] = "WriteRequests";
    /**
     * 写字节数累计
     * 资源产生的磁盘写入数据总量(GB)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["WriteBytes"] = 6] = "WriteBytes";
    /**
     * 接收数据包累计次数
     * 资源产生的网络接收数据包总次数
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReceivedPackets"] = 7] = "ReceivedPackets";
    /**
     * 接收字节数累计
     * 资源产生的网络接收数据总量(GB)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReceivedBytes"] = 8] = "ReceivedBytes";
    /**
     * 发送数据包累计次数
     * 资源产生的网络发送数据包总次数
     */
    ResourceUsageDurationField[ResourceUsageDurationField["TransmittedPackets"] = 9] = "TransmittedPackets";
    /**
     * 发送字节数累计
     * 资源产生的网络发送数据总量(GB)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["TransmittedBytes"] = 10] = "TransmittedBytes";
    /**
     * 每秒读字节数
     * 资源的磁盘读取速率(GB/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReadBytesPerSecond"] = 11] = "ReadBytesPerSecond";
    /**
     * 每秒读数据包数
     * 资源的磁盘读请求速率(次/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReadPacketsPerSecond"] = 12] = "ReadPacketsPerSecond";
    /**
     * 每秒写字节数
     * 资源的磁盘写入速率(GB/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["WriteBytesPerSecond"] = 13] = "WriteBytesPerSecond";
    /**
     * 每秒写数据包数
     * 资源的磁盘写请求速率(次/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["WritePacketsPerSecond"] = 14] = "WritePacketsPerSecond";
    /**
     * 每秒接收字节数
     * 资源的网络接收速率(GB/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReceivedBytesPerSecond"] = 15] = "ReceivedBytesPerSecond";
    /**
     * 每秒接收数据包数
     * 资源的网络接收请求速率(次/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["ReceivedPacketsPerSecond"] = 16] = "ReceivedPacketsPerSecond";
    /**
     * 每秒发送字节数
     * 资源的网络发送速率(GB/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["TransmittedBytesPerSecond"] = 17] = "TransmittedBytesPerSecond";
    /**
     * 每秒发送数据包数
     * 资源的网络发送请求速率(次/秒)
     */
    ResourceUsageDurationField[ResourceUsageDurationField["TransmittedPacketsPerSecond"] = 18] = "TransmittedPacketsPerSecond";
    /**
     * 字段总数
     * 资源使用时长字段的总数量
     */
    ResourceUsageDurationField[ResourceUsageDurationField["Count"] = 19] = "Count";
})(ResourceUsageDurationField || (exports.ResourceUsageDurationField = ResourceUsageDurationField = {}));
/**
 * 系统类别枚举
 * @enum {string}
 */
var SystemCategory;
(function (SystemCategory) {
    /**
     * Linux操作系统
     * 包括所有Linux发行版系统
     */
    SystemCategory["Linux"] = "linux";
    /**
     * BSD操作系统
     * 包括FreeBSD等BSD系列系统
     */
    SystemCategory["BSD"] = "freebsd";
    /**
     * macOS操作系统
     * Apple的macOS系统
     */
    SystemCategory["MacOS"] = "macos";
    /**
     * Windows操作系统
     * Microsoft的Windows系统
     */
    SystemCategory["Windows"] = "windows";
})(SystemCategory || (exports.SystemCategory = SystemCategory = {}));
/**
 * 云主机磁盘模式枚举
 * @enum {string}
 */
var GuestDiskMode;
(function (GuestDiskMode) {
    /**
     * 禁用磁盘接口
     * 不使用任何磁盘接口
     */
    GuestDiskMode["Disabled"] = "disabled";
    /**
     * IDE磁盘接口
     * 传统并行接口，兼容性好但性能较低
     */
    GuestDiskMode["IDE"] = "ide";
    /**
     * SCSI磁盘接口
     * 小型计算机系统接口，支持多设备连接
     */
    GuestDiskMode["SCSI"] = "scsi";
    /**
     * VirtIO磁盘接口
     * 虚拟化专用接口，性能最优
     */
    GuestDiskMode["VirtIO"] = "virtio";
    /**
     * USB磁盘接口
     * 通用串行总线接口
     */
    GuestDiskMode["USB"] = "usb";
    /**
     * SATA磁盘接口
     * 串行高级技术附件接口
     */
    GuestDiskMode["SATA"] = "sata";
    /**
     * SD卡接口
     * 安全数字卡接口
     */
    GuestDiskMode["SD"] = "sd";
})(GuestDiskMode || (exports.GuestDiskMode = GuestDiskMode = {}));
/**
 * 网络模型类型枚举
 * @enum {string}
 */
var NetworkModelType;
(function (NetworkModelType) {
    /**
     * VirtIO网络模型
     * 半虚拟化网络驱动，性能优异
     */
    NetworkModelType["VIRTIO"] = "virtio";
    /**
     * VirtIO过渡版本
     * 兼容传统VirtIO驱动的过渡版本
     */
    NetworkModelType["VIRTIOTransitional"] = "virtio-transitional";
    /**
     * VirtIO非过渡版本
     * 最新VirtIO标准，不兼容旧驱动
     */
    NetworkModelType["VIRTIONonTransitional"] = "virtio-non-transitional";
    /**
     * Intel E1000网络模型
     * 模拟Intel千兆网卡
     */
    NetworkModelType["E1000"] = "e1000";
    /**
     * Intel E1000E网络模型
     * 增强版Intel千兆网卡
     */
    NetworkModelType["E1000E"] = "e1000e";
    /**
     * Intel IGB网络模型
     * 模拟Intel万兆网卡
     */
    NetworkModelType["IGB"] = "igb";
    /**
     * Realtek RTL8139网络模型
     * 模拟Realtek快速以太网网卡
     */
    NetworkModelType["RTL8139"] = "rtl8139";
    /**
     * Netfront网络模型
     * Xen前端网络驱动
     */
    NetworkModelType["Netfront"] = "netfront";
    /**
     * USB网络模型
     * USB网络适配器
     */
    NetworkModelType["USBNet"] = "usb-net";
    /**
     * SPAPR VLAN网络模型
     * PowerPC架构VLAN网络
     */
    NetworkModelType["SPAPRVLAN"] = "spapr-vlan";
    /**
     * LAN9118网络模型
     * SMSC LAN9118以太网控制器
     */
    NetworkModelType["LAN9118"] = "lan9118";
    /**
     * SCM91C111网络模型
     * 模拟SCM91C111网卡
     */
    NetworkModelType["SCM91C111"] = "scm91c111";
    /**
     * VLANCE网络模型
     * AMD Lance网卡
     */
    NetworkModelType["VLANCE"] = "vlance";
    /**
     * VMXNET网络模型
     * VMware早期虚拟网卡
     */
    NetworkModelType["VMXNET"] = "vmxnet";
    /**
     * VMXNET2网络模型
     * VMware增强型虚拟网卡
     */
    NetworkModelType["VMXNET2"] = "vmxnet2";
    /**
     * VMXNET3网络模型
     * VMware高性能虚拟网卡
     */
    NetworkModelType["VMXNET3"] = "vmxnet3";
    /**
     * Am79C970A网络模型
     * AMD PCnet-PCI II网卡
     */
    NetworkModelType["Am79C970A"] = "Am79C970A";
    /**
     * Am79C973网络模型
     * AMD PCnet-FAST III网卡
     */
    NetworkModelType["Am79C973"] = "Am79C973";
    /**
     * 82540EM网络模型
     * Intel PRO/1000 MT网卡
     */
    NetworkModelType["Model82540EM"] = "82540EM";
    /**
     * 82545EM网络模型
     * Intel PRO/1000 GT网卡
     */
    NetworkModelType["Model82545EM"] = "82545EM";
    /**
     * 82543GC网络模型
     * Intel PRO/1000 T网卡
     */
    NetworkModelType["Model82543GC"] = "82543GC";
})(NetworkModelType || (exports.NetworkModelType = NetworkModelType = {}));
/**
 * 显示驱动枚举
 * @enum {string}
 */
var DisplayDriver;
(function (DisplayDriver) {
    /**
     * Cirrus显示驱动
     * 传统VGA兼容显示适配器，兼容性好
     */
    DisplayDriver["Cirrus"] = "cirrus";
    /**
     * 无显示驱动
     * 禁用显示输出
     */
    DisplayDriver["None"] = "none";
    /**
     * QXL显示驱动
     * 高性能虚拟化显示适配器
     */
    DisplayDriver["QXL"] = "qxl";
    /**
     * VGA显示驱动
     * 标准VGA显示适配器
     */
    DisplayDriver["VGA"] = "vga";
    /**
     * VirtIO显示驱动
     * 虚拟化专用显示适配器，性能优异
     */
    DisplayDriver["VirtIO"] = "virtio";
})(DisplayDriver || (exports.DisplayDriver = DisplayDriver = {}));
/**
 * 远程协议枚举
 * @enum {string}
 */
var RemoteProtocol;
(function (RemoteProtocol) {
    /**
     * SPICE远程协议
     * 高性能远程桌面协议，支持音频和USB重定向
     */
    RemoteProtocol["SPICE"] = "spice";
    /**
     * VNC远程协议
     * 虚拟网络计算协议，广泛兼容各种平台
     */
    RemoteProtocol["VNC"] = "vnc";
})(RemoteProtocol || (exports.RemoteProtocol = RemoteProtocol = {}));
/**
 * USB控制器模型枚举
 * @enum {string}
 */
var USBModel;
(function (USBModel) {
    /**
     * 禁用USB控制器
     * 不启用任何USB控制器
     */
    USBModel["Disabled"] = "none";
    /**
     * PIIX3 UHCI控制器
     * Intel PIIX3芯片组USB 1.1控制器
     */
    USBModel["PIIX3UHCI"] = "piix3-uhci";
    /**
     * PIIX4 UHCI控制器
     * Intel PIIX4芯片组USB 1.1控制器
     */
    USBModel["PIIX4UHCI"] = "piix4-uhci";
    /**
     * EHCI控制器
     * USB 2.0增强型主机控制器
     */
    USBModel["EHCI"] = "ehci";
    /**
     * ICH9 EHCI控制器
     * Intel ICH9芯片组USB 2.0控制器
     */
    USBModel["ICH9EHCI1"] = "ich9-ehci1";
    /**
     * ICH9 UHCI控制器1
     * Intel ICH9芯片组USB 1.1控制器1
     */
    USBModel["ICH9UHCI1"] = "ich9-uhci1";
    /**
     * ICH9 UHCI控制器2
     * Intel ICH9芯片组USB 1.1控制器2
     */
    USBModel["ICH9UHCI2"] = "ich9-uhci2";
    /**
     * ICH9 UHCI控制器3
     * Intel ICH9芯片组USB 1.1控制器3
     */
    USBModel["ICH9UHCI3"] = "ich9-uhci3";
    /**
     * VT82C686B UHCI控制器
     * VIA VT82C686B芯片组USB控制器
     */
    USBModel["VT82C686BUHCI"] = "vt82c686b-uhci";
    /**
     * PCI OHCI控制器
     * Open Host Controller Interface USB控制器
     */
    USBModel["PCIOHCI"] = "pci-ohci";
    /**
     * NEC XHCI控制器
     * NEC USB 3.0扩展主机控制器
     */
    USBModel["NECXHCI"] = "nec-xhci";
    /**
     * QEMU XHCI控制器
     * QEMU模拟的USB 3.0控制器
     */
    USBModel["QEMU_XHCI"] = "qemu-xhci";
})(USBModel || (exports.USBModel = USBModel = {}));
/**
 * 云主机固件模式枚举
 * @enum {string}
 */
var GuestFirmwareMode;
(function (GuestFirmwareMode) {
    /**
     * BIOS固件模式
     * 传统基本输入输出系统，兼容性好
     */
    GuestFirmwareMode["BIOS"] = "bios";
    /**
     * EFI固件模式
     * 可扩展固件接口，支持更大磁盘和更多功能
     */
    GuestFirmwareMode["EFI"] = "efi";
    /**
     * 安全EFI模式
     * 支持安全启动的EFI固件
     */
    GuestFirmwareMode["SecureEFI"] = "secure_efi";
    /**
     * 默认固件模式
     * 使用系统默认的固件设置
     */
    GuestFirmwareMode["Default"] = "";
})(GuestFirmwareMode || (exports.GuestFirmwareMode = GuestFirmwareMode = {}));
/**
 * 云主机声音模型枚举
 * @enum {string}
 */
var GuestSoundModel;
(function (GuestSoundModel) {
    /**
     * SB16声音模型
     * Sound Blaster 16位音频控制器
     */
    GuestSoundModel["SB16"] = "sb16";
    /**
     * ES1370声音模型
     * Ensoniq ES1370音频控制器
     */
    GuestSoundModel["ES1370"] = "es1370";
    /**
     * PC扬声器模型
     * 系统蜂鸣器/PC扬声器
     */
    GuestSoundModel["PCSPK"] = "pcspk";
    /**
     * AC97声音模型
     * 音频编码97标准控制器
     */
    GuestSoundModel["AC97"] = "ac97";
    /**
     * ICH6声音模型
     * Intel ICH6芯片组音频控制器
     */
    GuestSoundModel["ICH6"] = "ich6";
    /**
     * ICH9声音模型
     * Intel ICH9芯片组音频控制器
     */
    GuestSoundModel["ICH9"] = "ich9";
    /**
     * USB音频模型
     * USB音频设备
     */
    GuestSoundModel["USB"] = "usb";
    /**
     * ICH7声音模型
     * Intel ICH7芯片组音频控制器
     */
    GuestSoundModel["ICH7"] = "ich7";
    /**
     * VirtIO声音模型
     * 虚拟化专用音频控制器
     */
    GuestSoundModel["VirtIO"] = "virtio";
    /**
     * 禁用声音模型
     * 不启用任何音频控制器
     */
    GuestSoundModel["Disabled"] = "";
})(GuestSoundModel || (exports.GuestSoundModel = GuestSoundModel = {}));
/**
 * 云主机平板模式枚举
 * @enum {string}
 */
var GuestTabletMode;
(function (GuestTabletMode) {
    /**
     * 禁用平板设备
     * 不启用任何平板输入设备
     */
    GuestTabletMode["Disabled"] = "";
    /**
     * USB平板模式
     * 通过USB接口连接的平板设备
     */
    GuestTabletMode["USB"] = "usb";
    /**
     * VirtIO平板模式
     * 虚拟化专用平板设备接口
     */
    GuestTabletMode["VirtIO"] = "virtio";
})(GuestTabletMode || (exports.GuestTabletMode = GuestTabletMode = {}));
/**
 * 任务状态枚举
 * @enum {string}
 */
var TaskStatus;
(function (TaskStatus) {
    /**
     * 等待中状态
     * 任务已创建但尚未开始执行
     */
    TaskStatus["Pending"] = "pending";
    /**
     * 运行中状态
     * 任务正在执行过程中
     */
    TaskStatus["Running"] = "running";
    /**
     * 已完成状态
     * 任务已执行完成（包含成功和失败结果）
     */
    TaskStatus["Completed"] = "completed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
/**
 * 云主机状态
 * @enum {string}
 */
var GuestState;
(function (GuestState) {
    /**
     * 已停止状态
     * 虚拟机已关闭电源
     */
    GuestState["Stopped"] = "stopped";
    /**
     * 启动中状态
     * 虚拟机正在启动过程中
     */
    GuestState["Starting"] = "starting";
    /**
     * 运行中状态
     * 虚拟机正常运行中
     */
    GuestState["Running"] = "running";
    /**
     * 关闭中状态
     * 虚拟机正在关闭过程中
     */
    GuestState["Stopping"] = "stopping";
    /**
     * 挂起中状态
     * 虚拟机正在挂起过程中
     */
    GuestState["Suspending"] = "suspending";
    /**
     * 已挂起状态
     * 虚拟机已暂停执行
     */
    GuestState["Suspended"] = "suspended";
    /**
     * 未知状态
     * 无法确定虚拟机当前状态
     */
    GuestState["Unknown"] = "unknown";
})(GuestState || (exports.GuestState = GuestState = {}));
/**
 * 网络模式
 * @enum {string}
 */
var NetworkMode;
(function (NetworkMode) {
    /** 桥接模式 */
    NetworkMode["Bridge"] = "bridge";
})(NetworkMode || (exports.NetworkMode = NetworkMode = {}));
/**
 * 卷容器策略
 * @enum {string}
 */
var VolumeContainerStrategy;
(function (VolumeContainerStrategy) {
    /** 最少分配磁盘卷的路径 */
    VolumeContainerStrategy["LeastVolumes"] = "least_volumes";
    /** 最小占用空间的路径 */
    VolumeContainerStrategy["LeastUsed"] = "least_used";
    /** 最大可用空间的路径 */
    VolumeContainerStrategy["MaximumAvailable"] = "maximum_available";
})(VolumeContainerStrategy || (exports.VolumeContainerStrategy = VolumeContainerStrategy = {}));
var Priority;
(function (Priority) {
    Priority[Priority["High"] = 0] = "High";
    Priority[Priority["Medium"] = 1] = "Medium";
    Priority[Priority["Low"] = 2] = "Low";
})(Priority || (exports.Priority = Priority = {}));
var StorageType;
(function (StorageType) {
    StorageType["Local"] = "local";
    StorageType["NFS"] = "nfs";
    StorageType["CephFS"] = "cephfs";
    StorageType["SMB"] = "smb";
    StorageType["WebDav"] = "webdav";
    StorageType["S3"] = "s3";
    StorageType["iSCSI"] = "iscsi";
})(StorageType || (exports.StorageType = StorageType = {}));
var VolumeFormat;
(function (VolumeFormat) {
    VolumeFormat["Raw"] = "raw";
    VolumeFormat["Qcow"] = "qcow2";
})(VolumeFormat || (exports.VolumeFormat = VolumeFormat = {}));
/**
 * 接口模式
 * @enum {string}
 */
var InterfaceMode;
(function (InterfaceMode) {
    /** 直接模式 */
    InterfaceMode["Direct"] = "direct";
    /** 网络地址转换模式 */
    InterfaceMode["NAT"] = "nat";
    /** 双NIC模式 */
    InterfaceMode["DualNIC"] = "dual-nic";
})(InterfaceMode || (exports.InterfaceMode = InterfaceMode = {}));
/**
 * 节点模式
 * @enum {string}
 */
var NodeMode;
(function (NodeMode) {
    /** 主控节点 */
    NodeMode["Control"] = "control";
    /** 资源节点 */
    NodeMode["Resource"] = "resource";
})(NodeMode || (exports.NodeMode = NodeMode = {}));
/**
 * 节点状态
 * @enum {string}
 */
var NodeState;
(function (NodeState) {
    /** 已连接 */
    NodeState["Connected"] = "connected";
    /** 已断开 */
    NodeState["Disconnected"] = "disconnected";
    /** 已就绪 */
    NodeState["Ready"] = "ready";
    /** 已丢失 */
    NodeState["Lost"] = "lost";
})(NodeState || (exports.NodeState = NodeState = {}));
/**
 * 计算资源池分配资源节点策略
 * @enum {string}
 */
var ComputePoolStrategy;
(function (ComputePoolStrategy) {
    /** 最多可用内存 */
    ComputePoolStrategy["MostAvailableMemory"] = "most_available_memory";
    /** 最多可用磁盘 */
    ComputePoolStrategy["MostAvailableDisk"] = "most_available_disk";
    /** 最小内存负载 */
    ComputePoolStrategy["LeastMemoryLoad"] = "least_memory_load";
    /** 最小磁盘负载 */
    ComputePoolStrategy["LeastDiskLoad"] = "least_disk_load";
    /** 最小核心负载 */
    ComputePoolStrategy["LeastCoreLoad"] = "least_core_load";
})(ComputePoolStrategy || (exports.ComputePoolStrategy = ComputePoolStrategy = {}));
var CloudInitBootMode;
(function (CloudInitBootMode) {
    CloudInitBootMode["None"] = "";
    CloudInitBootMode["DMI"] = "dmi";
    CloudInitBootMode["ISO"] = "iso";
    CloudInitBootMode["ISONet"] = "iso_net";
})(CloudInitBootMode || (exports.CloudInitBootMode = CloudInitBootMode = {}));
var Locale;
(function (Locale) {
    Locale["Chinese"] = "zh-cn";
    Locale["English"] = "en-us";
})(Locale || (exports.Locale = Locale = {}));
var AuthorizationMode;
(function (AuthorizationMode) {
    AuthorizationMode["Machine"] = "machine";
    AuthorizationMode["Project"] = "project";
    AuthorizationMode["Account"] = "account";
})(AuthorizationMode || (exports.AuthorizationMode = AuthorizationMode = {}));
/**
 * 许可证功能
 * @enum {string}
 */
var LicenseFeature;
(function (LicenseFeature) {
    /** 快照 */
    LicenseFeature["Snapshot"] = "snapshot";
    /** 多路径存储 */
    LicenseFeature["StorageMultiPaths"] = "storage_multi_paths";
    /** 网络存储 */
    LicenseFeature["StorageNetwork"] = "storage_network";
    /** 计划快照 */
    LicenseFeature["SnapshotSchedule"] = "snapshot_schedule";
    /** 备份 */
    LicenseFeature["Backup"] = "backup";
    /** 高可用 */
    LicenseFeature["HighAvailability"] = "high_availability";
    /** 批量操作 */
    LicenseFeature["BatchOperation"] = "batch_operation";
    /** 导入 */
    LicenseFeature["Import"] = "import";
    /** 通知消息 */
    LicenseFeature["NotifyMessage"] = "notify_message";
    /** 图形透传 */
    LicenseFeature["GraphicPassthrough"] = "graphic_passthrough";
    /** 迁移 */
    LicenseFeature["Migration"] = "migration";
    /** 地址池 */
    LicenseFeature["AddressPool"] = "address_pool";
    /** 内存合并 */
    LicenseFeature["MemoryMerge"] = "memory_merge";
})(LicenseFeature || (exports.LicenseFeature = LicenseFeature = {}));
var SignatureAlgorithm;
(function (SignatureAlgorithm) {
    //"ed25519"
    SignatureAlgorithm["Ed25519"] = "ed25519";
})(SignatureAlgorithm || (exports.SignatureAlgorithm = SignatureAlgorithm = {}));
var FileCategory;
(function (FileCategory) {
    FileCategory["ISO"] = "iso";
    FileCategory["Disk"] = "disk";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
var FileFormat;
(function (FileFormat) {
    FileFormat["ISO"] = "iso";
    FileFormat["Qcow2"] = "qcow2";
})(FileFormat || (exports.FileFormat = FileFormat = {}));
/**
 * 文件状态
 * @enum {string}
 */
var FileState;
(function (FileState) {
    /** 已分配，无数据 */
    FileState["Allocated"] = "allocated";
    /** 已就绪 */
    FileState["Ready"] = "ready";
    /** 更新中 */
    FileState["Updating"] = "updating";
    /** 已损坏 */
    FileState["Corrupted"] = "corrupted";
})(FileState || (exports.FileState = FileState = {}));
/**
 * 统计范围
 * @enum {string}
 */
var StatisticRange;
(function (StatisticRange) {
    /** 最近1小时 */
    StatisticRange["LastHour"] = "last_hour";
    /** 最近24小时 */
    StatisticRange["Last24Hours"] = "last_24_hours";
    /** 最近7天 */
    StatisticRange["Last7Days"] = "last_7_days";
    /** 最近30天 */
    StatisticRange["Last30Days"] = "last_30_days";
})(StatisticRange || (exports.StatisticRange = StatisticRange = {}));
/**
 * 控制台事件等级
 * @enum {string}
 */
var ConsoleEventLevel;
(function (ConsoleEventLevel) {
    /** 信息 */
    ConsoleEventLevel["Info"] = "info";
    /** 警告 */
    ConsoleEventLevel["Warning"] = "warning";
    /** 警报 */
    ConsoleEventLevel["Alert"] = "alert";
    /** 严重 */
    ConsoleEventLevel["Critical"] = "critical";
})(ConsoleEventLevel || (exports.ConsoleEventLevel = ConsoleEventLevel = {}));
/**
 * 控制台事件范围
 * @enum {string}
 */
var ConsoleEventRange;
(function (ConsoleEventRange) {
    /** 系统 */
    ConsoleEventRange["System"] = "system";
    /** 集群 */
    ConsoleEventRange["Cluster"] = "cluster";
    /** 资源池 */
    ConsoleEventRange["Pool"] = "pool";
    /** 节点 */
    ConsoleEventRange["Node"] = "node";
})(ConsoleEventRange || (exports.ConsoleEventRange = ConsoleEventRange = {}));
/**
 * 控制台事件分类
 * @enum {string}
 */
var ConsoleEventCategory;
(function (ConsoleEventCategory) {
    /** 云主机 */
    ConsoleEventCategory["Guest"] = "guest";
    /** 存储 */
    ConsoleEventCategory["Storage"] = "storage";
    /** 网络 */
    ConsoleEventCategory["Network"] = "network";
    /** 系统 */
    ConsoleEventCategory["System"] = "system";
    /** 资源 */
    ConsoleEventCategory["Resource"] = "resource";
    /** 配置 */
    ConsoleEventCategory["Config"] = "config";
    /** 安全 */
    ConsoleEventCategory["Security"] = "security";
    /** 认证 */
    ConsoleEventCategory["Auth"] = "auth";
    /** 任务 */
    ConsoleEventCategory["Task"] = "task";
})(ConsoleEventCategory || (exports.ConsoleEventCategory = ConsoleEventCategory = {}));
/**
 * 导入云主机供应商
 * @enum {string}
 */
var ImportVendor;
(function (ImportVendor) {
    /** VMware ESXi */
    ImportVendor["VMWareESXi"] = "vmware_esxi";
})(ImportVendor || (exports.ImportVendor = ImportVendor = {}));
exports.NODE_RESOURCE_SNAPSHOT_FIELD_COUNT = ResourceSnapshotField.GuestUnknown + 1;
exports.POOL_RESOURCE_SNAPSHOT_FIELD_COUNT = ResourceSnapshotField.NodeLost + 1;
/**
 * 用户角色枚举
 * @enum {string}
 */
var UserRole;
(function (UserRole) {
    /**
     * 超级管理员角色
     */
    UserRole["Super"] = "super";
    /**
     * 管理员角色
     */
    UserRole["Manager"] = "manager";
    /**
     * 普通用户角色
     */
    UserRole["User"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * 密码哈希算法枚举
 * @enum {string}
 */
var PasswordHasher;
(function (PasswordHasher) {
    /**
     * bcrypt 密码哈希算法
     */
    PasswordHasher["Bcrypt"] = "bcrypt";
})(PasswordHasher || (exports.PasswordHasher = PasswordHasher = {}));
/**
 * 令牌签名方法枚举
 * @enum {string}
 * secret - ['HS256', 'HS384', 'HS512']
 * rsa - ['RS256', 'RS384', 'RS512']
 * ec - ['ES256', 'ES384', 'ES512']
 */
var TokenSigningMethod;
(function (TokenSigningMethod) {
    /** HMAC 使用 SHA-256 哈希算法 */
    TokenSigningMethod["HS256"] = "HS256";
    /** HMAC 使用 SHA-384 哈希算法 */
    TokenSigningMethod["HS384"] = "HS384";
    /** HMAC 使用 SHA-512 哈希算法 */
    TokenSigningMethod["HS512"] = "HS512";
    /** RSA 使用 SHA-256 哈希算法 */
    TokenSigningMethod["RS256"] = "RS256";
    /** RSA 使用 SHA-384 哈希算法 */
    TokenSigningMethod["RS384"] = "RS384";
    /** RSA 使用 SHA-512 哈希算法 */
    TokenSigningMethod["RS512"] = "RS512";
    /** ECDSA 使用 SHA-256 哈希算法 */
    TokenSigningMethod["ES256"] = "ES256";
    /** ECDSA 使用 SHA-384 哈希算法 */
    TokenSigningMethod["ES384"] = "ES384";
    /** ECDSA 使用 SHA-512 哈希算法 */
    TokenSigningMethod["ES512"] = "ES512";
})(TokenSigningMethod || (exports.TokenSigningMethod = TokenSigningMethod = {}));
