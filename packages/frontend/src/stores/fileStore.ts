import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  path: string;
  parentPath?: string; // Path of the parent folder
  expanded?: boolean; // Track expanded state for folders
  children?: FileItem[]; // Children for hierarchical structure
  parent?: string | null; // Parent path for navigation
  cloudStatus?: string; // Cloud sync status
}

export interface MenuItem {
  label: string;
  icon?: string;
  command?: () => void;
  items?: MenuItem[];
  expanded?: boolean;
}

export interface PanelState {
  id: string;
  path: string;
  files: FileItem[];
  selectedFile: FileItem | null;
  loading: boolean;
  visible?: boolean; // Control panel visibility
}

export const useFileStore = defineStore('file', () => {
  const panels = ref<PanelState[]>([]);
  const currentPath = ref<string>('/');
  const loading = ref<boolean>(false);
  const folderMenu = ref<MenuItem[]>([]);
  const selectedFolder = ref<string | null>(null);
  const selectedFile = ref<FileItem | null>(null);
  const fileStructure = ref<FileItem[]>([]); // Hierarchical file structure
  const showRightPanel = ref<boolean>(false); // Control right panel visibility
  const files = ref<FileItem[]>([]); // Flat list of files for the current view

  // Computed property to get the current folder structure
  const currentFolderStructure = computed(() => {
    return fileStructure.value;
  });

  // Method to set the current path
  const setCurrentPath = (path: string): void => {
    currentPath.value = path;
  };

  // Method to set the selected file
  const setSelectedFile = (file: FileItem): void => {
    selectedFile.value = file;
  };

  const fetchFolderStructure = async (): Promise<void> => {
    loading.value = true;
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize the hierarchical file structure
      fileStructure.value = [
        {
          id: 'root',
          name: 'Root',
          type: 'folder',
          size: 0,
          lastModified: new Date().toISOString(),
          path: '/',
          expanded: false,
          children: [
            {
              id: 'documents',
              name: 'Documents',
              type: 'folder',
              size: 0,
              lastModified: new Date().toISOString(),
              path: '/Documents/',
              expanded: false,
              parent: '/',
              children: [
                {
                  id: 'work',
                  name: 'Work',
                  type: 'folder',
                  size: 0,
                  lastModified: '2023-01-15T10:30:00',
                  path: '/Documents/Work/',
                  expanded: false,
                  parent: '/Documents/',
                  children: [
                    {
                      id: '7',
                      name: 'project.docx',
                      type: 'file',
                      size: 1024 * 1024 * 1.8, // 1.8 MB
                      lastModified: '2023-01-04T11:10:00',
                      path: '/Documents/Work/project.docx',
                      parent: '/Documents/Work/'
                    }
                  ]
                },
                {
                  id: 'personal',
                  name: 'Personal',
                  type: 'folder',
                  size: 0,
                  lastModified: '2023-01-10T14:20:00',
                  path: '/Documents/Personal/',
                  expanded: false,
                  parent: '/Documents/',
                  children: [
                    {
                      id: '8',
                      name: 'notes.txt',
                      type: 'file',
                      size: 1024 * 10, // 10 KB
                      lastModified: '2023-01-06T14:25:00',
                      path: '/Documents/Personal/notes.txt',
                      parent: '/Documents/Personal/'
                    }
                  ]
                },
                {
                  id: '3',
                  name: 'report.pdf',
                  type: 'file',
                  size: 1024 * 1024 * 2.5, // 2.5 MB
                  lastModified: '2023-01-05T09:15:00',
                  path: '/Documents/report.pdf',
                  parent: '/Documents/'
                }
              ]
            },
            {
              id: 'images',
              name: 'Images',
              type: 'folder',
              size: 0,
              lastModified: new Date().toISOString(),
              path: '/Images/',
              expanded: false,
              parent: '/',
              children: [
                {
                  id: 'vacation',
                  name: 'Vacation',
                  type: 'folder',
                  size: 0,
                  lastModified: '2023-01-02T16:45:00',
                  path: '/Images/Vacation/',
                  expanded: false,
                  parent: '/Images/',
                  children: [
                    {
                      id: '9',
                      name: 'beach.jpg',
                      type: 'file',
                      size: 1024 * 1024 * 2.1, // 2.1 MB
                      lastModified: '2023-01-07T09:40:00',
                      path: '/Images/Vacation/beach.jpg',
                      parent: '/Images/Vacation/'
                    }
                  ]
                },
                {
                  id: '5',
                  name: 'photo1.jpg',
                  type: 'file',
                  size: 1024 * 1024 * 3.2, // 3.2 MB
                  lastModified: '2023-01-01T12:30:00',
                  path: '/Images/photo1.jpg',
                  parent: '/Images/'
                }
              ]
            },
            {
              id: 'music',
              name: 'Music',
              type: 'folder',
              size: 0,
              lastModified: new Date().toISOString(),
              path: '/Music/',
              expanded: false,
              parent: '/',
              children: [
                {
                  id: '6',
                  name: 'song1.mp3',
                  type: 'file',
                  size: 1024 * 1024 * 4.5, // 4.5 MB
                  lastModified: '2023-01-03T18:20:00',
                  path: '/Music/song1.mp3',
                  parent: '/Music/'
                }
              ]
            }
          ]
        }
      ];
      
      // Initialize the folder menu for navigation
      updateFolderMenu();
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    } finally {
      loading.value = false;
    }
  };

  // Update folder menu based on the file structure
  const updateFolderMenu = (): void => {
    // Create menu items from the file structure
    folderMenu.value = [
      {
        label: 'Folders',
        icon: 'pi pi-fw pi-folder',
        expanded: true,
        items: createMenuItems(fileStructure.value)
      }
    ];
  };

  // Recursively create menu items from file structure
  const createMenuItems = (items: FileItem[]): MenuItem[] => {
    return items
      .filter(item => item.type === 'folder')
      .map(folder => {
        return {
          label: folder.name,
          icon: 'pi pi-fw pi-folder',
          expanded: folder.expanded,
          command: () => toggleFolder(folder),
          items: folder.children ? createMenuItems(folder.children) : undefined
        };
      });
  };

  // Fetch files for a specific path
  const fetchFiles = async (path: string = '/'): Promise<FileItem[]> => {
    loading.value = true;
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data based on path
      let mockFiles: FileItem[] = [];
      
      if (path === '/') {
        // Root directory contains top-level folders
        mockFiles = [
          {
            id: 'documents',
            name: 'Documents',
            type: 'folder',
            size: 0,
            lastModified: new Date().toISOString(),
            path: '/Documents/',
            expanded: false,
            parent: '/'
          },
          {
            id: 'images',
            name: 'Images',
            type: 'folder',
            size: 0,
            lastModified: new Date().toISOString(),
            path: '/Images/',
            expanded: false,
            parent: '/'
          },
          {
            id: 'music',
            name: 'Music',
            type: 'folder',
            size: 0,
            lastModified: new Date().toISOString(),
            path: '/Music/',
            expanded: false,
            parent: '/'
          }
        ];
      } else if (path === '/Documents/') {
        mockFiles = [
          {
            id: 'work',
            name: 'Work',
            type: 'folder',
            size: 0,
            lastModified: '2023-01-15T10:30:00',
            path: '/Documents/Work/',
            expanded: false,
            parent: '/Documents/'
          },
          {
            id: 'personal',
            name: 'Personal',
            type: 'folder',
            size: 0,
            lastModified: '2023-01-10T14:20:00',
            path: '/Documents/Personal/',
            expanded: false,
            parent: '/Documents/'
          },
          {
            id: '3',
            name: 'report.pdf',
            type: 'file',
            size: 1024 * 1024 * 2.5, // 2.5 MB
            lastModified: '2023-01-05T09:15:00',
            path: '/Documents/report.pdf',
            parent: '/Documents/'
          }
        ];
      } else if (path === '/Images/') {
        mockFiles = [
          {
            id: 'vacation',
            name: 'Vacation',
            type: 'folder',
            size: 0,
            lastModified: '2023-01-02T16:45:00',
            path: '/Images/Vacation/',
            expanded: false,
            parent: '/Images/'
          },
          {
            id: '5',
            name: 'photo1.jpg',
            type: 'file',
            size: 1024 * 1024 * 3.2, // 3.2 MB
            lastModified: '2023-01-01T12:30:00',
            path: '/Images/photo1.jpg',
            parent: '/Images/'
          }
        ];
      } else if (path === '/Music/') {
        mockFiles = [
          {
            id: '6',
            name: 'song1.mp3',
            type: 'file',
            size: 1024 * 1024 * 4.5, // 4.5 MB
            lastModified: '2023-01-03T18:20:00',
            path: '/Music/song1.mp3',
            parent: '/Music/'
          }
        ];
      } else if (path === '/Documents/Work/') {
        mockFiles = [
          {
            id: '7',
            name: 'project.docx',
            type: 'file',
            size: 1024 * 1024 * 1.8, // 1.8 MB
            lastModified: '2023-01-04T11:10:00',
            path: '/Documents/Work/project.docx',
            parent: '/Documents/Work/'
          }
        ];
      } else if (path === '/Documents/Personal/') {
        mockFiles = [
          {
            id: '8',
            name: 'notes.txt',
            type: 'file',
            size: 1024 * 10, // 10 KB
            lastModified: '2023-01-06T14:25:00',
            path: '/Documents/Personal/notes.txt',
            parent: '/Documents/Personal/'
          }
        ];
      } else if (path === '/Images/Vacation/') {
        mockFiles = [
          {
            id: '9',
            name: 'beach.jpg',
            type: 'file',
            size: 1024 * 1024 * 2.1, // 2.1 MB
            lastModified: '2023-01-07T09:40:00',
            path: '/Images/Vacation/beach.jpg',
            parent: '/Images/Vacation/'
          }
        ];
      }
      
      // Update the current path and files list
      currentPath.value = path;
      files.value = mockFiles;
      
      return mockFiles;
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Toggle folder expansion state
  const toggleFolder = (folder: FileItem): void => {
    // Toggle the expanded state
    folder.expanded = !folder.expanded;
    
    // Update the current path
    currentPath.value = folder.path;
    
    // If expanding, fetch children if not already loaded
    if (folder.expanded && (!folder.children || folder.children.length === 0)) {
      fetchFiles(folder.path).then(files => {
        if (folder.children) {
          folder.children = files;
        } else {
          folder.children = [];
        }
        updateFolderMenu();
      });
    }
    
    // Update the folder menu to reflect changes
    updateFolderMenu();
  };

  const selectFolder = async (path: string): Promise<void> => {
    selectedFolder.value = path;
    
    // Find the folder in the file structure
    const folder = findFolderByPath(path);
    
    if (folder) {
      // Toggle the folder expansion
      toggleFolder(folder);
    } else {
      console.error('Folder not found:', path);
    }
  };
  
  // Helper function to find a folder by path
  const findFolderByPath = (path: string): FileItem | null => {
    // Recursive function to search through the file structure
    const findFolder = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findFolder(fileStructure.value);
  };
  
  const selectFile = (file: FileItem): void => {
    selectedFile.value = file;
    showRightPanel.value = true;
    
    // Update the selected file in the current panel
    if (panels.value.length > 0) {
      const lastPanel = panels.value[panels.value.length - 1];
      lastPanel.selectedFile = file;
    }
  };
  
  const closePanel = (panelId: string): void => {
    const panelIndex = panels.value.findIndex(panel => panel.id === panelId);
    if (panelIndex !== -1) {
      // Remove this panel and all panels to the right
      panels.value = panels.value.slice(0, panelIndex);
      
      // Update selected folder to the path of the new rightmost panel
      if (panels.value.length > 0) {
        const lastPanel = panels.value[panels.value.length - 1];
        selectedFolder.value = lastPanel.path;
      } else {
        selectedFolder.value = null;
      }
    }
  };

  const createFolder = async (name: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Add new folder to the file structure
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      size: 0,
      lastModified: new Date().toISOString(),
      path: `${currentPath.value}${name}/`,
      expanded: false,
      parent: currentPath.value,
      children: []
    };
    
    // Find the parent folder and add the new folder to its children
    const parentFolder = findFolderByPath(currentPath.value);
    if (parentFolder && parentFolder.children) {
      parentFolder.children.push(newFolder);
      updateFolderMenu();
    }
  };

  // Delete a file by ID
  const deleteFile = async (fileId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the file to delete
    const findAndDeleteItem = (items: FileItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === fileId) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children) {
          if (findAndDeleteItem(items[i].children as FileItem[])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndDeleteItem(fileStructure.value);
    updateFolderMenu();
    
    // If the deleted item was the selected file, clear the selection
    if (selectedFile.value && selectedFile.value.id === fileId) {
      selectedFile.value = null;
      showRightPanel.value = false;
    }
  };

  // Upload a file (mock implementation)
  const uploadFile = async (file: File, destination: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a new file item
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.split('/')[1] || 'file',
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
      path: `${destination}${file.name}`,
      parent: destination
    };
    
    // Add to the file structure
    const parentFolder = findFolderByPath(destination);
    if (parentFolder && parentFolder.children) {
      parentFolder.children.push(newFile);
      updateFolderMenu();
    }
  };

  // Download a file (mock implementation)
  const downloadFile = async (fileId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Downloading file with ID: ${fileId}`);
    // In a real implementation, this would trigger a download
  };

  // Rename a file or folder
  const renameFile = async (fileId: string, newName: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the file to rename
    const findAndRenameItem = (items: FileItem[]): boolean => {
      for (const item of items) {
        if (item.id === fileId) {
          item.name = newName;
          // Update path
          const pathParts = item.path.split('/');
          pathParts[pathParts.length - 2] = newName;
          item.path = pathParts.join('/');
          return true;
        }
        if (item.children) {
          if (findAndRenameItem(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndRenameItem(fileStructure.value);
    updateFolderMenu();
  };

  // Move a file or folder
  const moveFile = async (fileId: string, destination: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the file to move
    let fileToMove: FileItem | null = null;
    
    const findAndRemoveItem = (items: FileItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === fileId) {
          fileToMove = items[i];
          items.splice(i, 1);
          return true;
        }
        if (items[i].children) {
          if (findAndRemoveItem(items[i].children || [])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndRemoveItem(fileStructure.value);
    
    if (fileToMove) {
      // Update path - use type assertion to tell TypeScript this is a FileItem
      const file = fileToMove as FileItem;
      const oldPath = file.path;
      const fileName = oldPath.split('/').filter(Boolean).pop() || '';
      file.path = `${destination}${fileName}${file.type === 'folder' ? '/' : ''}`;
      file.parent = destination;
      
      // Add to destination
      const destFolder = findFolderByPath(destination);
      if (destFolder && destFolder.children) {
        destFolder.children.push(fileToMove);
      }
    }
    
    updateFolderMenu();
  };

  // Copy a file or folder
  const copyFile = async (fileId: string, destination: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the file to copy
    const findItem = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === fileId) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const fileToCopy = findItem(fileStructure.value);
    
    if (fileToCopy) {
      // Create a deep copy
      const copyItem = (item: FileItem): FileItem => {
        const newItem: FileItem = {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          parent: destination
        };
        
        // Update path
        const fileName = item.path.split('/').filter(Boolean).pop() || '';
        newItem.path = `${destination}${fileName}${item.type === 'folder' ? '/' : ''}`;
        
        // Copy children recursively if it's a folder
        if (item.type === 'folder' && item.children && item.children.length > 0) {
          newItem.children = item.children.map((child: FileItem) => copyItem(child));
        } else {
          // Ensure children is defined for folders
          if (item.type === 'folder') {
            newItem.children = [];
          }
        }
        
        return newItem;
      };
      
      const newItem = copyItem(fileToCopy);
      
      // Add to destination
      const destFolder = findFolderByPath(destination);
      if (destFolder && destFolder.children) {
        destFolder.children.push(newItem);
      }
      
      updateFolderMenu();
    }
  };

  // Search files by name
  const searchFiles = async (query: string): Promise<FileItem[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results: FileItem[] = [];
    
    // Recursive search function
    const searchInItems = (items: FileItem[]): void => {
      for (const item of items) {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(item);
        }
        if (item.children) {
          searchInItems(item.children);
        }
      }
    };
    
    searchInItems(fileStructure.value);
    return results;
  };

  return {
    panels,
    currentPath,
    loading,
    folderMenu,
    selectedFolder,
    selectedFile,
    fileStructure,
    showRightPanel,
    files,
    currentFolderStructure,
    fetchFolderStructure,
    selectFolder,
    selectFile,
    createFolder,
    deleteFile,
    uploadFile,
    downloadFile,
    renameFile,
    moveFile,
    copyFile,
    searchFiles,
    setCurrentPath,
    setSelectedFile,
    fetchFiles,
    closePanel
  };
});