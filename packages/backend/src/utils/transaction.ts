import type { Args } from "@prisma/client/runtime/library";
import prisma from "./prisma";

export const withTransaction = <Args extends any[], R>(
	fn: (tx: any, ...args: Args) => Promise<R>
) => {
	return async (...args: Args): Promise<R> => {
		try {
			return prisma.$transaction(async (tx) => {
				return await fn(tx, ...args);
			});
		} catch (error) {
			console.error("[Transaction Error]:", {
				message: (error as Error)?.message,
				stack: (error as Error)?.stack,
			});

			throw error;
		}
	}
}