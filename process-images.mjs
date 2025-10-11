import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = 'public/images';
const outputDir = 'public/images/processed';

const sizes = [320, 640, 1024];

async function processImages() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const files = await fs.readdir(inputDir);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const stat = await fs.stat(inputPath);
      if (stat.isDirectory()) continue;

      if (file.endsWith('.svg') || file.endsWith('.raw')) continue;
      const ext = path.extname(file);
      const name = path.basename(file, ext);

      const buffer = await fs.readFile(inputPath);

      for (const size of sizes) {
        const outputPath = path.join(outputDir, `${name}-${size}.webp`);
        await sharp(buffer)
          .resize(size)
          .toFormat('webp')
          .toFile(outputPath);
      }
    }
    console.log('Images processed successfully!');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

processImages();
