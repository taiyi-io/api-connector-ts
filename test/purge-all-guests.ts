import { getTestConnector } from "./setup";
import { GuestState } from "../src/enums";

async function purgeAllGuests() {
  console.log("=== 清空所有云主机 ===");
  const connector = await getTestConnector();

  let total = 0;
  let deleted = 0;
  let failed = 0;

  // 分页查询所有云主机
  const PAGE_SIZE = 100;
  let start = 0;
  const allGuests: { id: string; name: string; state: GuestState }[] = [];

  while (true) {
    const result = await connector.queryGuests(start, PAGE_SIZE);
    if (result.error) {
      console.error(`查询云主机失败: ${result.error}`);
      process.exit(1);
    }
    const records = result.data?.records || [];
    allGuests.push(...records.map(g => ({ id: g.id, name: g.name, state: g.state })));
    total = result.data?.total ?? allGuests.length;
    if (records.length < PAGE_SIZE) break;
    start += PAGE_SIZE;
  }

  console.log(`共找到 ${allGuests.length} 台云主机（总计 ${total}）`);

  for (const g of allGuests) {
    console.log(`\n处理: ${g.name} (${g.id}) [${g.state}]`);

    // 非停止状态先强制停机
    if (g.state !== GuestState.Stopped) {
      console.log(`  强制停止...`);
      const stopResult = await connector.tryStopGuest(g.id, false, true);
      if (stopResult.error) {
        console.warn(`  停止失败: ${stopResult.error}`);
      } else if (stopResult.data) {
        await connector.waitTask(stopResult.data, 120).catch(e =>
          console.warn(`  停止任务异常: ${e.message}`)
        );
      }
    }

    // 删除
    console.log(`  删除...`);
    const delResult = await connector.tryDeleteGuest(g.id);
    if (delResult.error) {
      console.error(`  删除失败: ${delResult.error}`);
      failed++;
      continue;
    }
    await connector.waitTask(delResult.data!, 300).catch(e =>
      console.warn(`  删除任务异常: ${e.message}`)
    );
    console.log(`  已删除`);
    deleted++;
  }

  console.log(`\n=== 完成：成功 ${deleted}，失败 ${failed}，共 ${allGuests.length} 台 ===`);
}

purgeAllGuests().catch(console.error);
