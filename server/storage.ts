import { db } from "./db";
import {
  categories,
  notes,
  type Category,
  type InsertCategory,
  type Note,
  type InsertNote,
  type UpdateCategoryRequest,
  type UpdateNoteRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  getNotes(categoryId?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, updates: UpdateNoteRequest): Promise<Note>;
  deleteNote(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.id);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updates: UpdateCategoryRequest): Promise<Category> {
    const [updated] = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getNotes(categoryId?: number): Promise<Note[]> {
    if (categoryId) {
      return await db.select().from(notes).where(eq(notes.categoryId, categoryId)).orderBy(notes.createdAt);
    }
    return await db.select().from(notes).orderBy(notes.createdAt);
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async updateNote(id: number, updates: UpdateNoteRequest): Promise<Note> {
    const [updated] = await db.update(notes)
      .set(updates)
      .where(eq(notes.id, id))
      .returning();
    return updated;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }
}

export const storage = new DatabaseStorage();
