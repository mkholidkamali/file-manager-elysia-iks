
// API service for communicating with the backend
// Using real API to connect to the backend
const USE_MOCK_DATA = false; // Set to false to use real backend data
const API_BASE_URL = 'http://localhost:3010'; // Backend API URL

// Prevent direct script loading
if (import.meta.url === document.currentScript?.src) {
  console.error('This file should not be loaded directly in the browser');
}

// File interfaces
export interface FileDTO {
  id: number;
  name: string;
  size: number;
  mimeType: string;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileDTO {
  name: string;
  size?: number;
  mimeType?: string;
  folderId?: number | null;
}

// Folder interfaces
export interface FolderDTO {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderDTO {
  name: string;
  parentId?: number | null;
}

// API service
export const api = {
  // File operations
  files: {
    getAll: async (folderId?: number | null): Promise<FileDTO[]> => {
      // Use mock data when API is unavailable
      if (USE_MOCK_DATA) {
        console.log('Using mock file data');
        return [
          {
            id: 1,
            name: 'Document.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            folderId: folderId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Image.jpg',
            size: 2048,
            mimeType: 'image/jpeg',
            folderId: folderId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
      
      try {
        const url = folderId 
          ? `${API_BASE_URL}/v1/files?folderId=${folderId}` 
          : `${API_BASE_URL}/v1/files`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON. Check API endpoint URL.');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    
    create: async (data: CreateFileDTO): Promise<FileDTO> => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create file: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON. Check API endpoint URL.');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    },
  },
  
  // Folder operations
  folders: {
    getAll: async (parentId?: number | null): Promise<FolderDTO[]> => {
      // Use mock data when API is unavailable
      if (USE_MOCK_DATA) {
        console.log('Using mock folder data');
        return [
          {
            id: 1,
            name: 'Documents',
            path: '/Documents',
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Images',
            path: '/Images',
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
      
      try {
        const url = parentId 
          ? `${API_BASE_URL}/v1/folders?parentId=${parentId}` 
          : `${API_BASE_URL}/v1/folders`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch folders: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON. Check API endpoint URL.');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    
    getChildren: async (folderId: number): Promise<FolderDTO[]> => {
      // Use mock data when API is unavailable
      if (USE_MOCK_DATA) {
        console.log('Using mock folder children data');
        return [
          {
            id: 3,
            name: 'Subfolder',
            path: `/Subfolder`,
            parentId: folderId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/folders/${folderId}/children`);
      if (!response.ok) {
        throw new Error(`Failed to fetch folder children: ${response.statusText}`);
      }
      return response.json();
    },
    
    create: async (data: CreateFolderDTO): Promise<FolderDTO> => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/folders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create folder: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON. Check API endpoint URL.');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    },
    
    move: async (folderId: number, parentId: number | null): Promise<FolderDTO> => {
      const response = await fetch(`${API_BASE_URL}/v1/folders/${folderId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to move folder: ${response.statusText}`);
      }
      return response.json();
    }
  }
};

export default api;