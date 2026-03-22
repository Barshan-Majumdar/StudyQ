import { z } from 'zod';

export const UploadMaterialSchema = z.object({
  title:       z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  subject:     z.string().min(1),
  semester:    z.coerce.number().int().min(1).max(8).optional(),
  academicYear: z.coerce.number().int().optional(),
  fileUrl:     z.string().url(),
  storageKey:  z.string().min(1),
  tags:        z.array(z.string()).optional(),
});

export const MaterialQuerySchema = z.object({
  subject:  z.string().optional(),
  semester: z.coerce.number().int().positive().optional(),
  search:   z.string().optional(),
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(50).default(20),
});

export type UploadMaterialDto = z.infer<typeof UploadMaterialSchema>;
export type MaterialQueryDto  = z.infer<typeof MaterialQuerySchema>;
