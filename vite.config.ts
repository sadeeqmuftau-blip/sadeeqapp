import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'package-download-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/download/apk' || req.url === '/download/CryptoSignalRadar-v1.0.apk') {
              const filePath = path.resolve(__dirname, 'public/download/CryptoSignalRadar-v1.0.apk');
              if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Disposition': 'attachment; filename="CryptoSignalRadar-v1.0.apk"',
                  'Content-Length': stat.size,
                  'Cache-Control': 'no-cache'
                });
                return fs.createReadStream(filePath).pipe(res);
              }
            }

            if (req.url === '/api/download/aab' || req.url === '/download/CryptoSignalRadar-v1.0.aab') {
              const filePath = path.resolve(__dirname, 'public/download/CryptoSignalRadar-v1.0.aab');
              if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                res.writeHead(200, {
                  'Content-Type': 'application/octet-stream',
                  'Content-Disposition': 'attachment; filename="CryptoSignalRadar-v1.0.aab"',
                  'Content-Length': stat.size,
                  'Cache-Control': 'no-cache'
                });
                return fs.createReadStream(filePath).pipe(res);
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
