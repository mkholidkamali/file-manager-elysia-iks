export type FolderDTO = {
    id: string;
    name: string;
    parentId: string | null;
    path: string | null;
    depth: number | null;
    orderIndex: number | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};