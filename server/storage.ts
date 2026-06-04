import { db } from "./db";
import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createAnalysis(data: InsertAnalysis): Analysis;
  getAnalysis(id: number): Analysis | undefined;
  updateAnalysis(id: number, data: Partial<Analysis>): Analysis | undefined;
  getAllAnalyses(): Analysis[];
  getAnalysesByBatch(batchId: string): Analysis[];
}

export class DatabaseStorage implements IStorage {
  createAnalysis(data: InsertAnalysis): Analysis {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(analyses).values({ ...data, createdAt: now }).returning().get();
  }

  getAnalysis(id: number): Analysis | undefined {
    return db.select().from(analyses).where(eq(analyses.id, id)).get();
  }

  updateAnalysis(id: number, data: Partial<Analysis>): Analysis | undefined {
    return db.update(analyses).set(data).where(eq(analyses.id, id)).returning().get();
  }

  getAllAnalyses(): Analysis[] {
    return db.select().from(analyses).orderBy(desc(analyses.createdAt)).all();
  }

  getAnalysesByBatch(batchId: string): Analysis[] {
    return db.select().from(analyses).where(eq(analyses.batchId, batchId)).all();
  }
}

export const storage = new DatabaseStorage();
