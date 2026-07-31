import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên workspace phải có ít nhất 2 ký tự')
    .max(50, 'Tên workspace tối đa 50 ký tự'),
  description: z.string().max(200, 'Mô tả tối đa 200 ký tự').optional(),
  logo: z.string().url('Logo URL không hợp lệ').or(z.literal('')).optional(),
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type UpdateWorkspaceFormValues = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['ADMIN', 'MEMBER'], {
    message: 'Vui lòng chọn vai trò',
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
