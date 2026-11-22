import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import net from 'node:net';
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function checkPort(port: number, host = '127.0.0.1', timeout = 600): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function firebaseEmulatorPlugin(): Plugin {
  let emulatorProcess: ChildProcess | null = null;

  return {
    name: 'firebase-emulators',
    apply: 'serve',
    async configureServer(server) {
      const authPort = 9099;
      const firestorePort = 8080;
      const [authRunning, firestoreRunning] = await Promise.all([
        checkPort(authPort),
        checkPort(firestorePort),
      ]);

      if (authRunning && firestoreRunning) {
        console.log(
          `\n\x1b[32m[ViDo Emulators]\x1b[0m Auth :${authPort} and Firestore :${firestorePort} are active.\n`
        );
        return;
      }

      console.log(
        `\n\x1b[33m[ViDo Emulators]\x1b[0m Checking local Firebase emulator ports...\n`
      );

      // Check if Java is available
      let hasJava = false;
      try {
        execSync('java -version', { stdio: 'ignore' });
        hasJava = true;
      } catch {
        hasJava = false;
      }

      if (!hasJava) {
        console.warn(
          `\x1b[31m[ViDo Emulators]\x1b[0m Java 11+ is required for the Firebase emulators.\n` +
            `           Install Java or run "npm run emu" in a separate terminal.\n`
        );
        return;
      }

      // Check for firebase CLI (global or local)
      let firebaseCmd = 'firebase';
      try {
        execSync('firebase --version', { stdio: 'ignore' });
      } catch {
        firebaseCmd = 'npx firebase';
      }

      const only = [
        !authRunning ? 'auth' : null,
        !firestoreRunning ? 'firestore' : null,
      ]
        .filter(Boolean)
        .join(',');

      console.log(
        `\x1b[36m[ViDo Emulators]\x1b[0m Starting missing emulator(s): ${only}...\n`
      );

      const [cmd, ...args] = firebaseCmd.split(' ');
      const fullArgs = [
        ...args,
        'emulators:start',
        '--only',
        only,
        '--project',
        'demo-vido',
      ];

      emulatorProcess = spawn(cmd, fullArgs, {
        shell: true,
        stdio: 'inherit',
      });

      emulatorProcess.on('error', (err) => {
        console.warn(
          `\x1b[31m[ViDo Emulators]\x1b[0m Failed to spawn Firebase emulator:`,
          err.message
        );
      });

      // Poll until both required ports are listening (up to 15 seconds)
      const maxAttempts = 30;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((res) => setTimeout(res, 500));
        const ready = await Promise.all([
          checkPort(authPort),
          checkPort(firestorePort),
        ]);
        if (ready.every(Boolean)) {
          console.log(
            `\n\x1b[32m[ViDo Emulators]\x1b[0m ✓ Auth :${authPort} and Firestore :${firestorePort} are ready.\n`
          );
          break;
        }
      }

      const cleanup = () => {
        if (emulatorProcess && !emulatorProcess.killed) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /pid ${emulatorProcess.pid} /T /F`, {
                stdio: 'ignore',
              });
            } else {
              emulatorProcess.kill('SIGTERM');
            }
          } catch {
            // Ignore if already terminated
          }
          emulatorProcess = null;
        }
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      server.httpServer?.on('close', cleanup);
    },
  };
}

function localTeamSyncPlugin(): Plugin {
  const storeFilePath = path.resolve(process.cwd(), '.vido-local-dev-store.json');
  let clients: Array<(data: string) => void> = [];

  const defaultStore = {
    teams: [
      {
        id: 'team-alpha-launch',
        name: 'Alpha Launch',
        description: 'Delivering the next-generation task workspace for high-focus teams',
        leadId: 'sarah-chen-uid',
        leadEmail: 'sarah@vido.app',
        createdAt: '2026-11-01T09:00:00Z',
        members: [
          {
            userId: 'sarah-chen-uid',
            email: 'sarah@vido.app',
            name: 'Sarah Chen',
            role: 'lead',
            joinedAt: '2026-11-01T09:00:00Z',
          },
          {
            userId: 'demo-user-uid',
            email: 'demo@vido.app',
            name: 'Demo User',
            role: 'member',
            joinedAt: '2026-11-02T10:00:00Z',
          },
          {
            userId: 'marcus-vance-uid',
            email: 'marcus@vido.app',
            name: 'Marcus Vance',
            role: 'member',
            joinedAt: '2026-11-05T14:30:00Z',
          },
        ],
      },
    ],
    invitations: [
      {
        id: 'invite-sample-1',
        teamId: 'team-alpha-launch',
        teamName: 'Alpha Launch',
        inviterId: 'sarah-chen-uid',
        inviterName: 'Sarah Chen',
        inviterEmail: 'sarah@vido.app',
        inviteeEmail: 'alex@vido.app',
        status: 'pending',
        createdAt: '2026-11-18T10:00:00Z',
      },
    ],
    milestones: [
      {
        id: 'milestone-phase-1',
        teamId: 'team-alpha-launch',
        title: 'Phase 1: Foundation & Specs',
        targetDate: '2026-11-15',
        status: 'completed',
        orderIndex: 1,
        createdAt: '2026-11-01T09:30:00Z',
      },
      {
        id: 'milestone-phase-2',
        teamId: 'team-alpha-launch',
        title: 'Phase 2: Core Build & Collaboration',
        targetDate: '2026-11-30',
        status: 'active',
        orderIndex: 2,
        createdAt: '2026-11-01T09:35:00Z',
      },
      {
        id: 'milestone-phase-3',
        teamId: 'team-alpha-launch',
        title: 'Phase 3: Public Release',
        targetDate: '2026-12-15',
        status: 'upcoming',
        orderIndex: 3,
        createdAt: '2026-11-01T09:40:00Z',
      },
    ],
    tasks: [
      {
        id: 'task-auth-architecture',
        teamId: 'team-alpha-launch',
        milestoneId: 'milestone-phase-1',
        title: 'Design Google OAuth identity flow',
        description: 'Ensure token storage complies with minimal privilege principles',
        deadline: '2026-11-15T18:00:00Z',
        priority: 'high',
        status: 'completed',
        progress: 100,
        assigneeId: 'sarah-chen-uid',
        assigneeName: 'Sarah Chen',
        assigneeEmail: 'sarah@vido.app',
        leadId: 'sarah-chen-uid',
        checkpoints: [
          {
            id: 'cp-1',
            authorId: 'sarah-chen-uid',
            authorName: 'Sarah Chen',
            timestamp: '2026-11-15T17:30:00Z',
            progress: 100,
            note: 'Completed architecture review and security invariants',
          },
        ],
        createdAt: '2026-11-02T10:00:00Z',
        completedAt: '2026-11-15T17:30:00Z',
      },
      {
        id: 'task-team-ui',
        teamId: 'team-alpha-launch',
        milestoneId: 'milestone-phase-2',
        title: 'Build Team Space dashboard and milestone roadmap',
        description: 'Render shared views with lead assignment and progress updating',
        deadline: '2026-11-28T18:00:00Z',
        priority: 'high',
        status: 'active',
        progress: 60,
        assigneeId: 'demo-user-uid',
        assigneeName: 'Demo User',
        assigneeEmail: 'demo@vido.app',
        leadId: 'sarah-chen-uid',
        checkpoints: [
          {
            id: 'cp-2',
            authorId: 'demo-user-uid',
            authorName: 'Demo User',
            timestamp: '2026-11-18T12:00:00Z',
            progress: 60,
            note: 'Completed MockTeamRepository and notification bell component',
          },
        ],
        createdAt: '2026-11-16T09:00:00Z',
      },
      {
        id: 'task-docs',
        teamId: 'team-alpha-launch',
        milestoneId: 'milestone-phase-2',
        title: 'Document team invitations and testing workflow',
        description: 'Provide quickstart guidance in project README',
        deadline: '2026-11-30T18:00:00Z',
        priority: 'medium',
        status: 'active',
        progress: 0,
        assigneeId: 'marcus-vance-uid',
        assigneeName: 'Marcus Vance',
        assigneeEmail: 'marcus@vido.app',
        leadId: 'sarah-chen-uid',
        checkpoints: [],
        createdAt: '2026-11-17T11:00:00Z',
      },
    ],
  };

  const loadData = () => {
    try {
      if (fs.existsSync(storeFilePath)) {
        const fileContent = fs.readFileSync(storeFilePath, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch {
      // ignore
    }
    return defaultStore;
  };

  const saveData = (data: any) => {
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  };

  return {
    name: 'local-team-sync',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/local-dev-teams/stream') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          const send = (data: string) => {
            try {
              res.write(`data: ${data}\n\n`);
            } catch {
              // ignore
            }
          };
          clients.push(send);
          const current = loadData();
          send(JSON.stringify(current));

          req.on('close', () => {
            clients = clients.filter((c) => c !== send);
          });
          return;
        }

        if (url === '/api/local-dev-teams' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(loadData()));
          return;
        }

        if (url === '/api/local-dev-teams' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const incoming = JSON.parse(body);
              const current = loadData();
              const merged = {
                teams: incoming.teams ?? current.teams,
                invitations: incoming.invitations ?? current.invitations,
                milestones: incoming.milestones ?? current.milestones,
                tasks: incoming.tasks ?? current.tasks,
              };
              saveData(merged);
              const payload = JSON.stringify(merged);
              clients.forEach((send) => send(payload));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), firebaseEmulatorPlugin(), localTeamSyncPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url?.startsWith('/api/local-dev-teams')) {
            return req.url;
          }
          return undefined;
        },
      },
    },
  },
});
