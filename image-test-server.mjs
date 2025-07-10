import Koa from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const router = new Router();

// Sample static image path - adjust this to your actual image directory
const IMAGES_DIR = path.join(__dirname, 'image-test-images');

// Ensure images directory exists
try {
  await fs.access(IMAGES_DIR);
} catch {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  console.log(`Created images directory at: ${IMAGES_DIR}`);
}

// Route 2: /:uuid/image.json - Returns JSON metadata
router.get('/:uuid/image.json', async (ctx) => {
  const { uuid } = ctx.params;
    
  // Sample JSON response - customize based on your needs
  const metadata = {
      "id": "random id",
      "description": "abc",
      "attribution": "<a href=\"https://www.maptiler.com/engine/\">Rendered with MapTiler Engine</a>",
      "width": 512 * 10,
      "height": 512 * 10,
      "minzoom": 0,
      "maxzoom": 18,
      "tileSize": 512
  };
  
  ctx.type = 'application/json';
  ctx.body = metadata;
});

router.get('/kill', async (ctx) => {
  process.exit(0);
});

// Route 1: /:uuid/:z/:x/:y - Returns a static image
router.get('/:uuid/:z/:x/:y', async (ctx) => {
  const { uuid, z, x, y } = ctx.params;

  console.log(`Image request: UUID=${uuid}, Z=${z}, X=${x}, Y=${y}`);
  
  // You can customize the image selection logic here
  // For now, we'll serve a default test image or generate one based on params
  const imagePath = path.join(IMAGES_DIR, `image.png`);
  
  try {

    const imageBuffer = await fs.readFile(imagePath);
    
    ctx.type = 'image/png';
    ctx.body = imageBuffer;
    
    // Optional: Add tile-specific headers
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Cache-Control', 'public, max-age=3600');
    ctx.set('X-Tile-UUID', uuid);
    ctx.set('X-Tile-Coordinates', `${z}/${x}/${y}`);
    
  } catch (error) {
    console.error('Error serving image:', error);
    ctx.status = 404;
    ctx.body = { error: 'Image not found' };
  }
});

app.use(cors({
  origin: 'http://localhost:5173', // <--- IMPORTANT: Match your frontend's URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
  allowHeaders: ['Content-Type', 'Authorization'], // Allow common headers, add if you use custom ones
  // credentials: true, // Set to true if you need to send cookies or HTTP auth headers
}));

// Logging middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

const PORT = process.env.PORT || 4321;

app.listen(PORT, () => {
  console.log(`🚀 Image test server running on http://localhost:${PORT}`);
  console.log(`📸 Image tiles available at: /:uuid/:z/:x/:y`);
  console.log(`📋 JSON metadata available at: /:uuid/image.json`);
  console.log(`🏥 Health check available at: /health`);
  console.log(`📁 Images directory: ${IMAGES_DIR}`);
});

export default app;
