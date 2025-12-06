import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { pool } from '../config/database.js';
import { extractText } from '../services/ocr.service.js';
import { analyzeDocument, detectRisks, checkCompliance } from '../services/ai.service.js';
import { logAudit } from '../middleware/auth.js';

export async function uploadDocument(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO documents (filename, original_name, file_type, file_size, uploaded_by, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.user!.id, 'processing']
    );

    const docId = result.rows[0].id;
    await logAudit(req.user!.id, 'upload', 'document', docId, { filename: req.file.originalname });

    processDocument(docId, req.file.path, req.file.mimetype, req.user!.role);

    res.json({ id: docId, status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
}

async function processDocument(docId: number, filePath: string, fileType: string, userRole: string) {
  try {
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['ocr', docId]);
    const text = await extractText(filePath, fileType);

    await pool.query('UPDATE documents SET status = $1, ocr_text = $2 WHERE id = $3', ['analyzing', text, docId]);
    const summary = await analyzeDocument(text, userRole);
    const risks = await detectRisks(text);
    const compliance = await checkCompliance(text);

    await pool.query(
      'UPDATE documents SET status = $1, ai_summary = $2, metadata = $3 WHERE id = $4',
      ['complete', summary, JSON.stringify({ risks, compliance }), docId]
    );

    await pool.query(
      'INSERT INTO document_versions (document_id, version, content) VALUES ($1, 1, $2)',
      [docId, text]
    );
  } catch (error) {
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['error', docId]);
  }
}

export async function getDocument(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' });
  }

  await logAudit(req.user!.id, 'view', 'document', parseInt(id));
  res.json(result.rows[0]);
}

export async function getDocuments(req: AuthRequest, res: Response) {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM documents';
  const params: any[] = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  res.json(result.rows);
}

export async function updateDocument(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { content, commitMessage } = req.body;

  const doc = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
  if (doc.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const versions = await pool.query('SELECT MAX(version) as max_version FROM document_versions WHERE document_id = $1', [id]);
  const newVersion = (versions.rows[0].max_version || 0) + 1;

  await pool.query(
    'INSERT INTO document_versions (document_id, version, content, changed_by, commit_message) VALUES ($1, $2, $3, $4, $5)',
    [id, newVersion, content, req.user!.id, commitMessage]
  );

  await pool.query('UPDATE documents SET ocr_text = $1, updated_at = NOW() WHERE id = $2', [content, id]);
  await logAudit(req.user!.id, 'edit', 'document', parseInt(id), { version: newVersion });

  res.json({ version: newVersion });
}

export async function revertDocument(req: AuthRequest, res: Response) {
  const { id, version } = req.params;

  const versionData = await pool.query(
    'SELECT content FROM document_versions WHERE document_id = $1 AND version = $2',
    [id, version]
  );

  if (versionData.rows.length === 0) {
    return res.status(404).json({ error: 'Version not found' });
  }

  await pool.query('UPDATE documents SET ocr_text = $1, updated_at = NOW() WHERE id = $2', [versionData.rows[0].content, id]);
  await logAudit(req.user!.id, 'revert', 'document', parseInt(id), { toVersion: version });

  res.json({ success: true });
}
