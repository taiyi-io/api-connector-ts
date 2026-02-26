## Why

为了支持太一云平台的企业级业务需求，需要在API连接器中实现高可用(HA)、地址池管理和安全策略功能，以确保云主机的可靠性、网络配置的灵活性和安全性。

## What Changes

- 添加高可用(HA)相关API支持，包括资源池HA开关控制、云主机HA状态管理
- 实现地址池管理功能，支持四集合模型(ExternalV4/ExternalV6/InternalV4/InternalV6)的地址池操作
- 添加安全策略组管理功能，支持系统级策略模板和云主机级策略副本
- 调整现有API接口以支持新的参数和返回值
- 同步更新相关数据结构和类型定义

## Capabilities

### New Capabilities
- `ha-support`: 高可用功能支持，包括资源池HA配置和云主机HA状态管理
- `address-pool`: 地址池管理，支持地址池的创建、查询、修改和删除
- `security-policy`: 安全策略管理，支持安全策略组的创建、查询、修改和删除

### Modified Capabilities
- `compute-pool`: 修改资源池配置，添加HA开关和安全策略关联
- `cloud-host`: 修改云主机管理，添加HA相关参数和安全策略支持

## Impact

- `src/connector.ts`: 添加新的API方法和修改现有方法
- `src/data-defines.ts`: 更新数据结构，添加HA、地址池和安全策略相关类型
- `src/enums.ts`: 添加新的枚举类型
- `src/request-params.ts`: 更新请求/响应类型
- 测试文件: 添加新功能的测试用例
- 文档: 更新API文档以反映新功能