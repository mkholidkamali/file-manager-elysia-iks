import { withTransaction } from "../utils/transaction";
import { folderRepository } from "../repositories/folderRepository";
import { toFolderDTO } from "../repositories/folderMapper";
import type { FolderDTO } from "../types/folder";
import type { IFolderRepository } from "../ports/IFolderRepository";

const typedFolderRepository: IFolderRepository = folderRepository;

export class FolderService {
	// Dependency injection
	constructor(private readonly folderRepo: IFolderRepository) { }

	async getAllRoot(): Promise<FolderDTO[]> {
		const rows = await this.folderRepo.getAllRoot();
		return rows.map<FolderDTO>(toFolderDTO);
	}

	async findChildren(parentId: number | null): Promise<FolderDTO[]> {
		const rows = await this.folderRepo.findChildren(parentId);
		return rows.map<FolderDTO>(toFolderDTO);
	}

	createFolderWithPath = withTransaction(async (tx, name: string, parentId?: number | null) => {
		// Determine path and depth based on parent
		let path = "/";
		let depth = 0;

		if (parentId) {
			const parent = await this.folderRepo.findById(parentId);
			if (!parent) throw new Error('Parent folder not found');
			path = parent.path || "/";
			depth = (parent.depth ?? 0) + 1;
		}

		// Create folder with initial path
		const folder = await this.folderRepo.createFolder(tx, {
			name,
			parentId: parentId ?? null,
			path
		});

		// Update path to include the new folder's ID
		const updatedPath = `${path}${folder.id}/`;

		// Update folder with correct path
		await this.folderRepo.updateFolder(tx, folder.id, {
			path: updatedPath,
			depth
		});

		// Return full folder
		return toFolderDTO({ ...folder, path: updatedPath, depth });
	});

	moveFolder = withTransaction(async (tx, folderId: number | bigint, newParentId: number | bigint | null) => {
		// Find current folder
		const folder = await this.folderRepo.findById(folderId);
		if (!folder) throw new Error('Folder not found');

		// Get new parent if specified
		const newParentFolder = newParentId ? await this.folderRepo.findById(newParentId) : null;

		// Prevent moving into its own subtree
		if (newParentFolder && newParentFolder.path?.startsWith(folder.path ?? '-')) {
			throw new Error('Invalid move: Target parent is a descendant of folder');
		}

		// Prepare path and depth
		const oldPath = folder.path?.replace(/\/+$/, '/') ?? '';
		const oldDepth = folder?.depth ?? 0;
		const newPath = ((newParentFolder?.path ?? '/') + folder.id + '/').replace(/\/+$/, '/');
		const newDepth = newParentFolder ? ((newParentFolder?.depth ?? 0) + 1) : 0;

		// Update current folder
		await this.folderRepo.updateFolder(tx, folderId, {
			parentId: newParentId ?? null,
			path: newPath,
			depth: newDepth
		});

		// Update all descendants from current folder: path and depth
		await this.folderRepo.updateDescendantsPathRaw(tx, oldPath, newPath);

		return {
			moved: true,
			folderId: folderId.toString(),
			newParentId: newParentId?.toString()
		};
	});
}

// Create singleton instance with the repository implementation
const folderService = new FolderService(typedFolderRepository);

// Export methods for backward compatibility
export const getAllRoot = folderService.getAllRoot.bind(folderService);
export const findChildren = folderService.findChildren.bind(folderService);
export const createFolderWithPath = folderService.createFolderWithPath.bind(folderService);
export const moveFolder = folderService.moveFolder.bind(folderService);