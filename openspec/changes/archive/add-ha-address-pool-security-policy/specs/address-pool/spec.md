# Address Pool Specification

## Overview

This specification defines the address pool management functionality in the Taiyi API Connector, supporting the four-set model (ExternalV4/ExternalV6/InternalV4/InternalV6) for address pool operations.

## API Methods

### 1. Address Pool Management

#### `createAddressPool`
- **Description**: Create a new address pool
- **Parameters**: 
  - `id`: string (required) - Address pool ID
  - `mode`: string (required) - Mode (address/port)
  - `description`: string (optional) - Description
  - `gateway_v4`: string (optional) - IPv4 gateway address
  - `gateway_v6`: string (optional) - IPv6 gateway address
  - `dns`: string[] (optional) - DNS server list
  - `upstream_gateway`: string (optional) - Upstream gateway address
- **Returns**: `BackendResult<string>` (task ID)

#### `queryAddressPools`
- **Description**: Query address pool list
- **Parameters**: None
- **Returns**: `BackendResult<AddressPoolConfig[]>`

#### `getAddressPool`
- **Description**: Get address pool details
- **Parameters**: 
  - `id`: string (required) - Address pool ID
- **Returns**: `BackendResult<AddressPool>`

#### `modifyAddressPool`
- **Description**: Modify address pool
- **Parameters**: 
  - `id`: string (required) - Address pool ID
  - `description`: string (optional) - Description
  - `gateway_v4`: string (optional) - IPv4 gateway address
  - `gateway_v6`: string (optional) - IPv6 gateway address
  - `dns`: string[] (optional) - DNS server list
  - `upstream_gateway`: string (optional) - Upstream gateway address
- **Returns**: `BackendResult<string>` (task ID)

#### `deleteAddressPool`
- **Description**: Delete address pool
- **Parameters**: 
  - `id`: string (required) - Address pool ID
- **Returns**: `BackendResult<string>` (task ID)

### 2. Address Range Management

#### `addAddressRange`
- **Description**: Add address range to address pool
- **Parameters**: 
  - `pool`: string (required) - Address pool ID
  - `set_type`: string (required) - Set type (ext-v4/ext-v6/int-v4/int-v6)
  - `begin`: string (required) - Start address
  - `end`: string (required) - End address
  - `cidr`: string (optional) - CIDR format
- **Returns**: `BackendResult<string>` (task ID)

#### `removeAddressRange`
- **Description**: Remove address range from address pool
- **Parameters**: 
  - `pool`: string (required) - Address pool ID
  - `set_type`: string (required) - Set type (ext-v4/ext-v6/int-v4/int-v6)
  - `begin`: string (required) - Start address
  - `end`: string (required) - End address
- **Returns**: `BackendResult<string>` (task ID)

## Data Structures

### AddressPoolConfig
```typescript
export interface AddressPoolConfig {
  id: string;
  mode: AddressMode;
  description?: string;
  gateway_v4: string;
  gateway_v6: string;
  dns?: string[];
  upstream_gateway?: string;
}
```

### AddressPool
```typescript
export interface AddressPool {
  config: AddressPoolConfig;
  external_v4: AddressSet;
  external_v6: AddressSet;
  internal_v4: AddressSet;
  internal_v6: AddressSet;
}

interface AddressSet {
  ranges: AddressRange[];
  allocations: AllocatedAddress[];
}

interface AddressRange {
  begin: string;
  end: string;
  cidr?: string;
}

interface AllocatedAddress {
  address: string;
  guest_id: string;
  interface_type: string;
  allocate_time: string;
}
```

## Error Handling

- `BackendResult.error` will contain error messages if address pool operations fail
- `BackendResult.unauthenticated` will be true if authentication is required

## Usage Examples

### Create address pool
```typescript
const result = await connector.createAddressPool({
  id: "default-pool",
  mode: "address",
  description: "Default address pool",
  gateway_v4: "192.168.1.1",
  dns: ["8.8.8.8", "8.8.4.4"]
});

if (result.error) {
  console.error("Failed to create address pool:", result.error);
} else {
  const taskId = result.data!;
  // Wait for task completion
}
```

### Add address range
```typescript
const result = await connector.addAddressRange({
  pool: "default-pool",
  set_type: "ext-v4",
  cidr: "192.168.1.0/24"
});

if (result.error) {
  console.error("Failed to add address range:", result.error);
}
```