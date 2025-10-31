<template>
  <div class="explorer-view">
    <!-- Top navigation bar with back/forward buttons and view options -->
    <div class="finder-toolbar">
      <div class="navigation-controls">
        <Button icon="pi pi-chevron-left" class="p-button-text p-button-rounded nav-button" @click="navigateBack" />
        <Button icon="pi pi-chevron-right" class="p-button-text p-button-rounded nav-button" @click="navigateForward" />
      </div>
      <div class="search-container">
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input type="text" placeholder="Search" class="search-input" />
        </div>
        <Button icon="pi pi-plus" class="p-button-rounded add-button" @click="showAddDialog = true" />
      </div>
      
      <!-- Add new item dialog -->
      <Dialog v-model:visible="showAddDialog" header="Add New Item" :modal="true" class="add-dialog">
        <div class="add-dialog-content">
          <div class="form-group">
            <label>Type:</label>
            <Dropdown v-model="newItemType" :options="itemTypes" optionLabel="name" optionValue="value" placeholder="Select Type" />
          </div>
          <div class="form-group">
            <label>Name:</label>
            <InputText v-model="newItemName" placeholder="Enter name" />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" />
          <Button label="Add" icon="pi pi-check" @click="addNewItem" />
        </template>
      </Dialog>
    </div>

    <div class="finder-container">
      <!-- Main content area with panels -->
      <div class="content-area">
        <!-- Panels container -->
        <div class="panels-container">
          <!-- Each panel represents a folder level -->
          <div 
            v-for="panel in activePanels" 
            :key="panel.id" 
            class="folder-panel"
          >
            <div class="panel-header">
              <span class="panel-title">{{ getPanelTitle(panel) }}</span>
            </div>
            <div class="panel-content">
              <div 
                v-for="file in panel.files" 
                :key="file.id" 
                class="file-item list-item"
                :class="{ 'selected': panel.selectedFile && panel.selectedFile.id === file.id }"
                @click="handleItemClick(file, panel)"
                draggable="true"
                @dragstart="handleDragStart($event, file)"
                @dragover.prevent
                @drop="handleDrop($event, file, panel)"
              >
                <i :class="getFileIcon(file)" class="file-icon"></i>
                <span class="file-name">{{ file.name }}</span>
                <i v-if="file.type === 'folder'" class="pi pi-chevron-right folder-arrow"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right panel for file details -->
        <div v-if="selectedFile" class="file-details-panel" :style="{ left: getFileDetailsPanelLeft() + 'px' }">
          <div class="file-details-header">
            <h3>File Details</h3>
          </div>
          <div class="file-details-content">
            <div class="file-logo">
              <i :class="getFileIcon(selectedFile)" class="file-icon-large"></i>
            </div>
            <div class="file-info">
              <div class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ selectedFile.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">{{ selectedFile.type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Modified:</span>
                <span class="info-value">{{ formatDate(selectedFile.lastModified) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFileStore } from '../stores/fileStore';
import { type FileItem } from '../stores/fileStore';

// Components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';

// Type for drag events
type DragEventWithDataTransfer = DragEvent & {
  dataTransfer: DataTransfer;
};

// Define formatters locally since the module might not be available yet
// Using @ts-ignore to suppress unused variable warnings
// @ts-ignore
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date for better readability
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Define Panel type
interface Panel {
  id: string;
  path: string;
  files: FileItem[];
  selectedFile: FileItem | null;
}

const fileStore = useFileStore();
const navigationHistory = ref<string[]>(['/']);

// Add dialog state
const showAddDialog = ref(false);
const newItemName = ref('');
const newItemType = ref('folder');
const itemTypes = [
  { name: 'Folder', value: 'folder' },
  { name: 'File', value: 'file' }
];
const currentHistoryIndex = ref(0);
const activePanels = ref<Panel[]>([]);
const selectedFile = ref<FileItem | null>(null);

// Mock files for development
const mockFilesData: FileItem[] = [
  {
    id: '1',
    name: 'Aplikasi-Pe...u-Tidur.pptx',
    type: 'pptx',
    size: 2500000,
    lastModified: new Date().toISOString(),
    path: '/Aplikasi-Pe...u-Tidur.pptx',
    parentPath: '/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  {
    id: '2',
    name: 'Arduino',
    type: 'folder',
    size: 0,
    lastModified: new Date().toISOString(),
    path: '/Arduino/',
    parentPath: '/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  {
    id: '3',
    name: 'Database',
    type: 'folder',
    size: 0,
    lastModified: new Date().toISOString(),
    path: '/Database/',
    parentPath: '/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  {
    id: '4',
    name: 'Dump',
    type: 'folder',
    size: 0,
    lastModified: new Date().toISOString(),
    path: '/Dump/',
    parentPath: '/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  {
    id: '5',
    name: 'org.safeexa...-30-473.log',
    type: 'log',
    size: 1200000,
    lastModified: new Date().toISOString(),
    path: '/org.safeexa...-30-473.log',
    parentPath: '/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  // Arduino folder contents
  {
    id: '6',
    name: 'Project1',
    type: 'folder',
    size: 0,
    lastModified: new Date().toISOString(),
    path: '/Arduino/Project1/',
    parentPath: '/Arduino/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  {
    id: '7',
    name: 'sketch.ino',
    type: 'ino',
    size: 5000,
    lastModified: new Date().toISOString(),
    path: '/Arduino/sketch.ino',
    parentPath: '/Arduino/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  },
  // Database folder contents
  {
    id: '8',
    name: 'users.db',
    type: 'db',
    size: 1500000,
    lastModified: new Date().toISOString(),
    path: '/Database/users.db',
    parentPath: '/Database/',
    expanded: false,
    children: [],
    parent: null,
    cloudStatus: 'synced'
  }
];

const mockFiles = ref<FileItem[]>(mockFilesData);



// Computed properties for panel titles
function getPanelTitle(panel: Panel) {
  const pathParts = panel.path.split('/').filter(Boolean);
  return pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'Root';
}


// Get files for a specific path
const getFilesForPath = (path: string): FileItem[] => {
  return mockFiles.value.filter(file => file.parentPath === path);
};

// Initialize the first panel with root files
onMounted(() => {
  // Initialize with root panel
  activePanels.value = [
    {
      id: 'root-panel',
      path: '/',
      files: getFilesForPath('/'),
      selectedFile: null
    }
  ];
  
  // Set initial path
  fileStore.currentPath = '/';
});

// Handle item click in a panel
function handleItemClick(file: FileItem, panel: Panel) {
  // Update selected file in the panel
  panel.selectedFile = file;
  
  // Find the index of the current panel
  const panelIndex = activePanels.value.findIndex(p => p.id === panel.id);
  
  // If it's a folder, open a new panel or update existing one
  if (file.type === 'folder') {
    // Clear the selected file for the details panel when opening a folder
    selectedFile.value = null;
    
    // Remove any panels to the right of this one
    if (panelIndex !== -1) {
      activePanels.value = activePanels.value.slice(0, panelIndex + 1);
    }
    
    // Add a new panel for the folder
    activePanels.value.push({
      id: `panel-${file.id}`,
      path: file.path,
      files: getFilesForPath(file.path),
      selectedFile: null
    });
    
    // Update current path
    fileStore.currentPath = file.path;
    
    // Add to navigation history
    if (navigationHistory.value[currentHistoryIndex.value] !== file.path) {
      navigationHistory.value = navigationHistory.value.slice(0, currentHistoryIndex.value + 1);
      navigationHistory.value.push(file.path);
      currentHistoryIndex.value = navigationHistory.value.length - 1;
    }
  } else {
    // For files: remove any panels after the current one
    if (panelIndex !== -1) {
      activePanels.value = activePanels.value.slice(0, panelIndex + 1);
    }
    
    // Set the selected file for the details panel only if it's a file
    selectedFile.value = file;
  }
}

// Navigate to a folder
function navigateToFolder(path: string) {
  // Build the folder hierarchy
  const pathParts = path.split('/').filter(Boolean);
  const panels = [];
  
  // Always start with root
  panels.push({
    id: 'root-panel',
    path: '/',
    files: getFilesForPath('/'),
    selectedFile: null
  });
  
  // Build the path hierarchy
  let currentPath = '/';
  for (let i = 0; i < pathParts.length; i++) {
    currentPath += pathParts[i] + '/';
    panels.push({
      id: `panel-${Date.now()}-${i}`,
      path: currentPath,
      files: getFilesForPath(currentPath),
      selectedFile: null
    });
  }
  
  // Set the panels
  activePanels.value = panels;
  
  // Update current path
  fileStore.currentPath = path;
  
  // Add to navigation history
  if (navigationHistory.value[currentHistoryIndex.value] !== path) {
    navigationHistory.value = navigationHistory.value.slice(0, currentHistoryIndex.value + 1);
    navigationHistory.value.push(path);
    currentHistoryIndex.value = navigationHistory.value.length - 1;
  }
}

// Navigate back in history
function navigateBack() {
  if (currentHistoryIndex.value > 0) {
    // Clear selected file
    selectedFile.value = null;
    
    currentHistoryIndex.value--;
    const path = navigationHistory.value[currentHistoryIndex.value];
    navigateToFolder(path);
  }
}

// Navigate forward in history
function navigateForward() {
  if (currentHistoryIndex.value < navigationHistory.value.length - 1) {
    // Clear selected file
    selectedFile.value = null;
    
    currentHistoryIndex.value++;
    const path = navigationHistory.value[currentHistoryIndex.value];
    navigateToFolder(path);
  }
}

// This function is now defined earlier in the file

// Calculate the left position for file details panel
function getFileDetailsPanelLeft() {
  // If there are no panels, position at 0
  if (activePanels.value.length === 0) return 0;
  
  // Calculate the width of all panels (using the fixed width of panels)
  // Each panel is 250px min-width as defined in CSS
  return activePanels.value.length * 250;
}

// Get file icon based on type
function getFileIcon(file: FileItem) {
  if (file.type === 'folder') {
    return 'pi pi-folder';
  }
  
  // Map file types to icons
  const iconMap: Record<string, string> = {
    'pdf': 'pi pi-file-pdf',
    'doc': 'pi pi-file-word',
    'docx': 'pi pi-file-word',
    'xls': 'pi pi-file-excel',
    'xlsx': 'pi pi-file-excel',
    'ppt': 'pi pi-file-powerpoint',
    'pptx': 'pi pi-file-powerpoint',
    'jpg': 'pi pi-image',
    'jpeg': 'pi pi-image',
    'png': 'pi pi-image',
    'gif': 'pi pi-image',
    'mp3': 'pi pi-volume-up',
    'mp4': 'pi pi-video',
    'zip': 'pi pi-file-archive',
    'rar': 'pi pi-file-archive',
    'txt': 'pi pi-file-text',
    'html': 'pi pi-code',
    'css': 'pi pi-code',
    'js': 'pi pi-code',
    'json': 'pi pi-code',
    'ts': 'pi pi-code',
    'vue': 'pi pi-code',
    'jsx': 'pi pi-code',
    'tsx': 'pi pi-code'
  };
  
  return iconMap[file.type] || 'pi pi-file';
}





// File/Folder Creation
function addNewItem() {
  const currentPath = fileStore.currentPath;
  
  if (!newItemName.value || newItemName.value.trim() === '') {
    alert('Please enter a valid name');
    return;
  }
  
  // Check for duplicate names
  const existingItem = mockFiles.value.find(
    item => item.parentPath === currentPath && item.name === newItemName.value.trim()
  );
  
  if (existingItem) {
    alert('An item with this name already exists in this location');
    return;
  }
  
  if (newItemType.value === 'folder') {
    // Create new folder
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: newItemName.value.trim(),
      type: 'folder',
      size: 0,
      lastModified: new Date().toISOString(),
      path: `${currentPath}${newItemName.value.trim()}/`,
      parentPath: currentPath,
      expanded: false,
      children: [],
      parent: null,
      cloudStatus: 'synced'
    };
    
    // Add to mock files
    mockFiles.value.push(newFolder);
  } else {
    // Create new file
    const extension = newItemName.value.includes('.') ? 
      newItemName.value.split('.').pop() || 'txt' : 'txt';
    
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: newItemName.value.trim(),
      type: extension,
      size: 0,
      lastModified: new Date().toISOString(),
      path: `${currentPath}${newItemName.value.trim()}`,
      parentPath: currentPath,
      expanded: false,
      children: [],
      parent: null,
      cloudStatus: 'synced'
    };
    
    // Add to mock files
    mockFiles.value.push(newFile);
  }
  
  // Reset form and close dialog
  newItemName.value = '';
  newItemType.value = 'folder';
  showAddDialog.value = false;
  
  // Refresh the current panel
  refreshCurrentPanel();
}


// Download file functionality will be implemented in a future update
// This will include UI elements to trigger file downloads

// Drag and drop functionality
function handleDragStart(event: DragEvent, file: FileItem) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', file.id);
    event.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the dragged element for visual feedback
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragging');
    }
  }
}

function handleDrop(event: DragEvent, targetFile: FileItem, panel: Panel) {
  if (event.dataTransfer) {
    const sourceFileId = event.dataTransfer.getData('text/plain');
    const sourceFile = mockFiles.value.find(file => file.id === sourceFileId);
    
    // Remove dragging class from all elements
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    if (sourceFile) {
      // Prevent dropping an item onto itself
      if (sourceFile.id === targetFile.id) {
        return;
      }
      
      // Prevent dropping a folder into its own subfolder
      if (sourceFile.type === 'folder' && targetFile.type === 'folder' && 
          targetFile.path.startsWith(sourceFile.path)) {
        alert("Cannot move a folder into its own subfolder");
        return;
      }
      
      if (targetFile.type === 'folder') {
        // Move the file to the target folder
        moveItem(sourceFile, targetFile.path);
      } else {
        // If dropped on a file, move to that file's parent folder (panel's path)
        moveItem(sourceFile, panel.path);
      }
    }
  }
}

// Add dragover handler to panel content for parent level drop
function addPanelDropListeners() {
  const panelContents = document.querySelectorAll('.panel-content');
  panelContents.forEach((panelContent, index) => {
    panelContent.addEventListener('dragover', (event: Event) => {
      event.preventDefault();
      // Add visual indication that this is a drop target
      panelContent.classList.add('drop-target');
    });
    
    panelContent.addEventListener('dragleave', () => {
      panelContent.classList.remove('drop-target');
    });
    
    panelContent.addEventListener('drop', (event: Event) => {
      event.preventDefault();
      panelContent.classList.remove('drop-target');
      
      const dragEvent = event as DragEventWithDataTransfer;
      if (dragEvent.dataTransfer) {
        const sourceFileId = dragEvent.dataTransfer.getData('text/plain');
        const sourceFile = mockFiles.value.find(file => file.id === sourceFileId);
        
        if (sourceFile && index < activePanels.value.length) {
          const targetPath = activePanels.value[index].path;
          
          // Prevent dropping a folder into its own subfolder
          if (sourceFile.type === 'folder' && targetPath.startsWith(sourceFile.path)) {
            alert("Cannot move a folder into its own subfolder");
            return;
          }
          
          // Move to the panel's path
          moveItem(sourceFile, targetPath);
        }
      }
    });
  });
}

// Watch for panel changes to re-initialize drop listeners
watch(activePanels, () => {
  // Use setTimeout to ensure DOM is updated before adding listeners
  setTimeout(() => {
    addPanelDropListeners();
  }, 100);
});

// Watch for panel changes to re-initialize drop listeners
watch(activePanels, () => {
  // Use setTimeout to ensure DOM is updated before adding listeners
  setTimeout(() => {
    addPanelDropListeners();
  }, 100);
});

function moveItem(file: FileItem, targetFolderPath: string) {
  // Find the file in mockFiles
  const fileIndex = mockFiles.value.findIndex(f => f.id === file.id);
  if (fileIndex !== -1) {
    const oldPath = file.path;
    const isFolder = file.type === 'folder';
    
    // Update the file's parent path
    mockFiles.value[fileIndex].parentPath = targetFolderPath;
    
    // Update the file's path
    if (isFolder) {
      mockFiles.value[fileIndex].path = `${targetFolderPath}${file.name}/`;
    } else {
      mockFiles.value[fileIndex].path = `${targetFolderPath}${file.name}`;
    }
    
    // If it's a folder, update all child items' paths
    if (isFolder) {
      mockFiles.value.forEach(item => {
        if (item.path.startsWith(oldPath) && item.id !== file.id) {
          item.path = item.path.replace(oldPath, mockFiles.value[fileIndex].path);
          if (item.parentPath) {
            item.parentPath = item.parentPath.replace(oldPath, mockFiles.value[fileIndex].path);
          }
        }
      });
    }
    
    // Refresh all panels to reflect the changes
    refreshAllPanels();
  }
}

// Helper function to refresh the current panel
function refreshCurrentPanel() {
  // Find the last panel (current folder)
  if (activePanels.value.length > 0) {
    const currentPanel = activePanels.value[activePanels.value.length - 1];
    currentPanel.files = getFilesForPath(currentPanel.path);
  }
}

// Helper function to refresh all panels
function refreshAllPanels() {
  activePanels.value.forEach(panel => {
    panel.files = getFilesForPath(panel.path);
  });
}

// File selection handling is managed elsewhere

// Initialize
onMounted(() => {
  fileStore.setCurrentPath('');
  fileStore.fetchFiles();
  
  // Setup panel drop listeners for drag and drop between panels
  setTimeout(() => {
    addPanelDropListeners();
  }, 500);
});
</script>

<style scoped>
/* Main container */
.explorer-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Drag and drop styles */
.file-item.dragging {
  opacity: 0.5;
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.panel-content.drop-target {
  background-color: rgba(0, 123, 255, 0.1);
  border: 2px dashed #007bff;
}

.list-item[draggable="true"] {
  cursor: grab;
}

/* Add button styles */
.add-button {
  margin-left: 10px;
  background-color: #e0e0e0 !important;
  border: none !important;
  color: #666 !important;
  height: 32px;
  width: 32px !important;
  padding: 0 !important;
  border-radius: 50% !important;
}

/* Add dialog styles */
.add-dialog-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

:deep(.p-dialog) {
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.p-dialog-header) {
  background-color: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
  padding: 16px 20px;
}

:deep(.p-dialog-footer) {
  background-color: #f5f5f5;
  border-top: 1px solid #eaeaea;
  padding: 16px 20px;
}

/* Finder toolbar */
.finder-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e9e9e9;
  border-bottom: 1px solid #d1d1d1;
  padding: 8px 16px;
  height: 40px;
}

.navigation-controls {
  display: flex;
  align-items: center;
}

.nav-button {
  width: 28px !important;
  height: 28px !important;
  color: #666 !important;
  background-color: #e0e0e0 !important;
  border: none !important;
  margin-right: 8px !important;
}

.folder-title {
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
}



.search-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 6px;
  padding: 4px 10px;
  width: 200px;
}

.search-icon {
  color: #666;
  font-size: 14px;
  margin-right: 6px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 100%;
}

.view-controls {
  display: flex;
  align-items: center;
}

.view-button {
  width: 28px !important;
  height: 28px !important;
  color: #666 !important;
  background-color: transparent !important;
  border: none !important;
}

.view-button.active {
  background-color: #d1d1d1 !important;
  border-radius: 4px;
}

/* Main container */
.finder-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: white;
  border-radius: 12px;
  margin: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Sidebar */
.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  border-right: 1px solid #d1d1d1;
  overflow-y: auto;
  padding-top: 16px;
}

.sidebar-items {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  position: relative;
  font-size: 13px;
}

.sidebar-item:hover {
  background-color: #e5e5e5;
}

.sidebar-item.active {
  background-color: #d8d8d8;
  color: #333;
}

.sidebar-icon {
  margin-right: 8px;
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: #666;
}

.sidebar-label {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-icon {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

/* Content area */
.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* New panel-based layout */
.panels-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
  position: relative;
}

.folder-panel {
  min-width: 250px;
  max-width: 300px;
  height: 100%;
  border-right: 1px solid #d1d1d1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 8px 12px;
  background-color: #e9e9e9;
  border-bottom: 1px solid #d1d1d1;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.file-item:hover {
  background-color: #e5e5e5;
}

.file-item.selected {
  background-color: #d8d8d8;
}

.file-icon {
  font-size: 16px;
  color: #666;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-arrow {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* File Details Panel Styles */
.file-details-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: auto;
  background-color: #ffffff;
  border-left: 1px solid #d1d1d1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
}

.file-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.file-details-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-button {
  padding: 0;
  margin: 0;
}

.file-details-content {
  padding: 20px;
  overflow-y: auto;
}

.file-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.file-icon-large {
  font-size: 48px;
  color: #5f6368;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  word-break: break-word;
}

/* Drag and drop styles */
.dragging {
  opacity: 0.5;
  border: 2px dashed #007bff;
}

.drop-target {
  background-color: rgba(0, 123, 255, 0.1);
  border: 2px dashed #007bff;
}

.file-item.over {
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .finder-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #d1d1d1;
  }
  
  .content-area {
    flex-direction: column;
  }
  
  .panels-container {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }
  
  .folder-panel {
    min-width: 100%;
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid #d1d1d1;
  }
}
</style>