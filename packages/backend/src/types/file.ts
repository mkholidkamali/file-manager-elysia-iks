export type FileDTO = {
    id: string;
    folderId: string | null;
    name: string;
    size: string | null;
    mimeType: string | null;
    createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};