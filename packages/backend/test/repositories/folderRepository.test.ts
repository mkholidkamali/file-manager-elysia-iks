import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { folderRepository } from '../../src/repositories/folderRepository';

interface Folder {
  id: bigint;
  name: string;
  parentId: bigint | null;
  path: string | null;
  depth: number | null;
  orderIndex: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const findManyMock = mock<() => Folder[]>(() => []);
const findUniqueMock = mock<() => Folder | null>(() => null);
const createMock = mock<() => Folder>(() => ({} as Folder));

mock.module('../../src/utils/prisma', () => {
  return {
    default: {
      folder: {
        findMany: findManyMock,
        findUnique: findUniqueMock,
        create: createMock
      }
    }
  };
});

const prisma = require('../../src/utils/prisma').default;

describe('FolderRepository', () => {
  beforeEach(() => {
    // Reset mocks before each test
    findManyMock.mockClear();
    findUniqueMock.mockClear();
    createMock.mockClear();
  });

  describe('getAllRoot', () => {
    test('should return all root folders', async () => {
      const mockFolders: Folder[] = [
        { 
          id: BigInt(1), 
          name: 'Folder 1', 
          parentId: null, 
          path: '/folder-1',
          depth: 0,
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        { 
          id: BigInt(2), 
          name: 'Folder 2', 
          parentId: null, 
          path: '/folder-2',
          depth: 0,
          orderIndex: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        }
      ];
      
      findManyMock.mockImplementation(() => mockFolders);
      
      const result = await folderRepository.getAllRoot();
      
      expect(result).toEqual(mockFolders);
      expect(findManyMock).toHaveBeenCalledWith({
        where: { parentId: null, deletedAt: null },
        orderBy: { orderIndex: 'asc' }
      });
    });
  });

  describe('findById', () => {
    test('should return a folder by id', async () => {
      const mockFolder: Folder = {
        id: BigInt(1),
        name: 'Test Folder',
        parentId: null,
        path: '/test-folder',
        depth: 0,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      
      findUniqueMock.mockImplementation(() => mockFolder);
      
      const result = await folderRepository.findById(1);
      
      expect(result).toEqual(mockFolder);
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    test('should return null if folder not found', async () => {
      findUniqueMock.mockImplementation(() => null);
      
      const result = await folderRepository.findById(999);
      
      expect(result).toBeNull();
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { id: 999 }
      });
    });
  });

  describe('createFolder', () => {
    test('should create a folder', async () => {
      const folderData = {
        name: 'New Folder',
        parentId: null,
        path: '/new-folder',
        depth: 1,
        orderIndex: 0
      };
      
      const mockCreatedFolder: Folder = {
        id: BigInt(1),
        name: 'New Folder',
        parentId: null,
        path: '/new-folder',
        depth: 1,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      
      createMock.mockImplementation(() => mockCreatedFolder);
      
      const result = await folderRepository.createFolder(prisma, folderData);
      
      expect(result).toEqual(mockCreatedFolder);
      expect(createMock).toHaveBeenCalledWith({
        data: {
          name: 'New Folder',
          parentId: null,
          path: '/new-folder',
          depth: 1,
          orderIndex: 0
        }
      });
    });
  });
});