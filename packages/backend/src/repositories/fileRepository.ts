import { type Prisma, type File } from "../generated/prisma/client";
import prisma from "../utils/prisma";
import type { IFileRepository } from "../ports/IFileRepository";

// Use the same tx type as defined in the interface
type tx = Prisma.TransactionClient | typeof prisma;

class FileRepository implements IFileRepository {
  /**
   * Get files by folder ID
   * @param folderId The folder ID or null for root files
   * @returns Promise resolving to an array of File entities
   */
  async getByFolder(folderId: number | null): Promise<File[]> {
    return prisma.file.findMany({ 
      where: { folderId: folderId ?? null, deletedAt: null },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Create a new file
   * @param tx Optional transaction object
   * @param data File creation data
   * @returns Promise resolving to the created File entity
   */
  async createFile(
    tx: tx = prisma, 
    data: { folderId: number | null; name: string; size?: number; mimeType?: string }
  ): Promise<File> {
    return tx.file.create({ data });
  }

  /**
   * Delete files by IDs
   * @param tx Optional transaction object
   * @param ids Array of file IDs to delete
   * @returns Promise resolving to the number of deleted files
   */
  async deleteMany(tx: tx = prisma, ids: number[]): Promise<number> {
    const result = await tx.file.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
    return result.count;
  }
}

// Export singleton instance
export const fileRepository = new FileRepository();

// Expose
export const getByFolder = fileRepository.getByFolder.bind(fileRepository);
export const createFile = fileRepository.createFile.bind(fileRepository);
export const deleteMany = fileRepository.deleteMany.bind(fileRepository);