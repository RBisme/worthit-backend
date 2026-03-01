import express from 'express';
import { executeListing } from '../../services/listing/executeListing.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const result = await executeListing(req.body);
    res.json({ status: 'OK', results: result });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

export default router;
