const express = require('express');
const router = express.Router();

let mockReports = [];
let mockSocialMedia = [
  { id: 1, text: 'Huge waves at RK Beach!', sentiment: 'negative', location: { lat: 17.6868, lng: 83.2185 }, timestamp: new Date() }
];

router.post('/report', (req, res) => {
  const newReport = { id: Date.now(), ...req.body, timestamp: new Date() };
  mockReports.push(newReport);
  res.json({ success: true, message: 'Report saved', report: newReport });
});

router.get('/reports', (req, res) => {
  res.json(mockReports);
});

router.get('/social-reports', (req, res) => {
  res.json(mockSocialMedia);
});

module.exports = router;
