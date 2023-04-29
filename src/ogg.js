import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from './utils';

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMP3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`);
      return new Promise((rlv, rej) => {
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(input);
            rlv(outputPath);
          })
          .on('error', (err) => rej(err.message))
          .run();
      });
    } catch (e) {
      console.log('Error while creating mp3', e.message);
    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      return new Promise((rlv) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on('finish', () => rlv(oggPath));
      });
    } catch (e) {
      console.log('Error while vioce message', e.message);
    }
  }
}

const ogg = new OggConverter();
export default ogg;
