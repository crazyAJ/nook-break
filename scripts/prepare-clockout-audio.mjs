import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'audio');
const oggOut = path.join(outDir, 'clockout-theme.ogg');
const mp3Out = path.join(outDir, 'clockout-theme.mp3');
const ffmpegBin = process.env.FFMPEG_BIN || 'ffmpeg';
const source = process.env.CLOCKOUT_THEME_SOURCE;
const hasPreparedAssets = existsSync(oggOut) && existsSync(mp3Out);

mkdirSync(outDir, {recursive: true});

if (!source) {
  if (hasPreparedAssets) {
    console.log('Using existing prepared clock-out audio assets.');
    process.exit(0);
  }

  console.error(
    'Missing clock-out source audio. Set CLOCKOUT_THEME_SOURCE to the source file path before running audio:prepare.',
  );
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`Missing source audio: ${source}`);
  console.error(
    'Set CLOCKOUT_THEME_SOURCE to an existing source file path, or keep both prepared assets in public/audio/.',
  );
  process.exit(1);
}

const runs = [
  [
    '-y',
    '-i',
    source,
    '-vn',
    '-c:a',
    'libvorbis',
    '-q:a',
    '4',
    oggOut,
  ],
  [
    '-y',
    '-i',
    source,
    '-vn',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '160k',
    mp3Out,
  ],
];

for (const args of runs) {
  const result = spawnSync(ffmpegBin, args, {stdio: 'inherit'});
  if (result.error) {
    console.error(`Failed to start ffmpeg binary: ${ffmpegBin}`);
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('Prepared clock-out audio assets.');
