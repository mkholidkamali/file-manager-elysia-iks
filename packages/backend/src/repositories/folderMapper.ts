import type { Folder } from "../generated/prisma/client";
import type { FolderDTO } from "../types/folder";


export const toFolderDTO = (f: Folder): FolderDTO => ({
	id: f.id.toString(),
	name: f.name,
	parentId: f.parentId === null ? null : f.parentId.toString(),
	path: f.path ?? null,
	depth: f.depth ?? null,
	orderIndex: f.orderIndex ?? null,
	createdAt: f.createdAt.toISOString(),
	updatedAt: f.updatedAt.toISOString(),
	deletedAt: f.deletedAt ? f.deletedAt.toISOString() : null
})