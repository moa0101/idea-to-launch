// Turns the screencast frames into the portal preview videos (silent, ≤ 20 s, cover as the first frame) and a GIF.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const A = 'go-to-market/assets';
const jobs = [['portrait', 'cover-portrait-1080x1620.png', 1080, 1620]];
for (const [name, cover, w, h] of jobs) {
  const dir = `dist-assets-frames/${name}`;
  const frames = JSON.parse(readFileSync(`${dir}/frames.json`, 'utf8'));
  // The concat demuxer needs one image format: turn the cover into a JPEG frame first.
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${A}/${cover}`, '-q:v', '1', `${dir}/cover.jpg`]);
  const lines = [`file 'cover.jpg'`, 'duration 1.2'];
  let total = 1.2;
  for (let i = 0; i < frames.length - 1 && total < 19.5; i++) {
    const d = Math.min(0.5, Math.max(0.001, frames[i + 1].t - frames[i].t));
    lines.push(`file '${frames[i].file.split('/').pop()}'`, `duration ${d.toFixed(4)}`);
    total += d;
  }
  lines.push(`file '${frames[frames.length - 1].file.split('/').pop()}'`, 'duration 1.5');
  total += 1.5;
  writeFileSync(`${dir}/list.txt`, lines.join('\n') + `\nfile '${frames[frames.length - 1].file.split('/').pop()}'\n`);
  const out = `${A}/preview-${name}-${w}x${h}.mp4`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-t', '20',
    '-vf', `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0xFFF8EE,fps=30,format=yuv420p`,
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', out]);
  console.log(out, `${total.toFixed(1)} s`);
}
// Landscape: the portrait game sits on the right of the landscape cover (a portrait game letterboxed in 16:9 looks empty).
// The canvas inside the 1080x1620 frame is 911x1620 at x=84.
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-loop', '1', '-i', `${A}/cover-landscape-1920x1080.png`, '-i', `${A}/preview-portrait-1080x1620.mp4`,
  '-filter_complex', "[1]crop=911:1620:84:0,scale=540:960[g];[0][g]overlay=x=W-w-150:y=60:enable='gte(t,1.2)':shortest=1,fps=30,format=yuv420p",
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', `${A}/preview-landscape-1920x1080.mp4`]);
console.log(`${A}/preview-landscape-1920x1080.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1.2', '-i', `${A}/preview-portrait-1080x1620.mp4`,
  '-vf', 'fps=15,scale=400:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', `${A}/gameplay.gif`]);
console.log(`${A}/gameplay.gif`);
