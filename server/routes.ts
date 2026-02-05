import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post(api.categories.create.path, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const category = await storage.createCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.categories.update.path, async (req, res) => {
    try {
      const input = api.categories.update.input.parse(req.body);
      const category = await storage.updateCategory(Number(req.params.id), input);
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.categories.delete.path, async (req, res) => {
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).send();
  });

  // Notes
  app.get(api.notes.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const notes = await storage.getNotes(categoryId);
    res.json(notes);
  });

  app.get(api.notes.get.path, async (req, res) => {
    const note = await storage.getNote(Number(req.params.id));
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  });

  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createNote(input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.notes.update.path, async (req, res) => {
    try {
      const input = api.notes.update.input.parse(req.body);
      const note = await storage.updateNote(Number(req.params.id), input);
      res.json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.notes.delete.path, async (req, res) => {
    await storage.deleteNote(Number(req.params.id));
    res.status(204).send();
  });

  // Seed data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const categories = await storage.getCategories();
  if (categories.length === 0) {
    const powershell = await storage.createCategory({ name: "PowerShell", color: "#3B82F6" }); // Blue
    const github = await storage.createCategory({ name: "GitHub", color: "#1F2937" }); // Gray
    const recipes = await storage.createCategory({ name: "Recipes", color: "#10B981" }); // Green

    await storage.createNote({
      title: "Basic Commands",
      content: "Get-ChildItem - lists files\nGet-Service - lists services\nGet-Help - gets help",
      categoryId: powershell.id,
      isFavorite: true
    });

    await storage.createNote({
      title: "Git Workflow",
      content: "git init\ngit add .\ngit commit -m 'Initial commit'\ngit push",
      categoryId: github.id,
      isFavorite: false
    });
    
    await storage.createNote({
      title: "Pasta Carbonara",
      content: "Ingredients: Pasta, Eggs, Pecorino Cheese, Guanciale, Black Pepper.",
      categoryId: recipes.id,
      isFavorite: false
    });
  }
}
