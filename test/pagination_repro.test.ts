
import { describe, it, expect } from "vitest";
import { getTestConnector } from "./setup";

describe("Pagination reproduction", () => {
  it("should return different guests for different pages", async () => {
    const connector = await getTestConnector();
    
    const pageSize = 5;
    
    console.log("Fetching Page 1 (start: 0, limit: 5)...");
    const page1 = await connector.queryGuests(0, pageSize);
    if (page1.error) throw new Error(page1.error);
    
    const total = page1.data?.total || 0;
    const records1 = page1.data?.records || [];
    
    console.log(`Total guests: ${total}`);
    console.log(`Page 1 records: ${records1.length}`);
    records1.forEach((g, i) => console.log(`  ${i}: ${g.name} (${g.id})`));

    if (total <= pageSize) {
        console.warn("Not enough guests to test pagination reliably. Need at least " + (pageSize + 1) + " guests.");
        return;
    }

    console.log("Fetching Page 2 (start: 5, limit: 5)...");
    const page2 = await connector.queryGuests(5, pageSize);
    if (page2.error) throw new Error(page2.error);
    
    const records2 = page2.data?.records || [];
    console.log(`Page 2 records: ${records2.length}`);
    records2.forEach((g, i) => console.log(`  ${i}: ${g.name} (${g.id})`));

    // Check if any record from page 1 is in page 2
    const ids1 = new Set(records1.map(g => g.id));
    const overlap = records2.filter(g => ids1.has(g.id));
    
    if (overlap.length > 0) {
        console.error("OVERLAP DETECTED!", overlap.map(g => g.name));
    } else {
        console.log("No overlap detected between page 1 and page 2.");
    }

    expect(overlap.length).toBe(0);
  });

  it("should return different guests for different pages with a filter", async () => {
    const connector = await getTestConnector();
    
    // Using a common keyword like "test" or empty to get many results
    const filter = { keyword: "" }; 
    const pageSize = 5;
    
    console.log("Fetching Page 1 with filter (start: 0, limit: 5)...");
    const page1 = await connector.queryGuests(0, pageSize, filter);
    if (page1.error) throw new Error(page1.error);
    
    const total = page1.data?.total || 0;
    const records1 = page1.data?.records || [];
    
    console.log(`Total guests with filter: ${total}`);
    if (total <= pageSize) {
        console.warn("Not enough filtered guests to test pagination reliably.");
        return;
    }

    console.log("Fetching Page 2 with filter (start: 5, limit: 5)...");
    const page2 = await connector.queryGuests(pageSize, pageSize, filter);
    if (page2.error) throw new Error(page2.error);
    
    const records2 = page2.data?.records || [];
    
    const ids1 = new Set(records1.map(g => g.id));
    const overlap = records2.filter(g => ids1.has(g.id));
    
    expect(overlap.length).toBe(0);
    console.log("No overlap detected with filter.");
  });
});
