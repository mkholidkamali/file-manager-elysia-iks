import type { File } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

// Define prisma tx type
type tx = Prisma.TransactionClient | typeof import('../utils/prisma').default;

export interface IFileRepository {
  /**
   * Get files by folder ID
   * @param folderId The folder ID or null for root files
   * @returns Promise resolving to an array of File entities
   */
  getByFolder(folderId: number | null): Promise<File[]>;

  /**
   * Create a new file
   * @param tx Optional transaction object
   * @param data File creation data
   * @returns Promise resolving to the created File entity
   */
  createFile(
    tx: tx | undefined,
    data: { folderId: number | null; name: string; size?: number; mimeType?: string }
  ): Promise<File>;

  /**
   * Delete files by IDs
   * @param tx Optional transaction object
   * @param ids Array of file IDs to delete
   * @returns Promise resolving to the number of deleted files
   */
  deleteMany(tx: tx | undefined, ids: number[]): Promise<number>;
}