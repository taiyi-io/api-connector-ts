/*
 * API所需枚举定义
 */

export enum controlCommandEnum {
  CreateGuest = "create_guest",
  DeleteGuest = "delete_guest",
  AddVolume = "add_volume",
  DeleteVolume = "delete_volume",
  AddExternalInterface = "add_external_interface",
  RemoveExternalInterface = "remove_external_interface",
  AddInternalInterface = "add_internal_interface",
  RemoveInternalInterface = "remove_internal_interface",
  ModifyCPU = "modify_cpu",
  ModifyMemory = "modify_memory",
  ModifyHostname = "modify_hostname",
  ResetMonitor = "reset_monitor",
  StartGuest = "start_guest",
  StopGuest = "stop_guest",
  ModifyPassword = "modify_password",
  ModifyAutoStart = "modify_autostart",
  GetTask = "get_task",
  QueryTasks = "query_tasks",
  AddNode = "add_node",
  RemoveNode = "remove_node",
  QueryNodes = "query_nodes",
  QueryPools = "query_pools", // SDK calls QueryPools
  GetPool = "get_pool",
  AddPool = "add_pool",
  ModifyPool = "modify_pool",
  DeletePool = "delete_pool",
  AddPoolNode = "add_pool_node", // SDK calls AddPoolNode
  RemovePoolNode = "remove_pool_node",
  QueryStoragePools = "query_storage_pools",
  GetStoragePool = "get_storage_pool",
  AddStoragePool = "add_storage_pool",
  RemoveStoragePool = "remove_storage_pool",
  ModifyRemoteStorageStrategy = "modify_remote_storage_strategy",
  AddRemoteContainer = "add_remote_container",
  ModifyRemoteContainer = "modify_remote_container",
  RemoveRemoteContainer = "remove_remote_container",
  ChangeRemoteContainerFlag = "change_remote_container_flag",
  CreateAddressPool = "create_address_pool",
  ModifyAddressPool = "modify_address_pool",
  DeleteAddressPool = "delete_address_pool",
  AddAddressRange = "add_address_range",
  RemoveAddressRange = "remove_address_range",
  QueryAddressPoolConfigs = "query_address_pool_configs",
  GetAddressPoolDetail = "get_address_pool_detail",
  CreateSecurityPolicy = "create_security_policy",
  ModifySecurityPolicy = "modify_security_policy",
  DeleteSecurityPolicy = "delete_security_policy",
  QuerySecurityPolicies = "query_security_policies",
  GetSecurityPolicy = "get_security_policy",
  CopySecurityPolicy = "copy_security_policy",
  GetGuestSecurityPolicy = "get_guest_security_policy",
  ModifyGuestSecurityPolicy = "modify_guest_security_policy",
  ResetGuestSecurityPolicy = "reset_guest_security_policy",
  QueryGuests = "query_guests",
  GetGuest = "get_guest",
  CreateISO = "create_iso",
  DeleteISO = "delete_iso",
  ModifyISO = "modify_iso",
  GetISO = "get_iso",
  QueryISO = "query_iso",
  CreateDisk = "create_disk",
  DeleteDisk = "delete_disk",
  ModifyDisk = "modify_disk",
  GetDisk = "get_disk",
  QueryDisk = "query_disk",
  InsertMedia = "insert_media",
  EjectMedia = "eject_media",
  ResizeDisk = "resize_disk",
  ShrinkDisk = "shrink_disk",
  InstallDiskImage = "install_disk_image",
  CreateDiskImage = "create_disk_image",
  SyncISOFiles = "sync_iso_files",
  SyncDiskFiles = "sync_disk_files",
  GetNode = "get_node",
  QueryResourcePools = "query_resource_pools",
  ModifyResourceStorageStrategy = "modify_resource_storage_strategy",
  AddResourceContainer = "add_resource_container",
  ModifyResourceContainer = "modify_resource_container",
  RemoveResourceContainer = "remove_resource_container",
  ChangeResourceContainerFlag = "change_resource_container_flag",
  QuerySnapshots = "query_snapshots",
  GetSnapshot = "get_snapshot",
  CreateSnapshot = "create_snapshot",
  RestoreSnapshot = "restore_snapshot",
  DeleteSnapshot = "delete_snapshot",
  QueryResourceUsages = "query_resource_usages",
  QueryResourceStatistic = "query_resource_statistic",
  QueryComputeNodes = "query_compute_nodes", // SDK calls QueryComputeNodes
  QueryNodesUsage = "query_nodes_usage",
  QueryPoolsUsage = "query_pools_usage",
  QueryClusterUsage = "query_cluster_usage", // Added back
  EnableNode = "enable_node",
  DisableNode = "disable_node",
  ChangeComputePoolStrategy = "change_pool_strategy", // SDK calls ChangeComputePoolStrategy
  QuerySystems = "query_systems",
  QueryLogs = "query_logs",
  QueryWarnings = "query_warnings",
  CountWarnings = "count_warnings",
  SumWarnings = "sum_warnings",
  RemoveWarnings = "remove_warnings",
  ClearWarnings = "clear_warnings",
  MarkWarningsAsRead = "mark_warnings_as_read",
  ModifyConfig = "modify_config",
  GetConfig = "get_config",
  RestartService = "restart_service",
  AddSSHKey = "add_ssh_key",
  RemoveSSHKey = "remove_ssh_key",
  QuerySSHKeys = "query_ssh_keys",
  GetLicense = "get_license",
  ActiveLicense = "active_license",
  AddLicense = "add_license",
  RemoveLicense = "remove_license",
  QueryLicenses = "query_licenses",
  GetActivatedLicense = "get_activated_license",
  QueryClusterStatus = "query_cluster_status",
  QueryNetworkGraph = "query_network_graph",
  GetMonitorRules = "get_monitor_rules",
  SetMonitorRules = "set_monitor_rules",
  ClearTasks = "clear_tasks",
  ReloadResourceStorage = "reload_resource_storage",
  UpdateDiskVolumeSize = "update_disk_volume_size",
  ResetMonitorRules = "reset_monitor_rules",
  AddImportSource = "add_import_source",
  RemoveImportSource = "remove_import_source",
  ModifyImportSource = "modify_import_source",
  QueryImportSources = "query_import_sources",
  QueryImportTargets = "query_import_targets",
  ImportGuests = "import_guests",
  GetSystem = "get_system",
  AddSystem = "add_system",
  ModifySystem = "modify_system",
  RemoveSystem = "remove_system",
  MigrateToNode = "migrate_to_node",
  ModifyExternalInterfaceMAC = "modify_external_interface_mac",
  ModifyInternalInterfaceMAC = "modify_internal_interface_mac",
  ResetSystems = "reset_systems",
  QueryUserRoles = "query_user_roles",
  ModifyGroupRoles = "modify_group_roles",
  GetGroupRoles = "get_group_roles",
  QueryGroupMembers = "query_group_members",
  AddGroup = "add_group",
  RemoveGroup = "remove_group",
  QueryGroups = "query_groups",
  AddUser = "add_user",
  RemoveUser = "remove_user",
  QueryUsers = "query_users",
  ChangeUserGroup = "change_user_group",
  QueryUserTokens = "query_user_tokens",
  GenerateUserToken = "generate_user_token",
  RevokeUserToken = "revoke_user_token",
  ChangeUserSecret = "change_user_secret",
  ResetUserSecret = "reset_user_secret",
  RevokeAccess = "revoke_access",
  InvalidateAccess = "invalidate_access",
  QueryAccesses = "query_accesses",
  GetSystemStatus = "get_system_status",
  InitializeSystem = "initialize_system",
  SetSystemResource = "set_system_resource",
  GetResourcePermissions = "get_resource_permissions",
  SetResourcePermissions = "set_resource_permissions",
  AddWhiteList = "add_white_list",
  RemoveWhiteList = "remove_white_list",
  UpdateWhiteList = "update_white_list",
  QueryWhiteList = "query_white_list",
  LogoutDevice = "logout_device",
  QueryDevices = "query_devices",
  CountUnreadWarnings = "count_unread_warnings",
  MarkAllWarningsAsRead = "mark_all_warnings_as_read",
  MarkAllWarningsAsUnread = "mark_all_warnings_as_unread",
}

export enum TaskType {
  CreateGuest = "create_guest",
  DeleteGuest = "delete_guest",
  AddVolume = "add_volume",
  DeleteVolume = "delete_volume",
  AddExternalInterface = "add_external_interface",
  RemoveExternalInterface = "remove_external_interface",
  AddInternalInterface = "add_internal_interface",
  RemoveInternalInterface = "remove_internal_interface",
  ModifyCPU = "modify_cpu",
  ModifyMemory = "modify_memory",
  ModifyHostname = "modify_hostname",
  ResetMonitor = "reset_monitor",
  StartGuest = "start_guest",
  StopGuest = "stop_guest",
  ModifyPassword = "modify_password",
  ModifyAutoStart = "modify_autostart",
  InsertMedia = "insert_media",
  EjectMedia = "eject_media",
  ResizeDisk = "resize_disk",
  ShrinkDisk = "shrink_disk",
  InstallDiskImage = "install_disk_image",
  CreateDiskImage = "create_disk_image",
  SyncISOFiles = "sync_iso_files",
  SyncDiskFiles = "sync_disk_files",
  CreateSnapshot = "create_snapshot",
  DeleteSnapshot = "delete_snapshot",
  RestoreSnapshot = "restore_snapshot",
  AddRemoteContainer = "add_remote_container",
  ModifyRemoteContainer = "modify_remote_container",
  RemoveRemoteContainer = "remove_remote_container",
  ReloadResourceStorage = "reload_resource_storage",
  ImportGuests = "import_guests",
  MigrateToNode = "migrate_to_node",
}

export enum ResourceType {
  SSHKey = "ssh_key",
  System = "system",
  DiskImage = "disk_image",
  ISOImage = "iso_image",
  Guest = "guest",
}

export enum ResourceAccessLevel {
  GlobalView = "global_view",
  ShareEdit = "share_edit",
  ShareView = "share_view",
  Private = "private",
}

export enum ResourceAction {
  View = "view",
  Edit = "edit",
  Delete = "delete",
}

export enum ResourceAccessScope {
  All = "all",
  Namespace = "namespace",
  Private = "private",
}

export enum StatisticUnitRecordField {
  CoresAverage = 0,
  CoresMax = 1,
  CoresMin = 2,
  MemoryAverage = 3,
  MemoryMax = 4,
  MemoryMin = 5,
  DiskAverage = 6,
  DiskMax = 7,
  DiskMin = 8,
  ReadRequests = 9,
  ReadBytes = 10,
  WriteRequests = 11,
  WriteBytes = 12,
  ReceivedPackets = 13,
  ReceivedBytes = 14,
  TransmittedPackets = 15,
  TransmittedBytes = 16,
  ReadBytesPerSecondAverage = 17,
  ReadBytesPerSecondMax = 18,
  ReadBytesPerSecondMin = 19,
  ReadPacketsPerSecondAverage = 20,
  ReadPacketsPerSecondMax = 21,
  ReadPacketsPerSecondMin = 22,
  WriteBytesPerSecondAverage = 23,
  WriteBytesPerSecondMax = 24,
  WriteBytesPerSecondMin = 25,
  WritePacketsPerSecondAverage = 26,
  WritePacketsPerSecondMax = 27,
  WritePacketsPerSecondMin = 28,
  ReceivedBytesPerSecondAverage = 29,
  ReceivedBytesPerSecondMax = 30,
  ReceivedBytesPerSecondMin = 31,
  ReceivedPacketsPerSecondAverage = 32,
  ReceivedPacketsPerSecondMax = 33,
  ReceivedPacketsPerSecondMin = 34,
  TransmittedBytesPerSecondAverage = 35,
  TransmittedBytesPerSecondMax = 36,
  TransmittedBytesPerSecondMin = 37,
  TransmittedPacketsPerSecondAverage = 38,
  TransmittedPacketsPerSecondMax = 39,
  TransmittedPacketsPerSecondMin = 40,
  Count = 41,
}

export enum ResourceSnapshotField {
  Critical = 0,
  Alert = 1,
  Warning = 2,
  Cores = 3,
  Memory = 4,
  Disk = 5,
  Guests = 6,
  CoreUsage = 7,
  MemoryUsed = 8,
  DiskUsed = 9,
  ReadBytes = 10,
  ReadPackets = 11,
  WriteBytes = 12,
  WritePackets = 13,
  ReceivedBytes = 14,
  ReceivedPackets = 15,
  TransmittedBytes = 16,
  TransmittedPackets = 17,
  GuestStopped = 18,
  GuestRunning = 19,
  GuestUnknown = 20,
  NodeOnline = 21,
  NodeOffline = 22,
  NodeLost = 23,
  PoolEnabled = 24,
  PoolDisabled = 25,
  Count = 26,
}

export enum ResourceUsageDurationField {
  Cores = 0,
  Memory = 1,
  Disk = 2,
  ReadRequests = 3,
  ReadBytes = 4,
  WriteRequests = 5,
  WriteBytes = 6,
  ReceivedPackets = 7,
  ReceivedBytes = 8,
  TransmittedPackets = 9,
  TransmittedBytes = 10,
  ReadBytesPerSecond = 11,
  ReadPacketsPerSecond = 12,
  WriteBytesPerSecond = 13,
  WritePacketsPerSecond = 14,
  ReceivedBytesPerSecond = 15,
  ReceivedPacketsPerSecond = 16,
  TransmittedBytesPerSecond = 17,
  TransmittedPacketsPerSecond = 18,
  Count = 19,
}

export enum SystemCategory {
  Linux = "linux",
  BSD = "freebsd",
  MacOS = "macos",
  Windows = "windows",
}

export enum GuestDiskMode {
  Disabled = "disabled",
  IDE = "ide",
  SCSI = "scsi",
  VirtIO = "virtio",
  USB = "usb",
  SATA = "sata",
  SD = "sd",
}

export enum NetworkModelType {
  VIRTIO = "virtio",
  VIRTIOTransitional = "virtio-transitional",
  VIRTIONonTransitional = "virtio-non-transitional",
  E1000 = "e1000",
  E1000E = "e1000e",
  IGB = "igb",
  RTL8139 = "rtl8139",
  Netfront = "netfront",
  USBNet = "usb-net",
  SPAPRVLAN = "spapr-vlan",
  LAN9118 = "lan9118",
  SCM91C111 = "scm91c111",
  VLANCE = "vlance",
  VMXNET = "vmxnet",
  VMXNET2 = "vmxnet2",
  VMXNET3 = "vmxnet3",
  Am79C970A = "Am79C970A",
  Am79C973 = "Am79C973",
  Model82540EM = "82540EM",
  Model82545EM = "82545EM",
  Model82543GC = "82543GC",
}

export enum DisplayDriver {
  Cirrus = "cirrus",
  None = "none",
  QXL = "qxl",
  VGA = "vga",
  VirtIO = "virtio",
}

export enum RemoteProtocol {
  SPICE = "spice",
  VNC = "vnc",
}

export enum USBModel {
  Disabled = "none",
  PIIX3UHCI = "piix3-uhci",
  PIIX4UHCI = "piix4-uhci",
  EHCI = "ehci",
  ICH9EHCI1 = "ich9-ehci1",
  ICH9UHCI1 = "ich9-uhci1",
  ICH9UHCI2 = "ich9-uhci2",
  ICH9UHCI3 = "ich9-uhci3",
  VT82C686BUHCI = "vt82c686b-uhci",
  PCIOHCI = "pci-ohci",
  NECXHCI = "nec-xhci",
  QEMU_XHCI = "qemu-xhci",
}

export enum GuestFirmwareMode {
  BIOS = "bios",
  EFI = "efi",
  SecureEFI = "secure_efi",
  Default = "",
}

export enum GuestSoundModel {
  SB16 = "sb16",
  ES1370 = "es1370",
  PCSPK = "pcspk",
  AC97 = "ac97",
  ICH6 = "ich6",
  ICH9 = "ich9",
  USB = "usb",
  ICH7 = "ich7",
  VirtIO = "virtio",
  Disabled = "",
}

export enum GuestTabletMode {
  Disabled = "",
  USB = "usb",
  VirtIO = "virtio",
}

export enum TaskStatus {
  Pending = "pending",
  Running = "running",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum GuestState {
  Stopped = "stopped",
  Starting = "starting",
  Running = "running",
  Stopping = "stopping",
  Suspending = "suspending",
  Suspended = "suspended",
  Unknown = "unknown",
}

export enum NetworkMode {
  Bridge = "bridge",
}

export enum VolumeContainerStrategy {
  LeastVolumes = "least_volumes",
  LeastUsed = "least_used",
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

export enum InterfaceMode {
  Direct = "direct",
  NAT = "nat",
  DualNIC = "dual-nic",
}

export enum NodeMode {
  Control = "control",
  Resource = "resource",
}

export enum NodeState {
  Connected = "connected",
  Disconnected = "disconnected",
  Ready = "ready",
  Lost = "lost",
}

export enum ComputePoolStrategy {
  MostAvailableMemory = "most_available_memory",
  MostAvailableDisk = "most_available_disk",
  LeastMemoryLoad = "least_memory_load",
  LeastDiskLoad = "least_disk_load",
  LeastCoreLoad = "least_core_load",
}

export enum AddressMode {
  Dual = "dual",
  V4Only = "v4_only",
  V6Only = "v6_only",
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

export enum LicenseFeature {
  Snapshot = "snapshot",
  StorageMultiPaths = "storage_multi_paths",
  StorageNetwork = "storage_network",
  SnapshotSchedule = "snapshot_schedule",
  Backup = "backup",
  HighAvailability = "high_availability",
  BatchOperation = "batch_operation",
  Import = "import",
  NotifyMessage = "notify_message",
  GraphicPassthrough = "graphic_passthrough",
  Migration = "migration",
  AddressPool = "address_pool",
  MemoryMerge = "memory_merge",
}

export enum SignatureAlgorithm {
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

export enum FileState {
  Allocated = "allocated",
  Ready = "ready",
  Updating = "updating",
  Corrupted = "corrupted",
}

export enum StatisticRange {
  LastHour = "last_hour",
  Last24Hours = "last_24_hours",
  Last7Days = "last_7_days",
  Last30Days = "last_30_days",
}

export enum ConsoleEventLevel {
  Info = "info",
  Warning = "warning",
  Alert = "alert",
  Critical = "critical",
}

export enum ConsoleEventRange {
  System = "system",
  Cluster = "cluster",
  Pool = "pool",
  Node = "node",
}

export enum ConsoleEventCategory {
  Guest = "guest",
  Storage = "storage",
  Network = "network",
  System = "system",
  Resource = "resource",
  Config = "config",
  Security = "security",
  Auth = "auth",
  Task = "task",
}

export enum ImportVendor {
  VMWareESXi = "vmware_esxi",
}

export const NODE_RESOURCE_SNAPSHOT_FIELD_COUNT = 21;
export const POOL_RESOURCE_SNAPSHOT_FIELD_COUNT = 24;

export enum UserRole {
  Super = "super",
  Manager = "manager",
  User = "user",
}

export enum PasswordHasher {
  Bcrypt = "bcrypt",
}

export enum TokenSigningMethod {
  HS256 = "HS256",
  HS384 = "HS384",
  HS512 = "HS512",
  RS256 = "RS256",
  RS384 = "RS384",
  RS512 = "RS512",
  ES256 = "ES256",
  ES384 = "ES384",
  ES512 = "ES512",
  EdDSA = "EdDSA",
}
