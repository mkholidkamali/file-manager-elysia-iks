import type { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma";

// Define prisma tx instance
type tx = Prisma.TransactionClient | typeof prisma;

/**
 * Method
 */
export const getAllRoot = async () => {
	return prisma.folder.findMany({
		where: { parentId: null, deletedAt: null },
		orderBy: { orderIndex: "asc" }
	});
}

export const findChildren = async (parentId: number | null) => {
	return prisma.folder.findMany({
		where: { parentId: parentId ?? null, deletedAt: null },
		orderBy: { orderIndex: "asc" }
	});
}

export const findById = async (id: number) => {
	return prisma.folder.findUnique({ where: { id } });
}

export const createFolder = async (tx: tx = prisma, data: { name: string; parentId?: number | null; depth?: number | null; orderIndex?: number | null }) => {
	return tx.folder.create({ // Use DTO later
		data: {
			name: data.name,
			parentId: data.parentId ?? null,
			depth: data.depth,
			orderIndex: data.orderIndex
		}
	});
}

export const updateFolder = async (tx: tx = prisma, id: bigint, data: any) => { // Change any 
	return tx.folder.update({ where: { id }, data });
}

export const deleteMany = async (tx: tx = prisma) => {
	await tx.file.deleteMany({});
	await tx.folder.deleteMany({});
}

export const rawExecute = async (tx: tx = prisma, query: string, ...params: any[]) => {
	return tx.$executeRaw`${query}`;
}

export const updateDescendantsPathRaw = async (
	tx: tx = prisma,
	oldPath: string,
	newPath: string,
	depthSum: number
) => {
	return tx.$executeRaw`
		UPDATE "Folder"
		SET path = ${newPath} || substring(path FROM length(${oldPath}) + 1),
			depth = depth + ${depthSum}
		WHERE path LIKE ${oldPath} || '%'
	`;
};
