import { Request, Response } from 'express';
import { eventsService } from './events.service';

export class EventsController {
  public subscribe(req: Request, res: Response): void {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Configure standard Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disables buffering in Nginx reverse proxies
    });

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', userId })}\n\n`);

    const client = eventsService.addClient(userId, res);

    req.on('close', () => {
      eventsService.removeClient(client);
    });
  }
}

export const eventsController = new EventsController();
