import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { FileService } from '../../src/services/fileService';
import type { IFileRepository } from '../../src/ports/IFileRepository';
import type { Prisma } from '../../src/generated/prisma/client';

type tx = Prisma.TransactionClient | any;
type Transaction = tx;

mock.module('../../src/utils/transaction', () => {
  return {
    withTransaction: <T extends (...args: any[]) => any>(fn: T) => {
      return async (...args: Parameters<T>) => {
        return fn({} as Transaction, ...args);
      };
    }
  };
});

interface File {
  id: bigint;
  name: string;
  folderId: bigint | null;
  size: bigint | null;
  mimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface FileCreateData {
  name: string;
  folderId: number | null;
  size?: number;
  mimeType?: string;
}

let mockFiles: File[] = [];
let mockFile: Partial<File> = {};

const mockFileRepository: IFileRepository = {
  getByFolder: async (folderId: number | null): Promise<File[]> => mockFiles,
  createFile: async (tx: tx | undefined, data: { folderId: number | null; name: string; size?: number; mimeType?: string }): Promise<File> => mockFile as File,
  deleteMany: async (tx: tx | undefined, ids: number[]): Promise<number> => 0
};

describe('FileService', () => {
  let fileService: FileService;
  
  beforeEach(() => {
    mockFiles = [];
    mockFile = {
      id: BigInt(1),
      name: 'test.txt',
      folderId: null,
      size: null,
      mimeType: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    fileService = new FileService(mockFileRepository);
  });

  describe('getByFolder', () => {
    test('should return mapped file DTOs', async () => {
      mockFiles = [
        { id: BigInt(1), name: 'file1.txt', folderId: BigInt(1), size: BigInt(100), mimeType: 'text/plain', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: BigInt(2), name: 'file2.txt', folderId: BigInt(1), size: BigInt(200), mimeType: 'text/plain', createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
      ];
      
      const result = await fileService.getByFolder(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('name', 'file1.txt');
      expect(result[0]).toHaveProperty('folderId', '1');
    });

    test('should handle empty results', async () => {
      mockFiles = [];

      const result = await fileService.getByFolder(1);

      expect(result).toEqual([]);
    });
  });

  describe('createFile', () => {
    test('should create and return a file DTO', async () => {
      const fileData: FileCreateData = {
        name: 'new-file.txt',
        folderId: 1,
        size: 1024,
        mimeType: 'text/plain'
      };
      
      mockFile = {
        id: BigInt(3),
        name: 'new-file.txt',
        folderId: BigInt(1),
        size: BigInt(1024),
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      
      const result = await fileService.createFile(fileData);
      
      expect(result).toHaveProperty('id', '3');
      expect(result).toHaveProperty('name', 'new-file.txt');
      expect(result).toHaveProperty('folderId', '1');
    });
  });
});