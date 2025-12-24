import './load-env.js'; // Must be first import
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv'; // Still needed if referenced, but config is done
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logs et diagnostics

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { prisma } from './lib/prisma.js';
import { MonitoringUtils, PerformanceUtils, SecurityUtils } from './lib/security.js';
import { handleError, formatGraphQLError } from './lib/errorHandler.js';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware as graphqlMiddleware } from 'graphql-middleware';
import { validationMiddleware } from './lib/validation.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import session from 'express-session';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

console.log('✅ Server starting...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔑 JWT Secret loaded:', !!process.env.JWT_SECRET);

// Logs et diagnostics

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
  }
}

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
  }
}

// Middleware avec logs
app.use(cors(SecurityUtils.getCorsConfig()));
app.use(helmet(SecurityUtils.getHelmetConfig()));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? null : SecurityUtils.generateSecureToken(32)), // Use a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: 'CSRF_DISABLED' }); // Return a dummy token since CSRF is disabled
});



// Middleware de logging des requêtes
app.use((req, res, next) => {
  const startTime = MonitoringUtils.startTimer(`Request ${req.method} ${req.path}`);
  const endTimer = startTime;

  res.on('finish', () => {
    const duration = endTimer();
    MonitoringUtils.trackApiCall(req.path, req.method, duration, res.statusCode);
  });

  next();
});

// Middleware de diagnostic de santé
app.get('/health', async (req, res) => {
  const memoryUsage = PerformanceUtils.getMemoryUsage();
  const dbHealth = await PerformanceUtils.checkDatabaseHealth();

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
    database: dbHealth ? 'Connected' : 'Disconnected'
  });
});

// GraphQL setup avec gestion d'erreurs améliorée et validation
const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = graphqlMiddleware(schema, validationMiddleware);

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  context: ({ req }: any) => ({
    prisma,
    req,
  }),
  formatError: formatGraphQLError,
  plugins: [
    {
      requestDidStart: async () => ({
        didEncounterErrors: async (requestContext) => {
          requestContext.errors?.forEach((error) => {
            MonitoringUtils.trackError(error as Error);
          });
        },
      }),
    },
  ],
});

async function startServer() {
  try {
    await server.start();

    // Configuration du limiteur de débit pour l'API GraphQL
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite chaque IP à 100 requêtes par `windowMs`
      message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer après 15 minutes.',
      standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
      legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
    });

    // Appliquer le limiteur de débit uniquement aux requêtes GraphQL
    app.use(server.graphqlPath, apiLimiter);

    server.applyMiddleware({ app } as any);

    // Vérification de la connexion à la base de données
    await prisma.$connect();

    app.listen(PORT, '0.0.0.0', () => {
    });
  } catch (error) {
    MonitoringUtils.trackError(error as Error);
    process.exit(1);
  }
}

// Gestion globale des erreurs non capturées
process.on('uncaughtException', (error) => {
  MonitoringUtils.trackError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  MonitoringUtils.trackError(new Error(`Unhandled Rejection: ${reason}`));
  process.exit(1);
});

startServer().catch((error) => {
  MonitoringUtils.trackError(error);
  process.exit(1);
});