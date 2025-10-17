import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth, type AuthType, prisma } from './lib/auth.js';

const PORT = process.env.PORT || 3001;

const app = new Hono<{ Bindings: AuthType }>({
  strict: true,
});

app.use(
  '/*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.on(['POST', 'GET', 'OPTIONS'], '/api/auth/*', (c) => {
  console.log(c.req.raw.url);
  return auth.handler(c.req.raw);
});

// Get all users (admin only)
app.get('/api/users', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if user has admin role
  if (session.user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: Number(3001),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
