# 太一云 API

TypeScript 实现的[太一云](https://www.taiyi.io/) Control 模块 API 连接器，提供全功能服务，涵盖校验、云主机配置、状态查询和集群管理等。

官方管理门户同样基于本接口，使用本接口可使用与官方版本一致的功能，便于系统集成与定制开发

## 安装

```
$ npm install @taiyi-io/api-connector-ts
或者
$ yarn add @taiyi-io/api-connector-ts
```

## 使用

**请注意：[TaiyiConnector](./classes/TaiyiConnector) 类是本连接器的主要入口点，但是考虑不同应用场景的数据安全，将安全令牌的存储进行了剥离。需要调用者根据自己的业务场景，实现 SetTokenHandler 和 GetTokenHandler 两个接口，管理令牌的存取**

函数[newInsecureConnector](./functions/newInsecureConnector)创建一个简单的、非安全存储的 TaiyiConnector，能够用于快速测试，但是不建议使用在生产环境中。函数[getNextConnector](./functions/getNextConnector)生成一个基于 cookie 和 localstorage 安全存储令牌，适配 NextJS 框架的 TaiyiConnector。实际使用中建议参考上述两个函数，根据自己业务场景调整存储策略。

太一云实现了完整的零信任模型，所有操作都必须有充分的权限才能执行。除了 getSystemStatus 和 initializeSystem 两个接口，其他接口都必须**先完成鉴权**

TaiyiConnector 初始化需要三个参数

- backendHost：Control 模块 API 地址，例如 192.168.2.50
- backendPort：Control 模块 API 端口，默认 5851
- device：设备 ID，用于标识客户端，建议同一个设备上保持稳定，不要使用随机数，否则设备管理会显得混乱

调用者需要实现 SetTokenHandler 和 GetTokenHandler，为 TaiyiConnector 提供令牌的存取能力。如果需要在校验信息失效时，进行特殊处理，可以通过可选的 bindAuthExpiredEvent 方法注册回调。

示例代码：

```ts
//构建 TaiyiConnector 实例
const connector = new TaiyiConnector(backendHost, backendPort, deviceID);

//绑定令牌存取回调
connector.bindCallback(
  store.id,
  storeAllocatedTokens,
  retrieveAllocatedTokens,
  handleStoreStatusChanged
);

//可选：绑定校验过期回调
connector.bindAuthExpiredEvent(handleAuthExpired);
```

### 校验

TaiyiConnector 提供两种校验方式，账号密码和访问令牌

账号密码校验，示例代码：

```ts
const result = await connector.authenticateByPassword(username, password);
if (result.unauthenticated) {
  throw new Error("校验失败");
} else if (result.error) {
  //其他错误
  throw new Error(result.error);
}
const tokens = result.data;
console.log("密码校验成功,当前用户 %s, 角色 %s", tokens.user, tokens.roles);
```

令牌校验需要用户先登录太一云，在账号管理>访问令牌，创建新令牌并获得连接字符串，然后使用如下代码：

```ts
const result = await connector.authenticateByToken(token);
if (result.unauthenticated) {
  throw new Error("校验失败");
} else if (result.error) {
  //其他错误
  throw new Error(result.error);
}
const tokens = result.data;
console.log("令牌校验成功,当前用户 %s, 角色 %s", tokens.user, tokens.roles);
```

### 基本操作和返回结果

TaiyiConnector 提供了丰富的功能接口，例如云主机管理、集群配置、资源查询、权限控制全部等平台能力。这些接口的调用返回值统一为 Promise\<BackendResult\>，调用者需要调用 await 等待操作完成，根据返回值判断操作是否成功。

BackendResult 常用属性：

- error：如果操作失败，包含错误信息
- data：如果操作成功，根据接口返回对应的响应数据

以无返回数据的修改云主机核心数为例：

```ts
const result = await connector.modifyGuestCPU(guestID, cores);
if (result.error) {
  throw new Error(result.error);
}
console.log("修改云主机核心数成功");
```

获取云主机信息：

```ts
const result = await connector.getGuest(guestID);
if (result.error) {
  throw new Error(result.error);
}
const guestInfo = result.data;
console.log("云主机信息：", guestInfo);
```

部分接口返回值使用了 PaginationResult，则支持分页查询。查询时，指定查询起止位置和每页记录数，返回结果的 PaginationResult 属性 records 记录返回结果，属性 total 为此查询条件所有匹配的记录数

例如查询云主机信息：

```ts
//从第13个记录开始，查询10条记录
const result = await connector.queryGuests(13, 10);
if (result.error) {
  throw new Error(result.error);
}
//PaginationResult
const data = result.data;
console.log(
  "返回结果 %s, 总记录数 %d",
  JSON.stringify(data.records),
  data.total
);
```

### 异步任务

对于创建云主机、镜像、快照等需要一定等待时间的操作，都提供了 tryXXX 开头的异步请求，请求成功时返回 taskID。请求者调用 waitTask 接口等待处理结果。

创建云主机为例：

```ts
const config: GuestConfig = {
  name: "sample",
  cores: 2, // 2 核
  memory: 2048, // 2GB 内存
  disks: [20480, 10240], // 20G系统盘，10G数据盘
  access_level: ResourceAccessLevel.Private, //仅自己访问
};
const poolID = "default"; //默认资源池
const result = await connector.tryCreateGuest(poolID, "", config);
if (result.error) {
  throw new Error(result.error);
}
const taskID = result.data;
const timeoutSeconds = 5 * 60; // 5 分钟等待超时
const taskData = await connector.waitTask(taskID, timeoutSeconds);
if (taskData.error) {
  throw new Error(taskData.error);
}
const guestID = taskData.data;
console.log("创建云主机成功，云主机ID：", guestID);
```
