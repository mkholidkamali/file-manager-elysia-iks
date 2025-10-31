/**
 * File and folder related types
 */

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  path: string;
  parentPath?: string;
  expanded?: boolean;
  children?: FileItem[];
  parent?: string;
  cloudStatus?: string;
}