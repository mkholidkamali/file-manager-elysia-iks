import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { FolderService } from '../../src/services/folderService';
import type { Prisma } from '../../src/generated/prisma/client';
import type { IFolderRepository } from '../../src/ports/IFolderRepository';

type tx = Prisma.TransactionClient | typeof import('../../src/utils/prisma').default;

mock.module('../../src/utils/transaction', () => {
  return {
    withTransaction: <T>(fn: (tx: tx, ...args: any[]) => Promise<T>) => {
      return async (...args: any[]) => {
        return fn({} as tx, ...args);
      };
    }
  };
});

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

let mockRootFolders: Folder[] = [];
let mockFolder: Folder | null = null;
let mockChildren: Folder[] = [];
let mockCreatedFolder: Partial<Folder> = {};

const mockFolderRepository: IFolderRepository = {
  getAllRoot: async () => mockRootFolders,
  findById: async (id: number | bigint) => mockFolder,
  findChildren: async (parentId: number | null) => mockChildren,
  createFolder: async (tx: tx | undefined, data: { parentId: number | null; name: string; path: string; depth?: number; orderIndex?: number }) => {
    return {
      id: BigInt(1),
      name: data.name,
      parentId: data.parentId ? BigInt(data.parentId) : null,
      path: data.path,
      depth: data.depth || 0,
      orderIndex: data.orderIndex || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
  },
  updateFolder: async (tx: tx | undefined, id: number | bigint, data: { name?: string; path?: string; depth?: number; orderIndex?: number; parentId?: number | bigint | null }) => {
    return {
      id: typeof id === 'number' ? BigInt(id) : id,
      name: data.name || 'Updated Folder',
      parentId: data.parentId === undefined ? null : (typeof data.parentId === 'number' ? BigInt(data.parentId) : data.parentId),
      path: data.path || '/updated-path',
      depth: data.depth || 0,
      orderIndex: data.orderIndex || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
  },
  deleteMany: async (tx: tx | undefined, ids: number[]) => 0,
  rawExecute: async (tx: tx | undefined, sql: string, params: any[]) => ({}),
  updateDescendantsPathRaw: async (tx: tx | undefined, oldPath: string, newPath: string) => 0
};

describe('FolderService', () => {
  let folderService: FolderService;
  
  beforeEach(() => {
    mockRootFolders = [];
    mockFolder = null;
    mockChildren = [];
    mockCreatedFolder = {};

    folderService = new FolderService(mockFolderRepository);
  });

  describe('getAllRoot', () => {
    test('should return mapped folder DTOs', async () => {
      mockRootFolders = [
        { id: BigInt(1), name: 'Folder 1', path: '/folder1', parentId: null, depth: 0, orderIndex: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: BigInt(2), name: 'Folder 2', path: '/folder2', parentId: null, depth: 0, orderIndex: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
      ];
      
      const result = await folderService.getAllRoot();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('name', 'Folder 1');
      expect(result[0]).toHaveProperty('parentId', null);
    });

    test('should handle empty results', async () => {
      mockRootFolders = [];

      const result = await folderService.getAllRoot();

      expect(result).toEqual([]);
    });
  });

  describe('createFolderWithPath', () => {
    test('should create and return a folder DTO', async () => {
      mockFolder = {
        id: BigInt(1),
        name: 'Parent',
        path: '/parent',
        parentId: null,
        depth: 0,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      mockCreatedFolder = {
        id: BigInt(3),
        name: 'New Folder',
        path: '/parent/new-folder',
        parentId: BigInt(1),
        depth: 1,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      
      const result = await folderService.createFolderWithPath('New Folder', 1);
      
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name', 'New Folder');
      expect(result).toHaveProperty('parentId', '1');
    });
  });
});