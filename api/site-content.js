/**
 * Vercel serverless function - public site content (read-only).
 * Returns the content committed in data/site-content.json.
 * The frontend also has a localStorage fallback if this endpoint is unavailable.
 */
const content = require('../data/site-content.json');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json(content);
};
