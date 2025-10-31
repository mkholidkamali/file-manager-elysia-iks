import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, FileDTO, FolderDTO } from '../services/api';

// Interfaces
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  path: string;
  parentPath: string;
  expanded?: boolean;
  children?: FileItem[];
  parent?: FileItem | null;
  cloudStatus?: 'synced' | 'syncing' | 'error';
  folderId?: number | null; // Reference to backend folder ID
}

export interface MenuItem {
  label: string;
  icon: string;
  command?: () => void;
  items?: MenuItem[];
}

export interface PanelState {
  id: string;
  path: string;
  files: FileItem[];
  loading?: boolean;
}

// File Store
export const useFileStore = defineStore('file', () => {
  // Reactive state
  const panels = ref<PanelState[]>([]);
  const currentPath = ref<string>('/');
  const loading = ref<boolean>(false);
  const folderMenu = ref<MenuItem[]>([]);
  const selectedFolder = ref<FileItem | null>(null);
  const selectedFile = ref<FileItem | null>(null);
  const fileStructure = ref<FileItem[]>([]);
  const showRightPanel = ref<boolean>(false);
  const files = ref<FileItem[]>([]);

  // Helper functions to map DTOs to FileItems
  const mapFileDTO = (fileDTO: FileDTO): FileItem => {
    const extension = fileDTO.name.includes('.') ? fileDTO.name.split('.').pop() || 'file' : 'file';
    
    return {
      id: fileDTO.id.toString(),
      name: fileDTO.name,
      type: extension,
      size: fileDTO.size,
      lastModified: fileDTO.updatedAt,
      path: `/${fileDTO.id}/${fileDTO.name}`,
      parentPath: fileDTO.folderId ? `/${fileDTO.folderId}/` : '/',
      expanded: false,
      children: [],
      parent: null,
      cloudStatus: 'synced',
      folderId: fileDTO.folderId
    };
  };

  const mapFolderDTO = (folderDTO: FolderDTO): FileItem => {
    return {
      id: folderDTO.id.toString(),
      name: folderDTO.name,
      type: 'folder',
      size: 0,
      lastModified: folderDTO.updatedAt,
      path: `/${folderDTO.id}/`,
      parentPath: folderDTO.parentId ? `/${folderDTO.parentId}/` : '/',
      expanded: false,
      children: [],
      parent: null,
      cloudStatus: 'synced',
      folderId: folderDTO.parentId
    };
  };

  // Actions
  const updateFileStructure = (fileList: FileItem[]) => {
    // Reset the structure
    fileStructure.value = [];
    files.value = fileList;
    
    // Create a map for quick lookup
    const fileMap = new Map<string, FileItem>();
    
    // First pass: add all files to the map
    fileList.forEach(file => {
      fileMap.set(file.path, file);
    });
    
    // Second pass: build the tree structure
    fileList.forEach(file => {
      if (file.parentPath === '/') {
        // Root level files/folders
        fileStructure.value.push(file);
      } else {
        // Child files/folders
        const parent = fileMap.get(file.parentPath);
        if (parent && parent.children) {
          parent.children.push(file);
          file.parent = parent;
        }
      }
    });
  };

  // Fetch files and folders from the API
  const fetchFilesAndFolders = async (folderId?: number | null) => {
    loading.value = true;
    try {
      let filesData: FileItem[] = [];
      let foldersData: FileItem[] = [];
      
      if (folderId) {
        // Fetch files for a specific folder
        try {
          const [filesResponse, foldersResponse] = await Promise.all([
            api.files.getAll(folderId),
            api.folders.getChildren(folderId)
          ]);
          
          filesData = filesResponse.map(mapFileDTO);
          foldersData = foldersResponse.map(mapFolderDTO);
        } catch (apiError) {
          console.error('API error:', apiError);
          // Use empty arrays if API fails
          filesData = [];
          foldersData = [];
        }
      } else {
        // Fetch root files and folders
        try {
          const [filesResponse, foldersResponse] = await Promise.all([
            api.files.getAll(null),
            api.folders.getAll()
          ]);
          
          filesData = filesResponse.map(mapFileDTO);
          foldersData = foldersResponse.map(mapFolderDTO);
        } catch (apiError) {
          console.error('API error:', apiError);
          // Use empty arrays if API fails
          filesData = [];
          foldersData = [];
        }
      }
      
      // Combine files and folders
      files.value = [...foldersData, ...filesData];
      
      // Update file structure
      updateFileStructure(files.value);
      
      return files.value;
    } catch (error) {
      console.error('Error fetching files and folders:', error);
      // Set empty arrays to prevent UI from breaking
      files.value = [];
      updateFileStructure([]);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Create a new folder
  const createFolder = async (name: string, parentId: number | null = null) => {
    loading.value = true;
    try {
      const newFolder = await api.folders.create({ name, parentId });
      const mappedFolder = mapFolderDTO(newFolder);
      
      // Add to local files array
      files.value.push(mappedFolder);
      
      // Update file structure
      updateFileStructure(files.value);
      
      return mappedFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Create a new file
  const createFile = async (name: string, size: number, mimeType: string, folderId: number | null = null) => {
    loading.value = true;
    try {
      const newFile = await api.files.create({ name, size, mimeType, folderId });
      const mappedFile = mapFileDTO(newFile);
      
      // Add to local files array
      files.value.push(mappedFile);
      
      // Update file structure
      updateFileStructure(files.value);
      
      return mappedFile;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Move a folder
  const moveFolder = async (id: number, newParentId: number | null) => {
    loading.value = true;
    try {
      const updatedFolder = await api.folders.move(id, newParentId);
      const mappedFolder = mapFolderDTO(updatedFolder);
      
      // Update local files array
      const index = files.value.findIndex(f => f.id === id.toString());
      if (index !== -1) {
        files.value[index] = mappedFolder;
      }
      
      // Update file structure
      updateFileStructure(files.value);
      
      return mappedFolder;
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const refreshPanels = async () => {
    loading.value = true;
    try {
      // Extract folderId from the current path
      const pathParts = currentPath.value.split('/').filter(Boolean);
      const folderId = pathParts.length > 0 ? parseInt(pathParts[0]) : null;
      
      // Fetch updated data
      await fetchFilesAndFolders(folderId);
      
      // Update panels with the current file structure
      panels.value.forEach(panel => {
        panel.files = files.value.filter(file => file.parentPath === panel.path);
      });
    } catch (error) {
      console.error('Error refreshing panels:', error);
    } finally {
      loading.value = false;
    }
  };

  // Initialize explorer with root files and folders
  const initializeExplorer = async () => {
    return fetchFilesAndFolders(null);
  };

  // Computed
  const rootFiles = computed(() => {
    return files.value.filter(file => file.parentPath === '/');
  });

  return {
    // State
    panels,
    currentPath,
    loading,
    folderMenu,
    selectedFolder,
    selectedFile,
    fileStructure,
    showRightPanel,
    files,
    rootFiles,
    
    // Actions
    updateFileStructure,
    refreshPanels,
    fetchFilesAndFolders,
    createFolder,
    createFile,
    moveFolder,
    initializeExplorer
  };
});