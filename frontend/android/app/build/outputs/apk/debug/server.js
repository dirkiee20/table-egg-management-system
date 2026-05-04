const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const APK_FILE = path.join(__dirname, 'app-debug.apk');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/download', (req, res) => {
  if (!fs.existsSync(APK_FILE)) {
    return res.status(404).send('APK not found.');
  }
  res.download(APK_FILE, 'TableEggApp.apk');
});

app.get('/info', (req, res) => {
  const exists = fs.existsSync(APK_FILE);
  if (!exists) return res.json({ available: false });
  const stats = fs.statSync(APK_FILE);
  res.json({
    available: true,
    size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
    modified: stats.mtime
  });
});

app.listen(PORT, () => {
  console.log(`Table Egg APK server running on port ${PORT}`);
});
