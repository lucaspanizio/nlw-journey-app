import { z } from 'zod';

const updateTrip = z.object({
  when: z.string().trim().min(10, { message: 'Campo obrigatório' }),
  where: z.string().trim().min(1, { message: 'Campo obrigatório' }),
  description: z.string().optional(),
});

const createActivity = z.object({
  description: z.string().trim().min(1, { message: 'Campo obrigatório' }),
  date: z.string().trim().min(1, { message: 'Campo obrigatório' }),
  hour: z.string().min(1, { message: 'Campo obrigatório' }),
});

const createLink = z.object({
  title: z
    .string()
    .trim()
    .min(6, { message: 'O título deve ter no mínimo 6 caracteres' }),
  url: z.string().url({ message: 'URL inválida' }),
});

export const schema = {
  updateTrip,
  createActivity,
  createLink,
};
