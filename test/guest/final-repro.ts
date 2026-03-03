import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

async function runFinalRepro() {
  console.log("=== 残留云主机操作验证开始 ===");
  const connector = await getTestConnector();

  const listResult = await connector.queryGuests(0, 100);
  const leftovers = (listResult.data?.records || []).filter(g => 
    g.name.includes("ci-test-guest") || 
    g.name.includes("debug-guest") ||
    g.name.includes("final-debug")
  );

  console.log(`发现 ${leftovers.length} 个残留云主机。`);
  const targetGuests = leftovers.slice(0, 3);

  for (const guest of targetGuests) {
    console.log(`--- Guest: ${guest.name} (${guest.id}) ---`);

    console.log(`[Step A] Modify CPU...`);
    const cpuResult = await connector.tryModifyGuestCPU(guest.id, 2);
    if (cpuResult.data) {
      const status = await connector.getTask(cpuResult.data);
      console.log(`  Modify CPU Status: ${status.data?.status}`);
    }

    console.log(`[Step B] Delete Guest...`);
    const delResult = await connector.tryDeleteGuest(guest.id);
    if (delResult.data) {
      const tid = delResult.data;
      console.log(`  Delete TaskID: ${tid}`);
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const status = await connector.getTask(tid);
        console.log(`    Wait ${i}: ${status.data?.status} (${status.data?.progress || 0}%)`);
        if (status.data?.status !== "pending") break;
      }
    }
  }
  console.log("=== 验证结束 ===");
}

runFinalRepro().catch(console.error);
