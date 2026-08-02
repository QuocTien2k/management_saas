export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAssignee {
  id: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

export interface MemberOption {
  id: string;
  fullname?: string | null;
  email?: string;
  avatar?: string | null;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedById?: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  position: number;
  projectId: string;
  assigneeId?: string | null;
  assignee?: TaskAssignee | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: TaskAttachment[];
  _count?: {
    comments?: number;
    attachments?: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface MoveTaskInput {
  columnId: string;
  position: number;
}

export interface TaskFilters {
  search?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}
