# HA Support Specification

## Overview

This specification defines the HA (High Availability) support in the Taiyi API Connector, enabling resource pool HA configuration and cloud host HA state management.

## API Methods

### 1. Resource Pool HA Configuration

#### `modifyPool`
- **Description**: Modify compute pool configuration including HA settings
- **Parameters**: 
  - `pool_id`: string (required) - Pool ID
  - `enable_ha`: boolean (optional) - Whether to enable HA
  - `interface_mode`: string (optional) - Network interface mode (direct/nat/dual-nic)
  - `address_mode`: string (optional) - Address mode (dual/v4_only)
  - `security_policy`: string (optional) - Associated security policy group ID
- **Returns**: `BackendResult<void>`

### 2. Cloud Host HA Management

#### `startGuest`
- **Description**: Start cloud host with HA support
- **Parameters**: 
  - `guest`: string (required) - Cloud host ID
  - `media`: string (optional) - Boot media ID
  - `expect_epoch`: number (optional) - HA epoch value
- **Returns**: `BackendResult<string>` (task ID)

## Data Structures

### ComputePoolConfig
```typescript
export interface ComputePoolConfig {
  id: string;
  name: string;
  description: string;
  enable_ha: boolean;
  interface_mode: string;
  address_mode: string;
  security_policy: string;
  // other existing fields
}
```

### GuestSpec
```typescript
export interface GuestSpec {
  // existing fields
  ha_config?: {
    enabled: boolean;
    epoch: number;
  };
}
```

## Error Handling

- `BackendResult.error` will contain error messages if HA configuration fails
- `BackendResult.unauthenticated` will be true if authentication is required

## Usage Examples

### Enable HA for a compute pool
```typescript
const result = await connector.modifyPool({
  id: "default",
  enable_ha: true,
  interface_mode: "direct",
  address_mode: "dual"
});

if (result.error) {
  console.error("Failed to enable HA:", result.error);
}
```

### Start guest with HA epoch
```typescript
const result = await connector.startGuest(guestId, undefined, 1);
if (result.error) {
  console.error("Failed to start guest:", result.error);
} else {
  const taskId = result.data!;
  // Wait for task completion
}
```