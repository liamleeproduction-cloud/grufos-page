import { PNG } from 'pngjs';
import fs from 'fs';

const [, , outputFile, r, g, b] = process.argv;

const width = 1200;
const height = 800;

const png = new PNG({ width, height });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    png.data[idx] = r || 128; // red
    png.data[idx + 1] = g || 128; // green
    png.data[idx + 2] = b || 128; // blue
    png.data[idx + 3] = 255; // alpha
  }
}

png.pack().pipe(fs.createWriteStream(outputFile || 'public/images/placeholder.png'));
