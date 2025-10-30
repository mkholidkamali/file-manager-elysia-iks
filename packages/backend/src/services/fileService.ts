import prisma from "../utils/prisma";
import { fileRepository } from "../repositories/fileRepository";
import { toFileDTO } from "../repositories/fileMapper";
import type { FileDTO } from "../types/file";
import { withTransaction } from "../utils/transaction";
import type { IFileRepository } from "../ports/IFileRepository";

const typedFileRepository: IFileRepository = fileRepository;

export class FileService {
  // Dependency injection
  constructor(private readonly fileRepo: IFileRepository) {}

  async getByFolder(folderId: number | null): Promise<FileDTO[]> {
    const files = await this.fileRepo.getByFolder(folderId);
    return files.map<FileDTO>(toFileDTO);
  }

  createFile = withTransaction(async (tx, data: { folderId: number | null; name: string; size?: number; mimeType?: string }) => {
    const file = await this.fileRepo.createFile(tx, data);
    return toFileDTO(file);
  });
}

// Create singleton instance
const fileService = new FileService(typedFileRepository);

// Expose
export const getByFolder = fileService.getByFolder.bind(fileService);
export const createFile = fileService.createFile.bind(fileService);