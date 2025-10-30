import type { File } from "../generated/prisma/client";
import type { FileDTO } from "../types/file";

export const toFileDTO = (f: File): FileDTO => ({
	id: f.id.toString(),
	folderId: f.folderId === null ? null : f.folderId.toString(),
	name: f.name,
	size: f.size === null ? null : f.size.toString(),
	mimeType: f.mimeType,
	createdAt: f.createdAt.toISOString(),
	updatedAt: f.updatedAt.toISOString(),
	deletedAt: f.deletedAt ? f.deletedAt.toISOString() : null
})