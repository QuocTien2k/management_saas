export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAssignee {
  id: string;
  fullname: string;
  email: string;
  avatar?: string | null;
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
  _count?: {
    comments?: number;
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
  columnId: TaskStatus; // new status/column
  newPosition: number;
}

export interface TaskFilters {
  search?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}
