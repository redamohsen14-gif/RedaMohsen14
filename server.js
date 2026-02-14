const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

const root = path.resolve(__dirname);
const uploadsDir = path.join(root, 'uploads');
const productsDir = path.join(uploadsDir, 'products');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
const tempDir = path.join(uploadsDir, 'temp');
const logsDir = path.join(root, 'logs');

[uploadsDir, productsDir, thumbnailsDir, tempDir, logsDir].forEach(dir => {
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
});

// Logger
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Serve uploaded files statically (optional)
app.use('/uploads', express.static(uploadsDir));

// Health endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Multer config
const upload = multer({ dest: tempDir, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (form field: image)' });

  const origName = req.file.originalname || 'file';
  const safeName = `${Date.now()}-${origName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const tempPath = req.file.path;
  const productPath = path.join(productsDir, safeName);
  const thumbPath = path.join(thumbnailsDir, safeName);

  try {
    // Move original into products
    fs.renameSync(tempPath, productPath);

    // Create thumbnail (max 800x800 for product copy, and a square thumbnail 300x300)
    await sharp(productPath)
      .resize({ width: 1200, height: 1200, fit: 'inside' })
      .toFile(productPath + '.tmp')
      .then(() => {
        fs.renameSync(productPath + '.tmp', productPath);
      })
      .catch(() => {});

    await sharp(productPath)
      .resize(300, 300, { fit: 'cover' })
      .toFile(thumbPath);

    return res.json({ ok: true, product: `/uploads/products/${safeName}`, thumbnail: `/uploads/thumbnails/${safeName}` });
  } catch (err) {
    // Cleanup temp file if still exists
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) {}
    console.error(err);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

app.get('/', (req, res) => res.send('Al-Shalawi Backend running'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
