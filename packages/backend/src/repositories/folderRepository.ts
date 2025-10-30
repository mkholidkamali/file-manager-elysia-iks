import { type Prisma, type Folder } from "../generated/prisma/client";
import prisma from "../utils/prisma";
import type { IFolderRepository } from "../ports/IFolderRepository";

// Use the same tx type as defined in the interface
type tx = Prisma.TransactionClient | typeof prisma;

class FolderRepository implements IFolderRepository {
  /**
   * Get all root folders
   * @returns Promise resolving to an array of root Folder entities
   */
  async getAllRoot(): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { parentId: null, deletedAt: null },
      orderBy: { orderIndex: "asc" }
    });
  }

  /**
   * Find children folders of a parent folder
   * @param parentId The parent folder ID
   * @returns Promise resolving to an array of child Folder entities
   */
  async findChildren(parentId: number): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { parentId: parentId ?? null, deletedAt: null },
      orderBy: { orderIndex: "asc" }
    });
  }

  /**
   * Find a folder by its ID
   * @param id The folder ID
   * @returns Promise resolving to the Folder entity or null if not found
   */
  async findById(id: number): Promise<Folder | null> {
    return prisma.folder.findUnique({ where: { id } });
  }

  /**
   * Create a new folder
   * @param tx Optional transaction object
   * @param data Folder creation data
   * @returns Promise resolving to the created Folder entity
   */
  async createFolder(
    tx: tx = prisma, 
    data: { parentId: number | null; name: string; path: string }
  ): Promise<Folder> {
    return tx.folder.create({
      data: {
        name: data.name,
        parentId: data.parentId ?? null,
        path: data.path,
        // Additional fields that might be needed
        depth: data.path.split('/').length - 1,
        orderIndex: 0 // Default order index
      }
    });
  }

  /**
   * Update a folder
   * @param tx Optional transaction object
   * @param id The folder ID to update
   * @param data The updated folder data
   * @returns Promise resolving to the updated Folder entity
   */
  async updateFolder(
    tx: tx = prisma,
    id: number,
    data: { name?: string; path?: string }
  ): Promise<Folder> {
    return tx.folder.update({ where: { id }, data });
  }

  /**
   * Delete multiple folders by IDs
   * @param tx Optional transaction object
   * @param ids Array of folder IDs to delete
   * @returns Promise resolving to the number of deleted folders
   */
  async deleteMany(tx: tx = prisma, ids: number[]): Promise<number> {
    const result = await tx.folder.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
    return result.count;
  }

  /**
   * Execute raw SQL query
   * @param tx Optional transaction object
   * @param sql The SQL query to execute
   * @param params The parameters for the SQL query
   * @returns Promise resolving to the query result
   */
  async rawExecute(tx: tx = prisma, sql: string, params: any[]): Promise<any> {
    return tx.$executeRaw`${sql}`;
  }

  /**
   * Update descendants path using raw SQL
   * @param tx Optional transaction object
   * @param oldPath The old path to match
   * @param newPath The new path to set
   * @returns Promise resolving to the number of updated records
   */
  async updateDescendantsPathRaw(
    tx: tx = prisma,
    oldPath: string,
    newPath: string
  ): Promise<number> {
    const depthChange = newPath.split('/').length - oldPath.split('/').length;
    return tx.$executeRaw`
      UPDATE "Folder"
      SET path = ${newPath} || substring(path FROM length(${oldPath}) + 1),
          depth = depth + ${depthChange}
      WHERE path LIKE ${oldPath} || '%'
    `;
  }
}

// Export singleton instance
export const folderRepository = new FolderRepository();

// Expose
export const getAllRoot = folderRepository.getAllRoot.bind(folderRepository);
export const findChildren = folderRepository.findChildren.bind(folderRepository);
export const findById = folderRepository.findById.bind(folderRepository);
export const createFolder = folderRepository.createFolder.bind(folderRepository);
export const updateFolder = folderRepository.updateFolder.bind(folderRepository);
export const deleteMany = folderRepository.deleteMany.bind(folderRepository);
export const rawExecute = folderRepository.rawExecute.bind(folderRepository);
export const updateDescendantsPathRaw = folderRepository.updateDescendantsPathRaw.bind(folderRepository);
