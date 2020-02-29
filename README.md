# vtt2srt
Conver WebVTT(The Web Video Text Tracks Format, aka html5 video subtitles) into SubRip SRT.

## Installation

```bash
git clone https://github.com/piecego/vtt2srt.git
yarn install
```

## Run

\[src]: vtt file or directory

\[output]: new path(Optional)

If it is a directory, iterate automatically to read the vtt file and convert it to srt

```
node ./src/index.js [src] [output]
```

or (not recommend)

```bash
npm -g i
vtt2srt [src] [output]
```

