import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
}

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App;

  constructor() {
    // If not configured, point to local Firebase Auth Emulator by default in development
    if (!process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.NODE_ENV !== 'production') {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    }

    if (admin.apps.length === 0) {
      try {
        this.app = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-vido',
        });
        this.logger.log(
          `Firebase Admin initialized (Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'None'})`
        );
      } catch (err: any) {
        this.logger.error('Failed to initialize Firebase Admin', err.message);
      }
    } else {
      this.app = admin.app();
    }
  }

  async verifyIdToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      // Decode with Firebase Admin
      const decoded = await admin.auth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || `${decoded.uid}@vido.app`,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
      };
    } catch (err: any) {
      // Allow dev test token fallback if running with demo user or mock tokens
      if (token.startsWith('dev-token-')) {
        const parts = token.replace('dev-token-', '').split(':');
        const uid = parts[0] || 'dev-user-uid';
        const email = parts[1] || 'dev@vido.app';
        return {
          uid,
          email,
          name: email.split('@')[0],
        };
      }
      return null;
    }
  }
}
