import prisma from "../utils/prisma";
import * as repo from "../repositories/fileRepository";
import { toFileDTO } from "../repositories/fileMapper";
import type { FileDTO } from "../types/file";
import { withTransaction } from "../utils/transaction";

export const getByFolder = async (folderId: number | null) => {
	let files = await repo.getByFolder(folderId)
	return files.map<FileDTO>(toFileDTO)
}

export const createFile = withTransaction(async (tx, data: { folderId: number | null; name: string; size?: number; mimeType?: string }) => {
	let file = await repo.createFile(tx, data);
	return toFileDTO(file);
})