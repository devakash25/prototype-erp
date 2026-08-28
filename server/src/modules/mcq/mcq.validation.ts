import { z } from 'zod';

const questionSchema = z.object({
  question: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  marks: z.number().int().min(1).default(1),
});

export const createTestSchema = z.object({
  body: z.object({
    classId: z.string(),
    subjectId: z.string(),
    title: z.string().min(1),
    chapter: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().int().min(1),
    startTime: z.string(),
    endTime: z.string(),
    allowReattempt: z.boolean().optional().default(false),
    randomizeQuestions: z.boolean().optional().default(false),
    randomizeOptions: z.boolean().optional().default(false),
    questions: z.array(questionSchema).min(1),
  }),
});

export const submitTestSchema = z.object({
  body: z.object({
    testId: z.string(),
    answers: z.array(
      z.object({
        questionId: z.string(),
        selectedOption: z.enum(['A', 'B', 'C', 'D']),
      })
    ),
    timeTaken: z.number().int().min(0).optional(),
  }),
});
