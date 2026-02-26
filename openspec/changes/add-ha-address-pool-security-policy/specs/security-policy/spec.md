# Security Policy Specification

## Overview

This specification defines the security policy management functionality in the Taiyi API Connector, supporting system-level policy templates and cloud host-level policy copies.

## API Methods

### 1. Security Policy Group Management

#### `createSecurityPolicy`
- **Description**: Create a new security policy group
- **Parameters**: 
  - `id`: string (required) - Policy group ID
  - `name`: string (required) - Policy group name
  - `description`: string (optional) - Description
  - `is_default`: boolean (optional) - Whether to set as default policy group
  - `external_rules`: SecurityRule[] (required) - External network card rule template
  - `internal_rules`: SecurityRule[] (required) - Internal network card rule template
- **Returns**: `BackendResult<string>` (task ID)

#### `querySecurityPolicies`
- **Description**: Query security policy group list
- **Parameters**: None
- **Returns**: `BackendResult<SecurityPolicyGroup[]>`

#### `getSecurityPolicy`
- **Description**: Get security policy group details
- **Parameters**: 
  - `id`: string (required) - Policy group ID
- **Returns**: `BackendResult<SecurityPolicyGroup>`

#### `modifySecurityPolicy`
- **Description**: Modify security policy group
- **Parameters**: 
  - `id`: string (required) - Policy group ID
  - `name`: string (optional) - Policy group name
  - `description`: string (optional) - Description
  - `is_default`: boolean (optional) - Whether to set as default policy group
  - `external_rules`: SecurityRule[] (optional) - External network card rule template
  - `internal_rules`: SecurityRule[] (optional) - Internal network card rule template
- **Returns**: `BackendResult<string>` (task ID)

#### `deleteSecurityPolicy`
- **Description**: Delete security policy group
- **Parameters**: 
  - `id`: string (required) - Policy group ID
- **Returns**: `BackendResult<string>` (task ID)

#### `copySecurityPolicy`
- **Description**: Copy security policy group
- **Parameters**: 
  - `source_id`: string (required) - Source policy group ID
  - `new_id`: string (required) - New policy group ID
  - `name`: string (required) - New policy group name
- **Returns**: `BackendResult<string>` (task ID)

### 2. Cloud Host Security Policy Management

#### `getGuestSecurityPolicy`
- **Description**: Get cloud host security policy
- **Parameters**: 
  - `guest`: string (required) - Cloud host ID
- **Returns**: `BackendResult<GuestSecurityPolicy>`

#### `modifyGuestSecurityPolicy`
- **Description**: Modify cloud host security policy
- **Parameters**: 
  - `guest`: string (required) - Cloud host ID
  - `mac_address`: string (required) - Target network card MAC address
  - `rules`: SecurityRule[] (required) - New rule list
- **Returns**: `BackendResult<string>` (task ID)

#### `resetGuestSecurityPolicy`
- **Description**: Reset cloud host security policy
- **Parameters**: 
  - `guest`: string (required) - Cloud host ID
  - `mac_address`: string (required) - Target network card MAC address
- **Returns**: `BackendResult<string>` (task ID)

## Data Structures

### SecurityRule
```typescript
export interface SecurityRule {
  source_address: string;
  dest_port: number;
  dest_port_end: number;
  protocol: string; // tcp/udp/icmp
  action: string; // accept/drop
  description: string;
}
```

### SecurityPolicyGroup
```typescript
export interface SecurityPolicyGroup {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  external_rules: SecurityRule[];
  internal_rules: SecurityRule[];
}
```

### GuestSecurityPolicy
```typescript
export interface GuestSecurityPolicy {
  policies: InterfaceSecurityPolicy[];
}

interface InterfaceSecurityPolicy {
  mac_address: string;
  is_external: boolean;
  source_group: string;
  rules: SecurityRule[];
}
```

## Error Handling

- `BackendResult.error` will contain error messages if security policy operations fail
- `BackendResult.unauthenticated` will be true if authentication is required

## Usage Examples

### Create security policy group
```typescript
const result = await connector.createSecurityPolicy({
  id: "default-policy",
  name: "Default Security Policy",
  description: "Default security policy for external access",
  external_rules: [
    {
      source_address: "0.0.0.0/0",
      dest_port: 22,
      dest_port_end: 22,
      protocol: "tcp",
      action: "accept",
      description: "Allow SSH"
    }
  ],
  internal_rules: []
});

if (result.error) {
  console.error("Failed to create security policy:", result.error);
} else {
  const taskId = result.data!;
  // Wait for task completion
}
```

### Modify guest security policy
```typescript
const result = await connector.modifyGuestSecurityPolicy({
  guest: guestId,
  mac_address: "00:11:22:33:44:55",
  rules: [
    {
      source_address: "192.168.1.0/24",
      dest_port: 80,
      dest_port_end: 80,
      protocol: "tcp",
      action: "accept",
      description: "Allow HTTP from internal network"
    }
  ]
});

if (result.error) {
  console.error("Failed to modify guest security policy:", result.error);
}
```