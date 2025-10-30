import type { Folder } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

// Define prisma tx type
type tx = Prisma.TransactionClient | typeof import('../utils/prisma').default;

export interface IFolderRepository {
  /**
   * Get all root folders
   * @returns Promise resolving to an array of root Folder entities
   */
  getAllRoot(): Promise<Folder[]>;

  /**
   * Find children folders of a parent folder
   * @param parentId The parent folder ID or null
   * @returns Promise resolving to an array of child Folder entities
   */
  findChildren(parentId: number | null): Promise<Folder[]>;

  /**
   * Find a folder by its ID
   * @param id The folder ID
   * @returns Promise resolving to the Folder entity or null if not found
   */
  findById(id: number | bigint): Promise<Folder | null>;

  /**
   * Create a new folder
   * @param tx Optional transaction object
   * @param data Folder creation data
   * @returns Promise resolving to the created Folder entity
   */
  createFolder(
    tx: tx | undefined,
    data: { parentId: number | null; name: string; path: string; depth?: number; orderIndex?: number }
  ): Promise<Folder>;

  /**
   * Update a folder
   * @param tx Optional transaction object
   * @param id The folder ID
   * @param data Folder update data
   * @returns Promise resolving to the updated Folder entity
   */
  updateFolder(
    tx: tx | undefined,
    id: number | bigint,
    data: { name?: string; path?: string; depth?: number; orderIndex?: number; parentId?: number | bigint | null }
  ): Promise<Folder>;

  /**
   * Delete folders by IDs
   * @param tx Optional transaction object
   * @param ids Array of folder IDs to delete
   * @returns Promise resolving to the number of deleted folders
   */
  deleteMany(tx: tx | undefined, ids: number[]): Promise<number>;

  /**
   * Execute raw SQL query
   * @param tx Optional transaction object
   * @param sql SQL query string
   * @param params Query parameters
   * @returns Promise resolving to the query result
   */
  rawExecute(
    tx: tx | undefined,
    sql: string,
    params: any[]
  ): Promise<any>;

  /**
   * Update descendants path
   * @param tx Optional transaction object
   * @param oldPath Old path prefix
   * @param newPath New path prefix
   * @returns Promise resolving to the number of updated folders
   */
  updateDescendantsPathRaw(
    tx: tx | undefined,
    oldPath: string,
    newPath: string
  ): Promise<number>;
}