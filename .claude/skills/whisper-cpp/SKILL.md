---
name: whisper-cpp
description: Transcribe speech offline with whisper.cpp (`whisper-cli`) to get timestamped segments or words. Use when transcribing audio or video, producing SRT, VTT or JSON transcripts, finding clip boundaries from speech, or fixing wrong or hallucinated whisper output.
---

# whisper.cpp

Local speech to text. `whisper-cli -h` is the source of truth for flags; this file holds the recipe and the gotchas. Written against whisper.cpp 1.9.5.

## Setup

```bash
brew install whisper.cpp        # formerly named whisper-cpp; provides whisper-cli
```

Models are separate downloads in ggml format:

```bash
mkdir -p models
curl -L -o models/ggml-base.en.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

Swap `base.en` for another name. Sizes: `tiny`, `base`, `small`, `medium`, `large-v3`, `large-v3-turbo`. A `.en` suffix (tiny to medium) is English only. A `-q5_0`, `-q5_1` or `-q8_0` suffix is a smaller quantised file. `base.en` is 148 MB.

## Transcribe

Convert the input to 16 kHz mono 16-bit WAV first. `-vn` drops the video stream:

```bash
ffmpeg -i input.mp4 -vn -ar 16000 -ac 1 -c:a pcm_s16le audio.wav
whisper-cli -m models/ggml-base.en.bin -f audio.wav -l en -oj -osrt -of out/transcript
```

`-of` takes a path without an extension and each output flag adds its own: `-oj` JSON, `-osrt` SRT, `-ovtt` VTT, `-otxt` text, `-ocsv` CSV. Add `-np` to keep stdout to results only.

## JSON output

`-oj` writes `transcription[]`, one entry per segment:

```json
{
  "timestamps": { "from": "00:00:00,000", "to": "00:00:07,600" },
  "offsets": { "from": 0, "to": 7600 },
  "text": " And so my fellow Americans..."
}
```

Use `offsets`, which are integer milliseconds, for clip maths. `-ojf` adds a `tokens[]` array to each segment with `text`, `id` and probability `p`.

## Word timestamps

`-ml 1 -sow` caps each segment at one word, so every `transcription[]` entry is a single word with its own offsets. Upstream marks this experimental: treat boundaries as approximate and pad cuts by a few hundred milliseconds. `-ml N` with a larger N gives caption lines of at most N characters.

## Language

`-l` defaults to `en`. Use `-l auto` to detect, `-dl` to detect and exit, `-tr` to translate into English. Multilingual work needs a model without the `.en` suffix.

## Music and silence

On audio that is mostly music or silence the decoder invents text: repeated lines, or fluent sentences in an unrelated language. In order of preference:

1. Pin the language with `-l LANG` so detection cannot pick one at random.
2. Cut non-speech before decoding with VAD, which also speeds up long files:

   ```bash
   curl -L -o models/ggml-silero-v6.2.0.bin \
     https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin
   whisper-cli -m models/ggml-base.en.bin -f audio.wav --vad -vm models/ggml-silero-v6.2.0.bin
   ```

3. Add `-sns` to suppress non-speech tokens and `-nf` to stop the temperature fallback turning uncertainty into fluent text.

## Part of a file

`-ot MS` starts at an offset and `-d MS` limits the duration, both in milliseconds, so a long recording can be transcribed in ranges without cutting it first.
