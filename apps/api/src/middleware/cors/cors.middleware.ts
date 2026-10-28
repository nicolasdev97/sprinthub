import cors, { CorsOptions } from 'cors';

// Parse configured origins from environment variables (supporting comma-separated lists)
const envOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL, process.env.CLIENT_URL]
  .filter(Boolean)
  .flatMap((origin) => (origin as string).split(',').map((s) => s.trim()))
  .filter(Boolean);

const defaultDevOrigins =
  process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [];

export const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultDevOrigins]));

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, or mobile requests with no origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours preflight cache
};

export const corsMiddleware = cors(corsOptions);
