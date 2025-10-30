// import prisma from "../utils/prisma";
import { withTransaction } from "../utils/transaction";
import * as repo from "../repositories/folderRepository";
import { toFolderDTO } from "../repositories/folderMapper";
import type { FolderDTO } from "../types/folder";

export const getAllRoot = async (): Promise<FolderDTO[]> => {
	let rows = await repo.getAllRoot();
	return rows.map<FolderDTO>(toFolderDTO);
}

export const findChildren = async (parentId: number | null): Promise<FolderDTO[]> => {
	let rows = await repo.findChildren(parentId);
	return rows.map<FolderDTO>(toFolderDTO);
}

export const createFolderWithPath = withTransaction(async (tx, name: string, parentId?: number | null) => {
	// Create folder
	const folder = await repo.createFolder(tx, { name, parentId: parentId ?? null });

	// Serch parent
	let path = `/${folder.id}/`;
	let depth = 0;
	if (parentId) {
		const parent = await repo.findById(parentId);
		if (!parent) throw new Error('Parent folder not found');
		path = `/${parent.id}/${folder.id}/`;
		depth = (parent?.depth ?? 0) + 1;
	}

	// Update folder
	await repo.updateFolder(tx, folder.id, { path, depth });

	// Return full folder
	return toFolderDTO({ ...folder, path, depth }); // Wrap it good with http response
})

export const moveFolder = withTransaction(async (tx, folderId: bigint, newParentId: bigint | null) => {
	// Find current folder
	const folder = await repo.findById(Number(folderId));
	if (!folder) throw new Error('Folder not found');

	// Create new parent
	const newParentFolder = newParentId ? await repo.findById(Number(newParentId)) : null;

	// Prevent moving into its own subtree
	if (newParentFolder && newParentFolder.path?.startsWith(folder.path ?? '-')) throw new Error('Invalid move : Target parent are descendant of folder');

	// Prepare path and depth
	const oldPath  = folder.path?.replace(/\/+$/, '/') ?? '';
	const oldDepth = folder?.depth ?? 0;
	const newPath  = ((newParentFolder?.path ?? '/') + folder.id + '/').replace(/\/+$/, '/');
	const newDepth = newParentFolder ? ((newParentFolder?.depth ?? 0) + 1) : 0;
	const depthSum = newDepth - oldDepth;

	// Update current folder
	await repo.updateFolder(tx, folderId, { 
		parentId: newParentId ?? null, 
		path: newPath, 
		depth: newDepth 
	});

	// Update all descendants from current folder : path and depth
	await repo.updateDescendantsPathRaw(tx, oldPath, newPath, depthSum);

	return { moved: true, folderId: folderId?.toString(), newParentId: newParentId?.toString() }
})