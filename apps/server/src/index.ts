import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from 'fs';
import mime from 'mime-types';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videosDir = path.join(__dirname, '../videos');

/** Create video directory if not exist */
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;
const app = express();

/** Enable CORS middleware */
app.use(cors());

/** HTTP request logger middleware */
app.use(morgan('dev'));

/** Request JSON parser middleware */
app.use(express.json());

/** Endpoint to check server running */
app.get('/', (_, res: Response<string>) => {
  res.status(200).send('Oddbit Player server is running');
});

interface VideoQuery {
  page?: string;
}

interface VideoDetail {
  id: string;
}

interface VideoResponse {
  videos: VideoDetail[];
  videosPerPage: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Endpoint to list available videos */
app.get('/api/video', (req: Request<{}, {}, {}, VideoQuery>, res: Response<VideoResponse>) => {
  const VIDEOS_PER_PAGE = 9;
  const page = parseInt(req.query.page || '1', 10);

  const files = fs.readdirSync(videosDir);
  const videos = files
    .filter((file) => file !== '.gitignore')
    .map((file) => ({
      id: file.replace(/\.[^/.]+$/, ''),
    }));

  const totalItems = videos.length;
  const totalPages = Math.ceil(totalItems / VIDEOS_PER_PAGE);
  const startIndex = (page - 1) * VIDEOS_PER_PAGE;
  const endIndex = Math.min(startIndex + VIDEOS_PER_PAGE, totalItems);
  const items = videos.slice(startIndex, endIndex);

  const response: VideoResponse = {
    videos: items,
    videosPerPage: VIDEOS_PER_PAGE,
    total: totalItems,
    pages: totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  res.status(200).json(response);
});

interface StreamVideoParams {
  videoId: string;
}

/** Endpoint to stream video */
app.get('/api/video/:videoId', (req: Request<StreamVideoParams>, res: Response) => {
  const videoId = req.params.videoId;

  let videoPath = '';
  let contentType = '';

  const files = fs.readdirSync(videosDir);

  for (const file of files) {
    if (file.startsWith(videoId)) {
      videoPath = path.join(videosDir, file);
      contentType = mime.lookup(file) || 'video/mp4';
      break;
    }
  }

  if (!videoPath) {
    res.status(404).send('Video not found');
    return;
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const file = fs.createReadStream(videoPath);
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };

    res.writeHead(200, headers);
    file.pipe(res);
  }
});

/** Listening to the server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
