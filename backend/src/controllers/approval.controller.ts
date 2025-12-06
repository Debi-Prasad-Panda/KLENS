import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { pool } from '../config/database.js';

export async function createApproval(req: AuthRequest, res: Response) {
  const { actionType, resourceId, requiredApprovals = 2 } = req.body;

  const result = await pool.query(
    'INSERT INTO approvals (action_type, resource_id, required_approvals, approvers, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [actionType, resourceId, requiredApprovals, JSON.stringify([]), req.user!.id]
  );

  res.json({ id: result.rows[0].id, status: 'pending' });
}

export async function approveAction(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { decision } = req.body;

  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can approve' });
  }

  const approval = await pool.query('SELECT * FROM approvals WHERE id = $1', [id]);
  if (approval.rows.length === 0) {
    return res.status(404).json({ error: 'Approval not found' });
  }

  const approvers = approval.rows[0].approvers || [];
  
  if (approvers.find((a: any) => a.userId === req.user!.id)) {
    return res.status(400).json({ error: 'Already voted' });
  }

  approvers.push({ userId: req.user!.id, decision, timestamp: new Date() });

  const approvedCount = approvers.filter((a: any) => a.decision === 'approve').length;
  const status = approvedCount >= approval.rows[0].required_approvals ? 'approved' : 'pending';

  await pool.query(
    'UPDATE approvals SET approvers = $1, status = $2, completed_at = $3 WHERE id = $4',
    [JSON.stringify(approvers), status, status === 'approved' ? new Date() : null, id]
  );

  res.json({ status, approvedCount, requiredApprovals: approval.rows[0].required_approvals });
}

export async function getApprovals(req: AuthRequest, res: Response) {
  const result = await pool.query('SELECT * FROM approvals WHERE status = $1 ORDER BY created_at DESC', ['pending']);
  res.json(result.rows);
}
