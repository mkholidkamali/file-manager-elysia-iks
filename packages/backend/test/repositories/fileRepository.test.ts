import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { fileRepository } from '../../src/repositories/fileRepository';

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

const findManyMock = mock<() => File[]>(() => []);
const createMock = mock<() => File>(() => ({} as File));
const updateManyMock = mock<() => { count: number }>(() => ({ count: 0 }));

mock.module('../../src/utils/prisma', () => {
  return {
    default: {
      file: {
        findMany: findManyMock,
        create: createMock,
        updateMany: updateManyMock
      }
    }
  };
});

const prisma = require('../../src/utils/prisma').default;

describe('FileRepository', () => {
  beforeEach(() => {
    // Reset mocks before each test
    findManyMock.mockClear();
    createMock.mockClear();
    updateManyMock.mockClear();
  });

  describe('getByFolder', () => {
    test('should return files by folder id', async () => {
      const mockFiles: File[] = [
        { 
          id: BigInt(1), 
          name: 'file1.txt', 
          folderId: BigInt(1),
          size: BigInt(1024),
          mimeType: 'text/plain',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        { 
          id: BigInt(2), 
          name: 'file2.txt', 
          folderId: BigInt(1),
          size: BigInt(2048),
          mimeType: 'text/plain',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        }
      ];
      
      findManyMock.mockImplementation(() => mockFiles);
      
      const result = await fileRepository.getByFolder(1);
      
      expect(result).toEqual(mockFiles);
      expect(findManyMock).toHaveBeenCalledWith({
        where: { folderId: 1, deletedAt: null },
        orderBy: { name: 'asc' }
      });
    });

    test('should handle null folder id', async () => {
      const mockFiles: File[] = [
        { 
          id: BigInt(1), 
          name: 'root-file1.txt', 
          folderId: null,
          size: BigInt(1024),
          mimeType: 'text/plain',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        { 
          id: BigInt(2), 
          name: 'root-file2.txt', 
          folderId: null,
          size: BigInt(2048),
          mimeType: 'text/plain',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        }
      ];
      
      findManyMock.mockImplementation(() => mockFiles);
      
      const result = await fileRepository.getByFolder(null);
      
      expect(result).toEqual(mockFiles);
      expect(findManyMock).toHaveBeenCalledWith({
        where: { folderId: null, deletedAt: null },
        orderBy: { name: 'asc' }
      });
    });
  });

  describe('createFile', () => {
    test('should create a file', async () => {
      const fileData = {
        name: 'new-file.txt',
        folderId: BigInt(1),
        size: BigInt(1024),
        mimeType: 'text/plain'
      };
      
      const mockCreatedFile: File = {
        id: BigInt(3),
        name: 'new-file.txt',
        folderId: BigInt(1),
        size: BigInt(1024),
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      
      createMock.mockImplementation(() => mockCreatedFile);
      
      const result = await fileRepository.createFile(prisma, {
        name: fileData.name,
        folderId: Number(fileData.folderId),
        size: Number(fileData.size),
        mimeType: fileData.mimeType
      });
      
      expect(result).toEqual(mockCreatedFile);
      expect(createMock).toHaveBeenCalledWith({
        data: {
          name: fileData.name,
          folderId: Number(fileData.folderId),
          size: Number(fileData.size),
          mimeType: fileData.mimeType
        }
      });
    });
  });

  describe('deleteMany', () => {
    test('should mark files as deleted', async () => {
      const fileIds = [1, 2, 3];
      
      updateManyMock.mockImplementation(() => ({ count: fileIds.length }));
      
      const result = await fileRepository.deleteMany(prisma, fileIds);
      
      expect(result).toEqual(fileIds.length);
      expect(updateManyMock).toHaveBeenCalledWith({
        where: { id: { in: fileIds } },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });
});