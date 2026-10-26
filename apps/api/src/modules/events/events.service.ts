import { Response } from "express";
import { SseEvent } from "./events.type";

interface SseClient {
  userId: string;
  res: Response;
  connectedAt: Date;
}

export class EventsService {
  private clients: Set<SseClient> = new Set();
  private keepaliveTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startKeepalive();
  }

  /**
   * Register a new client SSE response stream.
   */
  public addClient(userId: string, res: Response): SseClient {
    const client: SseClient = {
      userId,
      res,
      connectedAt: new Date(),
    };

    this.clients.add(client);
    return client;
  }

  /**
   * Remove a disconnected client.
   */
  public removeClient(client: SseClient): void {
    this.clients.delete(client);
  }

  /**
   * Broadcast an event to all connected users.
   */
  public broadcast(event: SseEvent): void {
    const payload = `data: ${JSON.stringify(event)}\n\n`;

    this.clients.forEach((client) => {
      try {
        client.res.write(payload);
      } catch {
        this.clients.delete(client);
      }
    });
  }

  /**
   * Send an event targeted to a specific user (e.g. notifications).
   */
  public emitToUser(userId: string, event: SseEvent): void {
    const payload = `data: ${JSON.stringify(event)}\n\n`;

    this.clients.forEach((client) => {
      if (client.userId === userId) {
        try {
          client.res.write(payload);
        } catch {
          this.clients.delete(client);
        }
      }
    });
  }

  /**
   * Send a periodic comment ping to prevent proxies/browsers from dropping idle connections.
   */
  private startKeepalive(): void {
    this.keepaliveTimer = setInterval(() => {
      this.clients.forEach((client) => {
        try {
          client.res.write(":keepalive\n\n");
        } catch {
          this.clients.delete(client);
        }
      });
    }, 25_000);

    // Ensure timer doesn't block process exit in tests
    if (this.keepaliveTimer.unref) {
      this.keepaliveTimer.unref();
    }
  }

  public getActiveClientCount(): number {
    return this.clients.size;
  }
}

export const eventsService = new EventsService();

