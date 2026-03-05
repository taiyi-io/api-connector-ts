/**
 * 向API服务发送请求的数据结构定义
 */
import { TaskData, ClusterNodeData, ComputePoolStatus, StoragePool, StoragePoolListRecord, AddressPoolConfigView, AddressPoolDetailView, SecurityPolicyGroup, SecurityPolicyRecord, GuestSecurityPolicy, GuestView, FileStatus, FileView, DataStore, SnapshotRecord, SnapshotTreeNode, GuestResourceUsageRecord, NodeResourceSnapshotRecord, PoolResourceSnapshotRecord, ClusterResourceSnapshotRecord, GuestSystemView, WarningRecord, ConsoleEvent, NodeConfigStatus, SSHKeyView, License, LicenseRecord, ClusterStatus, NetworkGraphNode, ResourceMonitorConfig, ImportSource, ImportTarget, UserGroupRecord, UserCredentialRecord, UserToken, PrivateKey, UserAccessRecord, SystemStatus, ResourcePermissions, ClusterNode, ComputePoolConfig, GuestConfig, VolumeSpec, FileSpec, VolumeContainer, GuestFilter, NodeConfig, GuestSystemSpec, UserGroup, SecurityRule } from "./data-defines";
import { UserRole, controlCommandEnum, StorageType, VolumeContainerStrategy, StatisticRange, ComputePoolStrategy, ConsoleEventLevel, ImportVendor, ResourceType, SignatureAlgorithm, ResourceAccessLevel } from "./enums";
export interface ControlCommandResponse {
    id?: string;
    total?: number;
    task?: TaskData;
    tasks?: TaskData[];
    cluster_node?: ClusterNodeData;
    cluster_nodes?: ClusterNodeData[];
    compute_pool?: ComputePoolStatus;
    compute_pools?: ComputePoolStatus[];
    storage_pool?: StoragePool;
    storage_pools?: StoragePoolListRecord[];
    address_pool_configs?: AddressPoolConfigView[];
    address_pool_detail?: AddressPoolDetailView;
    guests?: GuestView[];
    guest?: GuestView;
    file?: FileStatus;
    files?: FileView[];
    resource_pools?: DataStore[];
    snapshot?: SnapshotRecord;
    snapshots?: SnapshotTreeNode[];
    resource_usages?: GuestResourceUsageRecord[];
    resource_statistic?: ResourceStatisticUnitRecord[];
    node_snapshots?: NodeResourceSnapshotRecord[];
    pool_snapshots?: PoolResourceSnapshotRecord[];
    cluster_snapshot?: ClusterResourceSnapshotRecord;
    systems?: GuestSystemView[];
    system?: GuestSystemView;
    warnings?: WarningRecord[];
    logs?: ConsoleEvent[];
    critical?: number;
    alert?: number;
    warning?: number;
    config?: NodeConfigStatus;
    ssh_keys?: SSHKeyView[];
    license?: License;
    licenses?: LicenseRecord[];
    cluster_status?: ClusterStatus;
    network_graph?: NetworkGraphNode[];
    monitor_rules?: ResourceMonitorConfig;
    import_sources?: ImportSource[];
    import_targets?: ImportTarget[];
    user_group_members?: string[];
    user_roles?: UserRole[];
    user_groups?: UserGroupRecord[];
    user_credentials?: UserCredentialRecord[];
    user_tokens?: UserToken[];
    private_key?: PrivateKey;
    password?: string;
    user_accesses?: UserAccessRecord[];
    system_status?: SystemStatus;
    resource_permissions?: ResourcePermissions;
    white_list?: string[];
    security_policy?: SecurityPolicyGroup;
    security_policies?: SecurityPolicyRecord[];
    guest_security_policy?: GuestSecurityPolicy;
}
export interface ControlCommandRequest {
    type: controlCommandEnum;
    create_guest?: ControlCreateGuestParams;
    delete_guest?: ControlDeleteGuestParams;
    add_volume?: ControlAddVolumeParams;
    delete_volume?: ControlDeleteVolumeParams;
    add_external_interface?: ControlInterfaceParams;
    remove_external_interface?: ControlInterfaceParams;
    add_internal_interface?: ControlInterfaceParams;
    remove_internal_interface?: ControlInterfaceParams;
    modify_cpu?: ControlModifyCPUParams;
    modify_memory?: ControlModifyMemoryParams;
    modify_hostname?: ControlModifyHostnameParams;
    reset_monitor?: ControlResetMonitorParams;
    start_guest?: ControlStartGuestParams;
    stop_guest?: ControlStopGuestParams;
    modify_password?: ControlModifyPasswordParams;
    modify_autostart?: ControlModifyAutoStartParams;
    get_task?: ControlGetTaskParams;
    query_tasks?: ControlQueryTasksParams;
    add_node?: ControlAddNodeParams;
    remove_node?: ControlRemoveNodeParams;
    enable_node?: ControlNodeFlagParams;
    disable_node?: ControlNodeFlagParams;
    query_nodes?: ControlNodeQueryParams;
    query_pools?: ControlPoolQueryParams;
    get_pool?: ControlGetPoolParams;
    add_pool?: ComputePoolConfig;
    modify_pool?: ComputePoolConfig;
    delete_pool?: ControlDeletePoolParams;
    add_pool_node?: ControlAddPoolNodeParams;
    remove_pool_node?: ControlRemovePoolNodeParams;
    query_storage_pools?: ControlStoragePoolQueryParams;
    get_storage_pool?: ControlGetStoragePoolParams;
    add_storage_pool?: ControlAddStoragePoolParams;
    remove_storage_pool?: ControlRemoveStoragePoolParams;
    modify_remote_storage_strategy?: ControlModifyRemoteStorageStrategyParams;
    add_remote_container?: ControlAddRemoteContainerParams;
    modify_remote_container?: ControlModifyRemoteContainerParams;
    remove_remote_container?: ControlRemoveRemoteContainerParams;
    change_remote_container_flag?: ControlChangeRemoteContainerFlagParams;
    create_address_pool?: ControlCreateAddressPoolParams;
    modify_address_pool?: ControlModifyAddressPoolParams;
    delete_address_pool?: ControlDeleteAddressPoolParams;
    add_address_range?: ControlAddAddressRangeParams;
    remove_address_range?: ControlRemoveAddressRangeParams;
    query_address_pool_configs?: ControlAddressPoolQueryConfigsParams;
    get_address_pool_detail?: ControlGetAddressPoolDetailParams;
    create_security_policy?: ControlCreateSecurityPolicyParams;
    modify_security_policy?: ControlModifySecurityPolicyParams;
    delete_security_policy?: ControlDeleteSecurityPolicyParams;
    query_security_policies?: ControlQuerySecurityPoliciesParams;
    get_security_policy?: ControlGetSecurityPolicyParams;
    copy_security_policy?: ControlCopySecurityPolicyParams;
    get_guest_security_policy?: ControlGetGuestSecurityPolicyParams;
    modify_guest_security_policy?: ControlModifyGuestSecurityPolicyParams;
    reset_guest_security_policy?: ControlResetGuestSecurityPolicyParams;
    query_guests?: ControlQueryGuestsParams;
    get_guest?: ControlGetGuestParams;
    create_iso?: CreateFileParams;
    delete_iso?: DeleteFileParams;
    modify_iso?: ModifyFileParams;
    get_iso?: ControlGetFileParams;
    query_iso?: ControlQueryFileParams;
    create_disk?: CreateFileParams;
    delete_disk?: DeleteFileParams;
    modify_disk?: ModifyFileParams;
    get_disk?: ControlGetFileParams;
    query_disk?: ControlQueryFileParams;
    insert_media?: ControlInsertMediaParams;
    eject_media?: ControlEjectMediaParams;
    resize_disk?: ControlResizeDiskParams;
    shrink_disk?: ControlShrinkDiskParams;
    install_disk_image?: ControlInstallDiskImageParams;
    create_disk_image?: ControlCreateDiskImageParams;
    sync_iso_files?: ControlSyncFilesParams;
    sync_disk_files?: ControlSyncFilesParams;
    get_node?: ControlGetNodeParams;
    query_resource_pools?: ControlQueryResourcePoolsParams;
    modify_resource_storage_strategy?: ControlModifyResourceStorageStrategyParams;
    add_resource_container?: ControlAddResourceContainerParams;
    modify_resource_container?: ControlModifyResourceContainerParams;
    remove_resource_container?: ControlRemoveResourceContainerParams;
    change_resource_container_flag?: ControlChangeResourceContainerFlagParams;
    query_snapshots?: ControlQuerySnapshotParams;
    get_snapshot?: ControlGetSnapshotParams;
    create_snapshot?: ControlCreateSnapshotParams;
    restore_snapshot?: ControlRestoreSnapshotParams;
    delete_snapshot?: ControlDeleteSnapshotParams;
    query_resource_usages?: ControlQueryResourceUsagesParams;
    query_resource_statistic?: ControlQueryResourceStatisticParams;
    query_pool_nodes?: ControlQueryComputeNodesParams;
    change_pool_strategy?: ControlComputePoolStrategyParams;
    pool_strategy?: ControlComputePoolStragegyParams;
    query_nodes_usage?: ControlQueryNodesUsageParams;
    query_pools_usage?: ControlQueryPoolsUsageParams;
    node_flag?: ControlNodeFlagParams;
    query_logs?: ControlQueryLogsParams;
    query_warnings?: ControlQueryWarningsParams;
    count_warnings?: ControlCountWarningsParams;
    sum_warnings?: ControlSumWarningsParams;
    remove_warnings?: ControlRemoveWarningsParams;
    mark_warnings_as_read?: ControlMarkWarningsAsReadParams;
    modify_config?: ControlModifyConfigParams;
    get_config?: ControlGetConfigParams;
    restart_service?: ControlRestartServiceParams;
    add_ssh_key?: ControlAddSSHKeyParams;
    remove_ssh_key?: ControlRemoveSSHKeyParams;
    query_ssh_keys?: ControlQuerySSHKeysParams;
    get_license?: ControlGetLicenseParams;
    active_license?: ControlActiveLicenseParams;
    add_license?: ControlAddLicenseParams;
    remove_license?: ControlRemoveLicenseParams;
    set_monitor_rules?: ControlSetMonitorRulesParams;
    reload_resource_storage?: ControlReloadResourceStorageParams;
    update_disk_volume_size?: ControlUpdateDiskVolumeSizeParams;
    add_import_source?: ControlAddImportSourceParams;
    modify_import_source?: ControlModifyImportSourceParams;
    remove_import_source?: ControlRemoveImportSourceParams;
    query_import_sources?: ControlQueryImportSourcesParams;
    query_import_targets?: ControlQueryImportTargetsParams;
    import_guests?: ControlImportGuestsParams;
    query_systems?: ControlQuerySystemsParams;
    get_system?: ControlGetSystemParams;
    add_system?: ControlAddSystemParams;
    modify_system?: ControlModifySystemParams;
    remove_system?: ControlRemoveSystemParams;
    migrate_to_node?: ControlMigrateToNodeParams;
    modify_external_interface_mac?: ControlModifyExternalInterfaceMACParams;
    modify_internal_interface_mac?: ControlModifyInternalInterfaceMACParams;
    modify_group_roles?: ControlModifyGroupRolesParams;
    get_group_roles?: ControlGetGroupRolesParams;
    query_group_members?: ControlQueryGroupMembersParams;
    add_group?: ControlAddGroupParams;
    remove_group?: ControlRemoveGroupParams;
    query_groups?: ControlQueryGroupsParams;
    initialize_system?: ControlInitializeSystemParams;
    add_user?: ControlAddUserParams;
    remove_user?: ControlRemoveUserParams;
    query_users?: ControlQueryUsersParams;
    change_user_group?: ControlChangeUserGroupParams;
    query_user_tokens?: ControlQueryUserTokensParams;
    generate_user_token?: ControlGenerateUserTokenParams;
    revoke_user_token?: ControlRevokeUserTokenParams;
    change_user_secret?: ControlChangeUserSecretParams;
    reset_user_secret?: ControlResetUserSecretParams;
    revoke_access?: ControlRevokeAccessParams;
    invalidate_access?: ControlInvalidateAccessParams;
    query_accesses?: ControlQueryAccessesParams;
    set_system_resource?: ControlSetSystemResourceParams;
    get_resource_permissions?: ControlGetResourcePermissionsParams;
    set_resource_permissions?: ControlSetResourcePermissionsParams;
    add_white_list?: ControlAddWhiteListParams;
    remove_white_list?: ControlRemoveWhiteListParams;
    update_white_list?: ControlUpdateWhiteListParams;
    query_white_list?: ControlQueryWhiteListParams;
    query_devices?: ControlQueryDevicesParams;
}
export interface ControlResponse {
    error?: string;
    data?: unknown;
}
export interface ResourceStatisticUnitRecord {
    fields: number[];
    timestamp: string;
}
export interface ResourceUsageDurationRecord {
    fields: number[];
    timestamp: string;
}
/**
 * 密码校验请求参数
 * @interface ControlAuthBySecretParams
 * @param user - 用户标识
 * @param device - 设备标识
 * @param secret - 认证密钥
 */
export interface ControlAuthBySecretParams {
    /** 用户标识 */
    user: string;
    /** 设备标识 */
    device: string;
    /** 认证密钥 */
    secret: string;
}
/**
 * 令牌校验请求参数
 * @interface ControlAuthByTokenParams
 * @param user - 用户标识
 * @param device - 设备标识
 * @param serial - 序列号
 * @param nonce - 随机数
 * @param timestamp - 时间戳
 * @param signature - 签名
 * @param signature_algorithm - 签名算法
 */
export interface ControlAuthByTokenParams {
    user: string;
    device: string;
    serial: string;
    nonce: string;
    timestamp: string;
    signature: string;
    signature_algorithm: SignatureAlgorithm;
}
/**
 * 更新令牌请求参数
 * @interface ControlAuthRefreshParams
 * @param user - 用户标识
 * @param device - 设备标识
 * @param token - 认证令牌
 */
export interface ControlAuthRefreshParams {
    /** 用户标识 */
    user: string;
    /** 设备标识 */
    device: string;
    /** 认证令牌 */
    token: string;
}
/**
 * 云主机网卡请求参数
 * @interface
 * @property guest - 关联云主机ID
 * @property mac_address - 网卡MAC地址
 */
export interface ControlInterfaceParams {
    guest: string;
    mac_address?: string;
}
/**
 * 云主机创建请求参数
 * @interface
 * @property name - 名称
 * @property cores - 核心数
 * @property memory - 内存大小，单位MB
 * @property disks - 磁盘大小列表，单位MB
 * @property source_image - 源镜像
 * @property auto_start - 自动启动
 * @property cloud_init - CloudInit配置
 * @property pool - 所属计算资源池
 * @property system - 云主机系统规格
 */
export interface ControlCreateGuestParams extends GuestConfig {
    pool: string;
    system?: string;
}
/**
 * 云主机删除请求参数
 * @interface
 * @property guest - 云主机ID
 */
export interface ControlDeleteGuestParams {
    guest: string;
}
/**
 * 云主机添加磁盘请求参数
 * @interface
 * @property guest - 云主机ID
 * @property volume - 磁盘规格
 */
export interface ControlAddVolumeParams {
    guest: string;
    volume: VolumeSpec;
}
/**
 * 云主机删除磁盘请求参数
 * @interface
 * @property guest - 云主机ID
 * @property tag - 磁盘标签
 */
export interface ControlDeleteVolumeParams {
    guest: string;
    tag: string;
}
/**
 * 云主机修改CPU请求参数
 * @interface
 * @property guest - 云主机ID
 * @property cores - 核心数
 */
export interface ControlModifyCPUParams {
    guest: string;
    cores: number;
}
/**
 * 云主机修改内存请求参数
 * @interface
 * @property guest - 云主机ID
 * @property memory - 内存大小，单位MB
 */
export interface ControlModifyMemoryParams {
    guest: string;
    memory: number;
}
/**
 * 云主机修改主机名请求参数
 * @interface
 * @property guest - 云主机ID
 * @property hostname - 主机名
 */
export interface ControlModifyHostnameParams {
    guest: string;
    hostname: string;
}
/**
 * 云主机重置监控密码请求参数
 * @interface
 * @property guest - 云主机ID
 */
export interface ControlResetMonitorParams {
    guest: string;
}
/**
 * 云主机启动请求参数
 * @interface
 * @property guest - 云主机ID
 * @property media - 媒体ID，无媒体启动留空
 */
export interface ControlStartGuestParams {
    guest: string;
    media?: string;
    expect_epoch?: number;
}
/**
 * 云主机停止请求参数
 * @interface
 * @property guest - 云主机ID
 * @property reboot - 是否重启
 * @property force - 是否强制停止
 */
export interface ControlStopGuestParams {
    guest: string;
    reboot: boolean;
    force: boolean;
}
/**
 * 云主机修改密码请求参数
 * @interface
 * @property guest - 云主机ID
 * @property user - 用户名
 * @property password - 密码
 */
export interface ControlModifyPasswordParams {
    guest: string;
    user: string;
    password: string;
}
/**
 * 云主机修改自动启动请求参数
 * @interface
 * @property guest - 云主机ID
 * @property enable - 是否自动启动
 */
export interface ControlModifyAutoStartParams {
    guest: string;
    enable: boolean;
}
/**
 * 云主机添加媒体请求参数
 * @interface
 * @property guest - 云主机ID
 * @property media - 媒体ID
 */
export interface ControlInsertMediaParams {
    guest: string;
    media: string;
}
/**
 * 云主机弹出媒体请求参数
 * @interface
 * @property guest - 云主机ID
 */
export interface ControlEjectMediaParams {
    guest: string;
}
/**
 * 云主机调整磁盘大小请求参数
 * @interface
 * @property guest - 云主机ID
 * @property volume - 磁盘标签
 * @property size - 目标大小
 */
export interface ControlResizeDiskParams {
    guest: string;
    volume: string;
    size: number;
}
/**
 * 云主机压缩磁盘请求参数
 * @interface
 * @property guest - 云主机ID
 * @property volume - 磁盘标签
 */
export interface ControlShrinkDiskParams {
    guest: string;
    volume: string;
}
/**
 * 云主机安装镜像请求参数
 * @interface
 * @property guest - 云主机ID
 * @property volume - 磁盘标签
 * @property file - 镜像文件ID
 */
export interface ControlInstallDiskImageParams {
    guest: string;
    volume: string;
    file: string;
}
/**
 * 云主机创建镜像请求参数
 * @interface
 * @property guest - 云主机ID
 * @property volume - 磁盘标签
 * @property spec - 镜像规格
 * @property access_level - 资源访问级别
 */
export interface ControlCreateDiskImageParams {
    guest: string;
    volume: string;
    spec: FileSpec;
    access_level: ResourceAccessLevel;
}
/**
 * 读取任务请求参数
 * @interface
 * @property id - 任务ID
 */
export interface ControlGetTaskParams {
    id: string;
}
/**
 * 查询任务列表请求参数
 * @interface
 * @property offset - 偏移量
 * @property page_size - 每页数量
 */
export interface ControlQueryTasksParams {
    offset: number;
    page_size: number;
}
/**
 * 集群添加节点请求参数
 * @interface
 * @property host - 节点地址
 * @property port - 节点端口
 */
export interface ControlAddNodeParams extends ClusterNode {
}
/**
 * 集群删除节点请求参数
 */
export interface ControlRemoveNodeParams {
    id: string;
}
/**
 * 获取节点信息请求参数
 * @interface
 * @property id - 节点ID
 */
export interface ControlGetNodeParams {
    id: string;
}
/**
 * 获取计算资源池请求参数
 * @interface
 * @property id - 资源池ID
 */
export interface ControlGetPoolParams {
    id: string;
}
/**
 * 删除计算资源池请求参数
 * @interface
 * @property id - 资源池ID
 */
export interface ControlDeletePoolParams {
    id: string;
}
/**
 * 添加计算资源池节点请求参数
 * @interface
 * @property pool - 资源池ID
 * @property node - 节点ID
 */
export interface ControlAddPoolNodeParams {
    pool: string;
    node: string;
}
/**
 * 删除计算资源池节点请求参数
 * @interface
 * @property pool - 资源池ID
 * @property node - 节点ID
 */
export interface ControlRemovePoolNodeParams {
    pool: string;
    node: string;
}
/**
 * 获取存储资源池请求参数
 * @interface
 * @property id - 资源池ID
 */
export interface ControlGetStoragePoolParams {
    id: string;
}
/**
 * 添加存储资源池请求参数
 * @interface
 * @property id - 资源池ID
 * @property type - 资源池类型
 * @property description - 资源池描述
 * @property uri - 资源池URI
 * @property access_token - 资源池访问令牌
 * @property access_secret - 资源池访问密钥
 */
export interface ControlAddStoragePoolParams {
    id: string;
    type: StorageType;
    description?: string;
    uri?: string;
    access_token?: string;
    access_secret?: string;
}
/**
 * 删除存储资源池请求参数
 * @interface
 * @property id - 资源池ID
 */
export interface ControlRemoveStoragePoolParams {
    id: string;
}
/**
 * 修改后端存储策略请求参数
 * @interface
 * @property pool_id - 资源池ID
 * @property strategy - 存储策略
 */
export interface ControlModifyRemoteStorageStrategyParams {
    pool_id: string;
    strategy: VolumeContainerStrategy;
}
/**
 * 添加后端存储容器请求参数
 * @interface
 * @property pool_id - 资源池ID
 * @property container - 存储容器
 */
export interface ControlAddRemoteContainerParams {
    pool_id: string;
    container: VolumeContainer;
}
/**
 * 修改后端存储容器请求参数
 * @interface
 * @property pool_id - 资源池ID
 * @property index - 容器索引
 * @property container - 存储容器
 */
export interface ControlModifyRemoteContainerParams {
    pool_id: string;
    index: number;
    container: VolumeContainer;
}
/**
 * 删除后端存储容器请求参数
 * @interface
 * @property pool_id - 资源池ID
 * @property index - 容器索引
 */
export interface ControlRemoveRemoteContainerParams {
    pool_id: string;
    index: number;
}
/**
 * 修改后端存储容器状态请求参数
 * @interface
 * @property pool_id - 资源池ID
 * @property index - 容器索引
 * @property enabled - 是否启用
 */
export interface ControlChangeRemoteContainerFlagParams {
    pool_id: string;
    index: number;
    enabled: boolean;
}
/**
 * 地址池创建请求参数
 * @interface
 * @property id - 地址池ID
 * @property mode - 模式 (address/port)
 * @property description - 描述
 * @property gateway_v4 - IPv4网关地址
 * @property gateway_v6 - IPv6网关地址
 * @property dns - DNS服务器列表
 * @property upstream_gateway - 上游网关地址
 */
export interface ControlCreateAddressPoolParams {
    id: string;
    mode: string;
    description?: string;
    gateway_v4?: string;
    gateway_v6?: string;
    dns?: string[];
    upstream_gateway?: string;
}
/**
 * 地址池修改请求参数
 * @interface
 * @property id - 地址池ID
 * @property description - 描述
 * @property gateway_v4 - IPv4网关地址
 * @property gateway_v6 - IPv6网关地址
 * @property dns - DNS服务器列表
 * @property upstream_gateway - 上游网关地址
 */
export interface ControlModifyAddressPoolParams {
    id: string;
    description?: string;
    gateway_v4?: string;
    gateway_v6?: string;
    dns?: string[];
    upstream_gateway?: string;
}
export interface ControlDeleteAddressPoolParams {
    id: string;
}
export interface ControlGetAddressPoolDetailParams {
    id: string;
}
/**
 * 添加地址范围请求参数
 * @interface
 * @property pool - 地址池ID
 * @property set_type - 集合类型 (ext-v4/ext-v6/int-v4/int-v6)
 * @property begin - 起始地址
 * @property end - 结束地址
 * @property cidr - CIDR格式
 */
export interface ControlAddAddressRangeParams {
    pool: string;
    set_type: string;
    begin?: string;
    end?: string;
    cidr?: string;
}
/**
 * 删除地址范围请求参数
 * @interface
 * @property pool - 地址池ID
 * @property set_type - 集合类型 (ext-v4/ext-v6/int-v4/int-v6)
 * @property begin - 起始地址
 * @property end - 结束地址
 */
export interface ControlRemoveAddressRangeParams {
    pool: string;
    set_type: string;
    begin: string;
    end: string;
}
/**
 * 查询云主机请求参数
 * @interface
 * @property start - 起始索引
 * @property limit - 每页数量
 * @property filter - 云主机筛选条件
 */
export interface ControlQueryGuestsParams {
    start: number;
    limit: number;
    filter?: GuestFilter;
}
/**
 * 获取云主机详情请求参数
 * @interface
 * @property id - 云主机ID
 */
export interface ControlGetGuestParams {
    id: string;
}
/**
 * 获取文件请求参数
 * @interface
 * @property id - 文件ID
 */
export interface ControlGetFileParams {
    id: string;
}
/**
 * 查询文件请求参数
 * @interface
 * @property start - 起始索引
 * @property limit - 每页数量
 * @property only_self - 是否只查询当前用户的文件
 */
export interface ControlQueryFileParams {
    start: number;
    limit: number;
    only_self?: boolean;
}
/**
 * 创建文件请求参数
 * @interface
 * @property spec - 文件规格
 * @property access_level - 资源访问级别
 */
export interface CreateFileParams {
    spec: FileSpec;
    access_level: ResourceAccessLevel;
}
/**
 * 修改文件请求参数
 * @interface
 * @property id - 文件ID
 * @property spec - 文件规格
 */
export interface ModifyFileParams {
    id: string;
    spec: FileSpec;
}
/**
 * 删除文件请求参数
 * @interface
 * @property id - 文件ID
 */
export interface DeleteFileParams {
    id: string;
}
/**
 * 资源节点存储池查询请求参数
 * @interface
 * @property node_id - 节点ID
 */
export interface ControlQueryResourcePoolsParams {
    node_id: string;
}
/**
 * 资源节点存储池策略修改请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 * @property strategy - 存储策略
 */
export interface ControlModifyResourceStorageStrategyParams {
    node_id: string;
    pool_id: string;
    strategy: VolumeContainerStrategy;
}
/**
 * 资源节点存储容器添加请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 * @property container - 存储容器
 */
export interface ControlAddResourceContainerParams {
    node_id: string;
    pool_id: string;
    container: VolumeContainer;
}
/**
 * 资源节点存储容器修改请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 * @property index - 容器索引
 * @property container - 存储容器
 */
export interface ControlModifyResourceContainerParams {
    node_id: string;
    pool_id: string;
    index: number;
    container: VolumeContainer;
}
/**
 * 资源节点存储容器删除请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 * @property index - 容器索引
 */
export interface ControlRemoveResourceContainerParams {
    node_id: string;
    pool_id: string;
    index: number;
}
/**
 * 资源节点存储容器状态修改请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 * @property index - 容器索引
 * @property enabled - 是否启用
 */
export interface ControlChangeResourceContainerFlagParams {
    node_id: string;
    pool_id: string;
    index: number;
    enabled: boolean;
}
/**
 * 云主机快照查询请求参数
 * @interface
 * @property guest - 云主机ID
 */
export interface ControlQuerySnapshotParams {
    guest: string;
}
/**
 * 云主机快照详情请求参数
 * @interface
 * @property guest - 云主机ID
 * @property snapshot - 快照ID
 */
export interface ControlGetSnapshotParams {
    guest: string;
    snapshot: string;
}
/**
 * 云主机快照创建请求参数
 * @interface
 * @property guest - 云主机ID
 * @property label - 快照标签
 * @property description - 快照描述
 */
export interface ControlCreateSnapshotParams {
    guest: string;
    label: string;
    description?: string;
}
/**
 * 云主机快照恢复请求参数
 * @interface
 * @property guest - 云主机ID
 * @property snapshot - 快照ID
 */
export interface ControlRestoreSnapshotParams {
    guest: string;
    snapshot: string;
}
/**
 * 云主机快照删除请求参数
 * @interface
 * @property guest - 云主机ID
 * @property snapshot - 快照ID
 */
export interface ControlDeleteSnapshotParams {
    guest: string;
    snapshot: string;
}
/**
 * 查询云主机资源用量请求参数
 * @interface
 * @property targets - 目标云主机ID列表
 */
export interface ControlQueryResourceUsagesParams {
    targets: string[];
}
/**
 * 查询云主机资源统计请求参数
 * @interface
 * @property guest - 云主机ID
 * @property range - 统计范围
 */
export interface ControlQueryResourceStatisticParams {
    guest: string;
    range: StatisticRange;
}
/**
 * 计算资源池查询所属节点列表请求参数
 * @interface
 * @property pool_id - 存储池ID
 */
export interface ControlQueryComputeNodesParams {
    pool_id: string;
}
/**
 * 查询节点资源用量请求参数
 * @interface
 * @property targets - 目标云主机ID列表
 */
export interface ControlQueryNodesUsageParams {
    targets: string[];
}
/**
 * 查询计算池资源用量请求参数
 * @interface
 * @property targets - 目标存储池ID列表
 */
export interface ControlQueryPoolsUsageParams {
    targets: string[];
}
/**
 * 修改节点状态请求参数
 * @interface
 * @property node_id - 节点ID
 */
export interface ControlNodeFlagParams {
    node_id: string;
}
/**
 * 修改计算池分配策略请求参数
 * @interface
 * @property pool_id - 存储池ID
 * @property strategy - 存储策略
 */
export interface ControlComputePoolStrategyParams {
    pool_id: string;
    strategy: ComputePoolStrategy;
}
/**
 * 查询操作日志请求参数
 * @interface
 * @property date - 日期
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryLogsParams {
    date: string;
    offset?: number;
    limit?: number;
}
/**
 * 查询警告列表请求参数
 * @interface
 * @property level - 警告等级
 * @property unread_only - 是否只查询未读警告
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryWarningsParams {
    level?: ConsoleEventLevel;
    unread_only?: boolean;
    offset?: number;
    limit?: number;
}
/**
 * 查询警告数量请求参数
 * @interface
 * @property node_id - 节点ID
 */
export interface ControlCountWarningsParams {
    node_id: string;
}
/**
 * 统计警告总数请求参数
 * @interface
 * @property node_list - 节点ID列表
 */
export interface ControlSumWarningsParams {
    node_list: string[];
}
/**
 * 删除警告请求参数
 * @interface
 * @property id_list - 警告ID列表
 */
export interface ControlRemoveWarningsParams {
    id_list: string[];
}
/**
 * 标记警告为已读请求参数
 * @interface
 * @property id_list - 警告ID列表
 */
export interface ControlMarkWarningsAsReadParams {
    id_list: string[];
}
/**
 * 修改节点配置请求参数
 * @interface
 * @property node_id - 节点ID
 * @property config - 节点配置
 */
export interface ControlModifyConfigParams {
    node_id: string;
    config: NodeConfig;
}
/**
 * 获取节点配置请求参数
 * @interface
 * @property node_id - 节点ID
 */
export interface ControlGetConfigParams {
    node_id: string;
}
/**
 * 重启节点服务请求参数
 * @interface
 * @property node_id - 节点ID
 */
export interface ControlRestartServiceParams {
    node_id: string;
}
/**
 * 添加SSH密钥请求参数
 * @interface
 * @property label - 密钥标签
 * @property content - 密钥内容
 * @property access_level - 资源访问级别
 */
export interface ControlAddSSHKeyParams {
    label: string;
    content: string;
    access_level: ResourceAccessLevel;
}
/**
 * 删除SSH密钥请求参数
 * @interface
 * @property id - 密钥ID
 */
export interface ControlRemoveSSHKeyParams {
    id: string;
}
/**
 * 查询SSH密钥列表请求参数
 * @interface
 * @property offset - 查询起始偏移量
 * @property limit - 每页数量
 * @property only_self - 是否只查询当前用户的密钥
 */
export interface ControlQuerySSHKeysParams {
    offset: number;
    limit: number;
    only_self?: boolean;
}
/**
 * 获取许可证详情请求参数
 * @interface
 * @property id - 许可证ID
 */
export interface ControlGetLicenseParams {
    id: string;
}
/**
 * 激活许可证请求参数
 * @interface
 * @property id - 许可证ID
 */
export interface ControlActiveLicenseParams {
    id: string;
}
/**
 * 添加许可证请求参数
 * @interface
 * @property license - 许可证信息
 */
export interface ControlAddLicenseParams {
    license: License;
}
/**
 * 删除许可证请求参数
 * @interface
 * @property id - 许可证ID
 */
export interface ControlRemoveLicenseParams {
    id: string;
}
/**
 * 修改监控规则请求参数
 * @interface
 * @property config - 监控规则配置
 */
export interface ControlSetMonitorRulesParams {
    config: ResourceMonitorConfig;
}
/**
 * 节点重载存储请求参数
 * @interface
 * @property node_id - 节点ID
 * @property pool_id - 存储池ID
 */
export interface ControlReloadResourceStorageParams {
    node_id: string;
    pool_id: string;
}
/**
 * 修改磁盘卷大小请求参数
 * @interface
 * @property id - 磁盘卷ID
 * @property size - 目标大小（MB）
 */
export interface ControlUpdateDiskVolumeSizeParams {
    id: string;
    size: number;
}
/**
 * 添加导入源请求参数
 * @interface
 * @property vendor - 导入源供应商
 * @property url - 导入源URL
 * @property token - 导入源访问令牌
 * @property secret - 导入源访问密钥
 */
export interface ControlAddImportSourceParams {
    vendor: ImportVendor;
    url: string;
    token: string;
    secret: string;
}
/**
 * 修改导入源请求参数
 * @interface
 * @property id - 导入源ID
 * @property url - 导入源URL
 * @property token - 导入源访问令牌
 * @property secret - 导入源访问密钥
 */
export interface ControlModifyImportSourceParams {
    id: string;
    url: string;
    token: string;
    secret: string;
}
/**
 * 删除导入源请求参数
 * @interface
 * @property id - 导入源ID
 */
export interface ControlRemoveImportSourceParams {
    id: string;
}
/**
 * 查询导入源列表请求参数
 * @interface
 * @property start - 起始偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryImportSourcesParams {
    start: number;
    limit: number;
}
/**
 * 查询导入目标列表请求参数
 * @interface
 * @property source - 导入源ID
 */
export interface ControlQueryImportTargetsParams {
    source: string;
}
/**
 * 导入云主机请求参数
 * @interface
 * @property source - 导入源ID
 * @property guests - 客户机ID列表
 * @property to_node - 目标节点ID（可选）
 */
export interface ControlImportGuestsParams {
    source: string;
    guests: string[];
    to_node?: string;
}
/**
 * 查询系统模板列表请求参数
 * @interface
 * @property offset - 分页偏移量
 * @property limit - 每页数量
 * @property only_self - 是否只查询当前用户的系统模板
 */
export interface ControlQuerySystemsParams {
    offset: number;
    limit: number;
    only_self?: boolean;
}
/**
 * 获取系统模板详情请求参数
 * @interface
 * @property id - 系统模板ID
 */
export interface ControlGetSystemParams {
    id: string;
}
/**
 * 添加系统模板请求参数
 * @interface
 * @property label - 系统模板名称
 * @property spec - 系统模板规格
 * @property access_level - 资源访问级别
 */
export interface ControlAddSystemParams {
    label: string;
    spec: GuestSystemSpec;
    access_level: ResourceAccessLevel;
}
/**
 * 修改系统模板请求参数
 * @interface
 * @property id - 系统模板ID
 * @property label - 系统模板名称
 * @property spec - 系统模板规格
 */
export interface ControlModifySystemParams {
    id: string;
    label: string;
    spec: GuestSystemSpec;
}
/**
 * 删除系统模板请求参数
 * @interface
 * @property id - 系统模板ID
 */
export interface ControlRemoveSystemParams {
    id: string;
}
/**
 * 迁移云主机到目标节点请求参数
 * @interface
 * @property target_node - 目标节点ID
 * @property guests - 云主机ID列表
 */
export interface ControlMigrateToNodeParams {
    target_node: string;
    guests: string[];
}
/**
 * 修改外部网卡MAC地址请求参数
 * @interface
 * @property guest - 云主机ID
 * @property device - 设备名称
 * @property mac_address - 新MAC地址
 */
export interface ControlModifyExternalInterfaceMACParams {
    guest: string;
    device: string;
    mac_address: string;
}
/**
 * 修改内部网卡MAC地址请求参数
 * @interface
 * @property guest - 云主机ID
 * @property device - 设备名称
 * @property mac_address - 新MAC地址
 */
export interface ControlModifyInternalInterfaceMACParams {
    guest: string;
    device: string;
    mac_address: string;
}
/**
 * 获取资源权限的请求参数
 * @interface
 * @property type - 资源类型
 * @property id - 资源ID
 */
export interface ControlGetResourcePermissionsParams {
    type: ResourceType;
    id: string;
}
/**
 * 设置资源权限的请求参数
 * @interface
 * @property type - 资源类型
 * @property id - 资源ID
 * @property permissions - 资源权限
 */
export interface ControlSetResourcePermissionsParams {
    type: ResourceType;
    id: string;
    permissions: ResourcePermissions;
}
/**
 * 设置系统资源的请求参数
 * @interface
 * @property type - 资源类型
 * @property id - 资源ID
 * @property value - 资源值
 */
export interface ControlSetSystemResourceParams {
    type: ResourceType;
    id: string;
    value: boolean;
}
/**
 * 添加白名单请求参数
 * @interface
 * @property address - 白名单IP或者IP段(CIDR)
 */
export interface ControlAddWhiteListParams {
    address: string;
}
/**
 * 移除白名单请求参数
 * @interface
 * @property index - 白名单索引
 */
export interface ControlRemoveWhiteListParams {
    index: number;
}
/**
 * 更新白名单请求参数
 * @interface
 * @property index - 白名单索引
 * @property address - 白名单IP或者IP段(CIDR)
 */
export interface ControlUpdateWhiteListParams {
    index: number;
    address: string;
}
/**
 * 查询白名单请求参数
 * @interface
 * @property offset - 查询起始偏移量
 * @property limit - 分页大小
 */
export interface ControlQueryWhiteListParams {
    offset: number;
    limit: number;
}
/**
 * 修改用户组角色
 * @interface ControlModifyGroupRolesParams
 * 用户组操作参数结构 - 修改用户组角色参数
 * @property group - 用户组名称
 * @property roles - 用户角色列表
 */
export interface ControlModifyGroupRolesParams {
    group: string;
    roles: UserRole[];
}
/**
 * 获取用户组角色
 * @interface ControlGetGroupRolesParams
 * 获取用户组角色参数
 * @property group - 用户组名称
 */
export interface ControlGetGroupRolesParams {
    group: string;
}
/**
 * 查询用户组成员
 * @interface ControlQueryGroupMembersParams
 * 查询用户组成员参数
 * @property group - 用户组名称
 * @property offset - 偏移量，可选
 * @property limit - 限制数量，可选
 */
export interface ControlQueryGroupMembersParams {
    group: string;
    offset?: number;
    limit?: number;
}
/**
 * 添加用户组
 * @interface ControlAddGroupParams
 * 添加用户组参数
 * @property group - 用户组信息
 */
export interface ControlAddGroupParams {
    group: UserGroup;
}
/**
 * 删除用户组
 * @interface ControlRemoveGroupParams
 * 删除用户组参数
 * @property group - 用户组名称
 */
export interface ControlRemoveGroupParams {
    group: string;
}
/**
 * 查询用户组列表
 * @interface ControlQueryGroupsParams
 * 查询用户组列表参数
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryGroupsParams {
    offset: number;
    limit: number;
}
/**
 * 初始化系统
 * @interface ControlInitializeSystemParams
 * 初始化系统参数
 * @property user - 用户名
 * @property password - 用户密码
 */
export interface ControlInitializeSystemParams {
    user: string;
    password: string;
}
/**
 * 添加用户
 * @interface ControlAddUserParams
 * 添加用户参数
 * @property user - 用户名
 * @property group - 用户所属组名
 * @property password - 用户密码
 */
export interface ControlAddUserParams {
    user: string;
    group: string;
    password: string;
}
/**
 * 删除用户
 * @interface ControlRemoveUserParams
 * 删除用户参数
 * @property user - 用户名
 */
export interface ControlRemoveUserParams {
    user: string;
}
/**
 * 查询用户列表
 * @interface ControlQueryUsersParams
 * 查询用户列表参数
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryUsersParams {
    offset: number;
    limit: number;
}
/**
 * 修改用户所属组
 * @interface ControlChangeUserGroupParams
 * 修改用户所属组参数
 * @property user - 用户名
 * @property group - 目标用户组名称
 */
export interface ControlChangeUserGroupParams {
    user: string;
    group: string;
}
/**
 * 查询用户令牌列表
 * @interface ControlQueryUserTokensParams
 * 查询用户令牌列表参数
 * @property user - 用户名
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryUserTokensParams {
    user: string;
    offset: number;
    limit: number;
}
/**
 * 生成用户令牌
 * @interface ControlGenerateUserTokenParams
 * 生成用户令牌参数
 * @property user - 用户名
 * @property [description] - 令牌描述，可选
 * @property [months] - 令牌有效期（月），可选
 */
export interface ControlGenerateUserTokenParams {
    user: string;
    description?: string;
    months?: number;
}
/**
 * 撤销用户令牌
 * @interface ControlRevokeUserTokenParams
 * 撤销用户令牌参数
 * @property user - 用户名
 * @property serial - 令牌序列号
 */
export interface ControlRevokeUserTokenParams {
    user: string;
    serial: string;
}
/**
 * 修改用户密码请求参数
 * @interface ControlChangeUserSecretParams
 * 修改用户密码参数
 * @property user - 用户名
 * @property password - 新密码
 */
export interface ControlChangeUserSecretParams {
    user: string;
    password: string;
}
/**
 * 重置用户密码请求参数
 * @interface ControlResetUserSecretParams
 * 重置用户密码参数
 * @property user - 用户名
 */
export interface ControlResetUserSecretParams {
    user: string;
}
/**
 * 撤销访问权限请求参数
 * @interface ControlRevokeAccessParams
 * 撤销访问权限参数
 * @property token - 访问令牌
 */
export interface ControlRevokeAccessParams {
    token: string;
}
/**
 * 使访问权限失效请求参数
 * @interface ControlInvalidateAccessParams
 * 使访问权限失效参数
 * @property token - 访问令牌
 */
export interface ControlInvalidateAccessParams {
    token: string;
}
/**
 * 查询访问权限列表请求参数
 * @interface ControlQueryAccessesParams
 * 查询访问权限列表参数
 * @property user - 用户名
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryAccessesParams {
    user: string;
    offset: number;
    limit: number;
}
/**
 * 查询当前用户已登录设备列表
 * @interface ControlQueryDevicesParams
 * @property offset - 偏移量
 * @property limit - 限制数量
 */
export interface ControlQueryDevicesParams {
    offset: number;
    limit: number;
}
/**
 * 创建安全策略组请求参数
 * @interface
 * @property id - 策略组ID
 * @property name - 策略组名称
 * @property description - 描述
 * @property is_default - 是否默认策略组
 * @property external_rules - 外部网卡规则模板
 * @property internal_rules - 内部网卡规则模板
 */
export interface ControlCreateSecurityPolicyParams {
    id: string;
    name: string;
    description?: string;
    is_default?: boolean;
    external_rules: SecurityRule[];
    internal_rules: SecurityRule[];
}
/**
 * 查询安全策略组列表请求参数
 * @interface
 */
export interface ControlQuerySecurityPoliciesParams {
    offset?: number;
    limit?: number;
}
/**
 * 获取安全策略组详情请求参数
 * @interface
 * @property id - 策略组ID
 */
export interface ControlGetSecurityPolicyParams {
    id: string;
}
/**
 * 修改安全策略组请求参数
 * @interface
 * @property id - 策略组ID
 * @property name - 策略组名称
 * @property description - 描述
 * @property is_default - 是否默认策略组
 * @property external_rules - 外部网卡规则模板
 * @property internal_rules - 内部网卡规则模板
 */
export interface ControlModifySecurityPolicyParams {
    id: string;
    name?: string;
    description?: string;
    is_default?: boolean;
    external_rules?: SecurityRule[];
    internal_rules?: SecurityRule[];
}
/**
 * 删除安全策略组请求参数
 * @interface
 * @property id - 策略组ID
 */
export interface ControlDeleteSecurityPolicyParams {
    id: string;
}
/**
 * 复制安全策略组请求参数
 * @interface
 * @property source_id - 源策略组ID
 * @property new_id - 新策略组ID
 * @property name - 新策略组名称
 */
export interface ControlCopySecurityPolicyParams {
    source_id: string;
    target_id: string;
    name: string;
}
/**
 * 获取云主机安全策略请求参数
 * @interface
 * @property guest_id - 云主机ID
 */
export interface ControlGetGuestSecurityPolicyParams {
    guest_id: string;
}
/**
 * 修改云主机安全策略请求参数
 * @interface
 * @property guest_id - 云主机ID
 * @property mac_address - 目标网卡MAC地址
 * @property rules - 新规则列表
 */
export interface ControlModifyGuestSecurityPolicyParams {
    guest_id: string;
    mac_address: string;
    rules: SecurityRule[];
}
/**
 * 重置云主机安全策略请求参数
 * @interface
 * @property guest_id - 云主机ID
 * @property mac_address - 目标网卡MAC地址
 */
export interface ControlResetGuestSecurityPolicyParams {
    guest_id: string;
    mac_address: string;
}
export interface ControlNodeQueryParams {
}
export interface ControlPoolQueryParams {
}
export interface ControlStoragePoolQueryParams {
}
export interface ControlAddressPoolQueryConfigsParams {
}
export interface ControlSyncFilesParams {
}
export interface ControlComputePoolStragegyParams {
    pool_id: string;
    strategy: ComputePoolStrategy;
}
