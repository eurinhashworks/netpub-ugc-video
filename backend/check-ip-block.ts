import { AuthService } from './lib/auth.js';

// Access the private failedAttempts map via reflection
const failedAttempts = (AuthService as any).failedAttempts;


if (failedAttempts.size === 0) {
} else {
  failedAttempts.forEach((value: any, key: string) => {
    const now = Date.now();
    const isBlocked = value.blockedUntil > now;
    if (isBlocked) {
      const remainingMs = value.blockedUntil - now;
    }
  });
}
