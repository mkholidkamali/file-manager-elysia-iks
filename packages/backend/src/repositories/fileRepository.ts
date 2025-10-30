import type { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma";

// Define prisma tx instance
type tx = Prisma.TransactionClient | typeof prisma;

/**
 * Method
 */
export const getByFolder = async (folderId: number | null) => {
	return prisma.file.findMany({ 
		where: { folderId: folderId ?? null, deletedAt: null },
		orderBy: { name: "asc" }
	});
}

export const createFile = async (tx: tx = prisma, data: { folderId: number | null; name: string; size?: number; mimeType?: string }) => {
	return tx.file.create({ data });
}