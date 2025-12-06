import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool, redis } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response) {
  const { email, password, name, role, department } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, department',
    [email, passwordHash, name, role, department]
  );

  res.status(201).json(result.rows[0]);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '30m' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    }
  });
}

export async function grantCinderellaAccess(req: AuthRequest, res: Response) {
  const { userId, durationMinutes } = req.body;

  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can grant Cinderella access' });
  }

  const expiresAt = new Date(Date.now() + durationMinutes * 60000);
  
  await redis.set(
    `cinderella:${userId}`,
    JSON.stringify({ grantedBy: req.user!.id, expiresAt, permissions: ['delete', 'approve', 'override'] }),
    { EX: durationMinutes * 60 }
  );

  res.json({ userId, expiresAt });
}

export async function checkCinderellaAccess(req: AuthRequest, res: Response) {
  const access = await redis.get(`cinderella:${req.user!.id}`);
  
  if (!access) {
    return res.json({ hasAccess: false });
  }

  res.json({ hasAccess: true, ...JSON.parse(access) });
}
