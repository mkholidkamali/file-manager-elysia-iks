import { Elysia, file } from 'elysia';
import folderRoutes from './routes/v1/folders';
import fileRoutes from './routes/v1/files';
import swagger from '@elysiajs/swagger';
import cors from '@elysiajs/cors';

// Initialize instance
export const app = new Elysia()
	.get('/', () => 'Hello there!')
	.use(swagger())
	.use(cors({
		origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3010'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true
	}))
	.use(folderRoutes)
	.use(fileRoutes);

// Export
export default app;