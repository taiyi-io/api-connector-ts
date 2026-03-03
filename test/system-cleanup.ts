import { getTestConnector } from "./setup";
import { TaiyiConnector } from "../src/connector";
import { GuestState } from "../src/enums";

async function cleanup() {
  console.log("=== START ROBUST SYSTEM CLEANUP ===");
  const connector = await getTestConnector();

  console.log("[1/6] Cleaning guests...");
  const guestsResult = await connector.queryGuests(0, 100);
  const targetGuests = (guestsResult.data?.records || []).filter(g => 
    g.name.includes("ci-test-guest") || 
    g.name.includes("debug-guest") ||
    g.name.includes("final-debug")
  );

  for (const g of targetGuests) {
    console.log(`  Processing Guest: ${g.name} (${g.id})`);
    
    // 1. 检查状态
    const info = await connector.getGuest(g.id);
    if (info.data && info.data.state !== GuestState.Stopped) {
      console.log(`    Current state is ${info.data.state}, force stopping...`);
      const stopResult = await connector.tryStopGuest(g.id, false, true); // reboot=false, force=true
      if (stopResult.data) {
        await connector.waitTask(stopResult.data, 60).catch(e => console.warn(`    Stop task warning: ${e.message}`));
      }
    }

    // 2. 执行删除
    console.log(`    Deleting...`);
    const delResult = await connector.tryDeleteGuest(g.id);
    if (delResult.data) {
      await connector.waitTask(delResult.data, 60).catch(e => console.warn(`    Delete task warning: ${e.message}`));
    }
  }

  console.log("[2/6] Cleaning users...");
  const users = await connector.queryUsers(0, 100);
  const targetUsers = (users.data?.records || []).filter(u => 
    u.id.includes("ci-test-user")
  );
  for (const u of targetUsers) {
    console.log(`  Deleting User: ${u.id}`);
    await connector.removeUser(u.id);
  }

  console.log("[3/6] Cleaning groups...");
  const groups = await connector.queryGroups(0, 100);
  const targetGroups = (groups.data?.records || []).filter(g => 
    g.id.includes("ci-test-group")
  );
  for (const g of targetGroups) {
    console.log(`  Deleting Group: ${g.id}`);
    await connector.removeGroup(g.id);
  }

  console.log("[4/6] Cleaning SSH keys...");
  const sshKeys = await connector.querySSHKeys();
  const targetKeys = (sshKeys.data?.records || []).filter(k => 
    k.label.includes("ci-test-ssh") || k.label.includes("test-ssh")
  );
  for (const k of targetKeys) {
    console.log(`  Deleting SSH Key: ${k.label}`);
    await connector.removeSSHKey(k.id);
  }

  console.log("[5/6] Cleaning address pools...");
  const addrPools = await connector.queryAddressPoolConfigs();
  const targetPools = (addrPools.data || []).filter(p => 
    p.id.includes("ci-test-addr")
  );
  for (const p of targetPools) {
    console.log(`  Deleting Address Pool: ${p.id}`);
    await connector.deleteAddressPool(p.id);
  }

  console.log("[6/6] Cleaning security policies...");
  const policies = await connector.querySecurityPolicies();
  const targetPolicies = (policies.data || []).filter(p => 
    p.id.includes("ci-test-policy") || p.name.includes("ci-test")
  );
  for (const p of targetPolicies) {
    console.log(`  Deleting Security Policy: ${p.name}`);
    await connector.deleteSecurityPolicy(p.id);
  }

  console.log("=== CLEANUP FINISHED ===");
}

cleanup().catch(console.error);
