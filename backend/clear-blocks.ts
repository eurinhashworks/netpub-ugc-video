import { AuthService } from './lib/auth.js';

// Clear all IP blocks
const failedAttempts = (AuthService as any).failedAttempts;
failedAttempts.clear();

