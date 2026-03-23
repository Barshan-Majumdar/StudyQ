import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const messages = result.error.issues.map((i) => i.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
  };
}
