import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API endpoint to check if server is running
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Speech-to-text server is running' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
