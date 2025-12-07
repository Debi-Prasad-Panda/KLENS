import { Router } from 'express';

const router = Router();

// Mock endpoint for graph extraction (Python service would handle actual extraction)
router.post('/extract', async (req, res) => {
  try {
    const { text, documentName } = req.body;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock extracted graph data
    const mockGraph = {
      nodes: [
        { id: documentName?.replace(/\s+/g, '_') || 'New_Document', group: 'Document', val: 8 },
        { id: 'Cafeteria', group: 'Machine', val: 6 },
        { id: 'Maintenance_Staff', group: 'Person', val: 7 },
        { id: 'Closure_Notice', group: 'Risk', val: 5 }
      ],
      links: [
        { source: documentName?.replace(/\s+/g, '_') || 'New_Document', target: 'Cafeteria', type: 'MENTIONS' },
        { source: 'Cafeteria', target: 'Closure_Notice', type: 'HAS_STATUS' },
        { source: 'Closure_Notice', target: 'Maintenance_Staff', type: 'AFFECTS' }
      ]
    };

    res.json({ success: true, graph: mockGraph });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Graph extraction failed' });
  }
});

export default router;
