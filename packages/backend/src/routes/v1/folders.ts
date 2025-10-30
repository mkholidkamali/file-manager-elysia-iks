import { Elysia, t } from 'elysia'
import * as service from "../../services/folderService";

export default (app: Elysia) => {
	// Get all folders
	app.get('/v1/folders', async () => {
		return await service.getAllRoot();
	})

	// Get spesific children
	app.get('/v1/folders/:id/children', async ({ params }) => {
		const id = Number(params.id);
		return await service.findChildren(id);
	})

	// Create folder
	app.post('/v1/folders', async ({ body }) => {
		const { name, parentId } = body;

		if (!name) return { status: 400, body: { message: 'Name is required' } };

		return await service.createFolderWithPath(name, parentId ?? null);
	}, {
		body: t.Object({
			name: t.String(),
			parentId: t.Optional(t.Union([t.Number(), t.Null()]))
		})
	});

	// Move folder
	app.put('/v1/folders/:id/move', async ({ params, body }) => {
		const id = BigInt(params.id);
		const newParentId = body.parentId ? BigInt(body.parentId) : null;

		try {
			return await service.moveFolder(id, newParentId);
		} catch (e: any) {
			return { status: 400, body: { message: e.message } };
		}
	}, {
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			parentId: t.Optional(t.Union([t.Number(), t.Null()]))
		})
	});

	return app;
}