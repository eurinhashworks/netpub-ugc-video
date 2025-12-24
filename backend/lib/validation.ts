import { z } from 'zod';
import { UserInputError } from 'apollo-server-express';

// Schémas de validation avec Zod

const nonEmptyString = z.string().min(1, { message: 'Ce champ ne peut pas être vide.' });

export const validationSchemas = {
  sendContactMessage: z.object({
    name: nonEmptyString,
    email: z.string().email({ message: 'Adresse email invalide.' }),
    message: nonEmptyString,
    company: z.string().optional(),
    service: z.string().optional(),
  }),
};

// Middleware de validation

export const validationMiddleware = {
  Mutation: {
    sendContactMessage: async (resolve: any, root: any, args: any, context: any, info: any) => {
      try {
        validationSchemas.sendContactMessage.parse(args);
      } catch (e: any) {
        throw new UserInputError(e.issues.map((err: any) => err.message).join(', '));
      }
      return resolve(root, args, context, info);
    },
  },
};
