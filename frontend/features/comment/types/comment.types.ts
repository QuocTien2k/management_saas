export interface CommentUser {
  id: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: CommentUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}
