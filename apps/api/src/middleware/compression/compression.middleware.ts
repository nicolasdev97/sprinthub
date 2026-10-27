import compression from 'compression';
import { Request, Response } from 'express';

export const compressionMiddleware = compression({
  // Skip compression for SSE streams or when client explicitly opts out
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }

    const acceptHeader = req.headers.accept;
    if (acceptHeader && acceptHeader.includes('text/event-stream')) {
      return false;
    }

    if (req.path.includes('/events')) {
      return false;
    }

    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses above 1 KB
});
