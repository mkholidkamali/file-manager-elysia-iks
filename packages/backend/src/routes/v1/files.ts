import { Elysia, status, t } from 'elysia'
import * as service from "../../services/fileService";

export default (app: Elysia) => {
	// Get all files
	app.get('/v1/files', async ({ query }) => {
		const folderId = query.folderId ? Number(query.folderId) : null;

		return await service.getByFolder(folderId);
	})

	// Create new files
	app.post('/v1/files', async ({ body }) => {
		let { folderId, name, size, mimeType } = body;

		if (!folderId) folderId = null;

		return await service.createFile({ folderId, name, size, mimeType });
	}, {
		body: t.Object({
			folderId: t.Optional(t.Union([t.Number(), t.Null()])),
			name: t.String(),
			size: t.Optional(t.Number()),
			mimeType: t.Optional(t.String())
		})
	});

	return app;
}