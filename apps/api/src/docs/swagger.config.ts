import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi';

export const docsRouter = Router();

const swaggerOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'SprintHub REST API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
  },
};

// Serve OpenAPI Specification JSON
docsRouter.get('/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(openApiSpec);
});

// Serve Interactive Swagger UI
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));

export default docsRouter;
