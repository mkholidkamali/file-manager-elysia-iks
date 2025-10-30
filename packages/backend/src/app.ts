import { Elysia, file } from 'elysia';
import folderRoutes from './routes/v1/folders';
import fileRoutes from './routes/v1/files';
import swagger from '@elysiajs/swagger';

// Initialize instance
export const app = new Elysia()
	.get('/', () => 'Hello there!')
	.use(swagger())
	.use(folderRoutes)
	.use(fileRoutes);

// Export
export default app;