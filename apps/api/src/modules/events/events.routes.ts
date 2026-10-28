import { Router } from 'express';
import { authenticate } from '../../middleware/auth/authenticate';
import { eventsController } from './events.controller';

const router = Router();

router.get('/', authenticate, eventsController.subscribe.bind(eventsController));

export const eventsRouter = router;
