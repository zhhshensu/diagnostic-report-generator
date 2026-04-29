import Dexie, { type Table } from "dexie";
import type { LLMProvider } from "@/stores/provider-store";
import type { Report } from "@/stores/report-store";

// ===== Database Class =====
class AppDatabase extends Dexie {
  providers!: Table<LLMProvider, string>;
  reports!: Table<Report, string>;

  constructor() {
    super("diagnostic-report-db-v1");
    this.version(1).stores({
      providers: "id, name, type, isActive",
      reports: "id, createdAt, status, isStarred, shareId",
    });
  }
}

const db = new AppDatabase();

// ===== Init / Ready =====
export async function getDb(): Promise<AppDatabase> {
  return db;
}

// ===== Provider CRUD =====

export async function loadProviders(): Promise<LLMProvider[]> {
  return db.providers.toArray();
}

export async function saveProviders(providers: LLMProvider[]): Promise<void> {
  await db.transaction("rw", db.providers, async () => {
    await db.providers.clear();
    if (providers.length > 0) {
      await db.providers.bulkAdd(providers);
    }
  });
}

// ===== Report CRUD =====

export async function loadReports(): Promise<Report[]> {
  return db.reports.orderBy("createdAt").reverse().toArray();
}

export async function saveReports(reports: Report[]): Promise<void> {
  await db.transaction("rw", db.reports, async () => {
    await db.reports.clear();
    if (reports.length > 0) {
      await db.reports.bulkAdd(reports);
    }
  });
}

// ===== 工具函数 =====

export async function getStorageStats(): Promise<{
  reportCount: number;
  providerCount: number;
}> {
  const [reportCount, providerCount] = await Promise.all([
    db.reports.count(),
    db.providers.count(),
  ]);

  return { reportCount, providerCount };
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", [db.reports, db.providers], async () => {
    await db.reports.clear();
    await db.providers.clear();
  });
}
