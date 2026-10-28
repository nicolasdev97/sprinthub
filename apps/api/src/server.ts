import app from './app';

import { logger } from './shared/';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
