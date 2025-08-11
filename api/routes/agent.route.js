import express from 'express';
import {
  getAllAgents,
  getSingleAgent,
  getAgentsByType,
} from '../controllers/agent.controller.js';

const router = express.Router();

// Anti-crawling middleware
const antiCrawlingMiddleware = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const suspiciousAgents = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'scrape',
    'curl',
    'wget',
    'python',
    'requests',
    'scrapy',
  ];

  const isSuspicious = suspiciousAgents.some((agent) =>
    userAgent.toLowerCase().includes(agent)
  );

  if (isSuspicious) {
    return res.status(403).json({
      message: 'Access denied. This content is protected.',
    });
  }

  // Rate limiting check (basic)
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!req.app.locals.requestTracker) {
    req.app.locals.requestTracker = new Map();
  }

  const tracker = req.app.locals.requestTracker;
  const requests = tracker.get(clientIp) || [];

  // Remove requests older than 1 minute
  const recentRequests = requests.filter((time) => now - time < 60000);

  // If more than 30 requests in 1 minute, block
  if (recentRequests.length > 30) {
    return res.status(429).json({
      message: 'Too many requests. Please slow down.',
    });
  }

  recentRequests.push(now);
  tracker.set(clientIp, recentRequests);

  next();
};

// Apply anti-crawling to all routes
router.use(antiCrawlingMiddleware);

router.get('/', getAllAgents);
router.get('/type/:type', getAgentsByType);
router.get('/:slugOrId', getSingleAgent);

export default router;
