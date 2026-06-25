# Clock-Out Music Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the procedural clock-out theme with a real looping audio asset that is warmed up after first page load, cached for later visits, and played through a lightweight client-side service in a pure static deployment.

**Architecture:** Keep audio delivery fully static by generating optimized `ogg` and `mp3` assets at build time, then layer a `clockOutMusic` browser service on top of them. The service preloads the preferred format in the background, uses `HTMLAudioElement` for looping playback, and cooperates with a minimal Service Worker that caches only the clock-out music files.

**Tech Stack:** Vite, React 19, TypeScript, HTMLAudioElement, Service Worker Cache Storage, Vitest, Node-based build scripts

---

## File Structure

- Create: `public/audio/.gitkeep`
- Create: `public/sw.js`
- Create: `scripts/prepare-clockout-audio.mjs`
- Create: `src/lib/clockOutMusic.ts`
- Create: `src/lib/registerServiceWorker.ts`
- Create: `src/lib/clockOutMusic.test.ts`
- Modify: `package.json`
- Modify: `src/App.tsx`
- Modify: `src/components/ClockOutCelebrationModal.tsx`
- Delete: `src/lib/titleMusic.ts`
- Modify: `README.md`

## Assumptions

- The workspace is currently not a Git repository, so commit steps are intentionally omitted from this plan.
- The source audio is `C:/Users/Administrator/Desktop/Main Theme.mp3`.
- The implementing engineer has `ffmpeg` available locally. If not, install it first or replace the script internals with another deterministic CLI encoder before continuing.

### Task 1: Add test and build scaffolding

**Files:**
- Modify: `package.json`
- Create: `src/lib/clockOutMusic.test.ts`

- [ ] **Step 1: Add failing test tooling dependencies and scripts**

Update `package.json` to add a test entry and the test dependencies needed for a DOM-capable browser-service test.

```json
{
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3",
    "vitest": "^2.1.8",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 2: Write the failing service contract test**

Create `src/lib/clockOutMusic.test.ts` with the initial expected API and fallback behavior.

```ts
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.stubGlobal(
  'Audio',
  class {
    public loop = false;
    public preload = '';
    public src = '';
    public play = vi.fn().mockResolvedValue(undefined);
    public pause = vi.fn();
    public load = vi.fn();
    canPlayType(type: string) {
      return type === 'audio/ogg' ? 'probably' : '';
    }
  } as unknown as typeof Audio,
);

describe('clockOutMusic', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('prefers ogg when supported', async () => {
    const {clockOutMusic} = await import('./clockOutMusic');
    await clockOutMusic.warmup();
    expect(clockOutMusic.getStatus()).toBe('ready');
    expect(clockOutMusic.getResolvedUrl()).toBe('/audio/clockout-theme.ogg');
  });
});
```

- [ ] **Step 3: Run the new test to verify it fails**

Run:

```bash
npm install
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: FAIL with a module resolution error because `src/lib/clockOutMusic.ts` does not exist yet.

### Task 2: Add deterministic audio preparation for static assets

**Files:**
- Create: `public/audio/.gitkeep`
- Create: `scripts/prepare-clockout-audio.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add an audio prepare script entry**

Extend `package.json` scripts to generate both static audio outputs before build.

```json
{
  "scripts": {
    "audio:prepare": "node scripts/prepare-clockout-audio.mjs",
    "build": "npm run audio:prepare && vite build"
  }
}
```

- [ ] **Step 2: Add the placeholder audio output directory**

Create `public/audio/.gitkeep` with the following content so the directory exists before the first conversion run.

```text
# Generated audio assets live here.
```

- [ ] **Step 3: Create the deterministic conversion script**

Create `scripts/prepare-clockout-audio.mjs`.

```js
import {mkdirSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const source = 'C:/Users/Administrator/Desktop/Main Theme.mp3';
const outDir = path.join(root, 'public', 'audio');
const oggOut = path.join(outDir, 'clockout-theme.ogg');
const mp3Out = path.join(outDir, 'clockout-theme.mp3');

if (!existsSync(source)) {
  console.error(`Missing source audio: ${source}`);
  process.exit(1);
}

mkdirSync(outDir, {recursive: true});

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
  const result = spawnSync('ffmpeg', args, {stdio: 'inherit'});
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('Prepared clock-out audio assets.');
```

- [ ] **Step 4: Run the preparation script**

Run:

```bash
npm run audio:prepare
```

Expected: PASS with `Prepared clock-out audio assets.` and two files created:

- `public/audio/clockout-theme.ogg`
- `public/audio/clockout-theme.mp3`

### Task 3: Implement the client-side clock-out music service

**Files:**
- Create: `src/lib/clockOutMusic.ts`
- Modify: `src/lib/clockOutMusic.test.ts`

- [ ] **Step 1: Expand the tests to cover fallback, mute, and stop behavior**

Replace `src/lib/clockOutMusic.test.ts` with the fuller service contract.

```ts
import {beforeEach, describe, expect, it, vi} from 'vitest';

class FakeAudio {
  public loop = false;
  public preload = '';
  public src = '';
  public currentTime = 0;
  public play = vi.fn().mockResolvedValue(undefined);
  public pause = vi.fn();
  public load = vi.fn();
  canPlayType(type: string) {
    return type === 'audio/ogg' ? 'probably' : '';
  }
}

describe('clockOutMusic', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['audio']),
      }),
    );
  });

  it('prefers ogg when supported', async () => {
    const {clockOutMusic} = await import('./clockOutMusic');
    await clockOutMusic.warmup();
    expect(clockOutMusic.getResolvedUrl()).toBe('/audio/clockout-theme.ogg');
    expect(clockOutMusic.getStatus()).toBe('ready');
  });

  it('stops playback when muted', async () => {
    const {clockOutMusic} = await import('./clockOutMusic');
    await clockOutMusic.warmup();
    await clockOutMusic.playLoop();
    clockOutMusic.setMuted(true);
    expect(clockOutMusic.getStatus()).toBe('ready');
  });

  it('falls back to mp3 when ogg is unsupported', async () => {
    class Mp3OnlyAudio extends FakeAudio {
      override canPlayType() {
        return '';
      }
    }

    vi.stubGlobal('Audio', Mp3OnlyAudio as unknown as typeof Audio);
    const {clockOutMusic} = await import('./clockOutMusic');
    await clockOutMusic.warmup();
    expect(clockOutMusic.getResolvedUrl()).toBe('/audio/clockout-theme.mp3');
  });
});
```

- [ ] **Step 2: Run the test suite to confirm it still fails**

Run:

```bash
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: FAIL because `clockOutMusic.ts` is still missing.

- [ ] **Step 3: Create the minimal implementation**

Create `src/lib/clockOutMusic.ts`.

```ts
type MusicStatus = 'idle' | 'warming' | 'ready' | 'playing' | 'error';

const OGG_URL = '/audio/clockout-theme.ogg';
const MP3_URL = '/audio/clockout-theme.mp3';

class ClockOutMusicService {
  private status: MusicStatus = 'idle';
  private muted = false;
  private preferredUrl = MP3_URL;
  private audio: HTMLAudioElement | null = null;
  private warmupPromise: Promise<void> | null = null;

  getStatus() {
    return this.status;
  }

  getResolvedUrl() {
    return this.preferredUrl;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  async warmup() {
    if (this.warmupPromise) {
      return this.warmupPromise;
    }

    this.status = 'warming';
    this.preferredUrl = this.pickUrl();

    this.warmupPromise = fetch(this.preferredUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Warmup failed: ${response.status}`);
        }
        await response.blob();
        this.audio = new Audio(this.preferredUrl);
        this.audio.loop = true;
        this.audio.preload = 'auto';
        this.audio.load();
        this.status = 'ready';
      })
      .catch(() => {
        this.audio = new Audio(this.preferredUrl);
        this.audio.loop = true;
        this.audio.preload = 'auto';
        this.status = 'error';
      });

    return this.warmupPromise;
  }

  async playLoop() {
    if (this.muted) {
      return;
    }
    await this.warmup();
    if (!this.audio) {
      this.audio = new Audio(this.preferredUrl);
      this.audio.loop = true;
    }
    await this.audio.play();
    this.status = 'playing';
  }

  stop() {
    if (!this.audio) {
      return;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.status = this.status === 'error' ? 'error' : 'ready';
  }

  private pickUrl() {
    const probe = new Audio();
    return probe.canPlayType('audio/ogg') ? OGG_URL : MP3_URL;
  }
}

export const clockOutMusic = new ClockOutMusicService();
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: PASS with 3 passing tests.

### Task 4: Add Service Worker registration and audio-only caching

**Files:**
- Create: `public/sw.js`
- Create: `src/lib/registerServiceWorker.ts`
- Modify: `src/lib/clockOutMusic.ts`
- Test: `src/lib/clockOutMusic.test.ts`

- [ ] **Step 1: Add a failing test for SW warmup side effects**

Append this test to `src/lib/clockOutMusic.test.ts`.

```ts
it('attempts to notify the service worker after warmup', async () => {
  const postMessage = vi.fn();
  vi.stubGlobal('navigator', {
    serviceWorker: {
      controller: {postMessage},
    },
  });

  const {clockOutMusic} = await import('./clockOutMusic');
  await clockOutMusic.warmup();
  expect(postMessage).toHaveBeenCalledWith({
    type: 'CACHE_CLOCKOUT_AUDIO',
    urls: ['/audio/clockout-theme.ogg', '/audio/clockout-theme.mp3'],
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: FAIL because the service does not post a cache message yet.

- [ ] **Step 3: Add the SW and registration helper**

Create `public/sw.js`.

```js
const CACHE_NAME = 'clockout-audio-v1';
const AUDIO_URLS = ['/audio/clockout-theme.ogg', '/audio/clockout-theme.mp3'];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_CLOCKOUT_AUDIO') {
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(AUDIO_URLS)),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (!AUDIO_URLS.includes(requestUrl.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
```

Create `src/lib/registerServiceWorker.ts`.

```ts
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.warn('Service worker registration failed.', error);
  }
};
```

- [ ] **Step 4: Teach the music service to notify the SW**

Update the `warmup()` success path in `src/lib/clockOutMusic.ts`.

```ts
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_CLOCKOUT_AUDIO',
            urls: [OGG_URL, MP3_URL],
          });
        }
```

- [ ] **Step 5: Run tests and verify they pass**

Run:

```bash
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: PASS with 4 passing tests.

### Task 5: Wire the application to the new music service and remove the old synth

**Files:**
- Modify: `src/App.tsx:8-9`
- Modify: `src/App.tsx:446`
- Modify: `src/App.tsx:649-665`
- Modify: `src/components/ClockOutCelebrationModal.tsx:245-252`
- Delete: `src/lib/titleMusic.ts`
- Modify: `README.md`

- [ ] **Step 1: Add a failing integration expectation**

Add this test to `src/lib/clockOutMusic.test.ts` to lock in the public app hook shape before wiring.

```ts
it('can be imported as a singleton with warmup and playLoop methods', async () => {
  const module = await import('./clockOutMusic');
  expect(typeof module.clockOutMusic.warmup).toBe('function');
  expect(typeof module.clockOutMusic.playLoop).toBe('function');
});
```

- [ ] **Step 2: Run tests to verify the baseline stays green**

Run:

```bash
npm run test -- src/lib/clockOutMusic.test.ts
```

Expected: PASS. This is a guard before changing the app wiring.

- [ ] **Step 3: Replace old imports and hook the warmup/play/stop flow into App**

In `src/App.tsx`, replace the old title theme import.

```ts
import {clockOutMusic} from './lib/clockOutMusic';
import {registerServiceWorker} from './lib/registerServiceWorker';
```

Add an app-start effect near the other startup effects.

```ts
  useEffect(() => {
    registerServiceWorker();

    const runWarmup = () => {
      clockOutMusic.setMuted(muteSound);
      void clockOutMusic.warmup();
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(runWarmup);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(runWarmup, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);
```

Replace the old play/stop calls.

```ts
        void clockOutMusic.playLoop();
```

```ts
    clockOutMusic.stop();
```

Replace the mute toggle body.

```ts
  const handleToggleMuteSound = () => {
    const nextMuted = !muteSound;
    setMuteSound(nextMuted);
    localStorage.setItem('muteSound', String(nextMuted));
    clockOutMusic.setMuted(nextMuted);

    if (!nextMuted && showClockOutModal) {
      void clockOutMusic.playLoop();
    }
  };
```

- [ ] **Step 4: Keep the modal UI text but remove references to the old title theme semantics**

Update the music button title in `src/components/ClockOutCelebrationModal.tsx`.

```tsx
            title="Toggle background music / 切换背景音乐"
```

- [ ] **Step 5: Delete the old synth implementation**

Remove `src/lib/titleMusic.ts` entirely.

Expected result:

```text
src/lib/titleMusic.ts
```

is deleted from the tree.

- [ ] **Step 6: Update the project documentation**

Add a short section to `README.md`.

```md
## Clock-Out Music

- The clock-out celebration modal now uses static audio assets in `public/audio/`
- Run `npm run audio:prepare` after replacing `C:/Users/Administrator/Desktop/Main Theme.mp3`
- The app warms the music in the background and caches it through a minimal Service Worker
```

- [ ] **Step 7: Run full verification**

Run:

```bash
npm run lint
npm run test
npm run build
```

Expected:

- `npm run lint`: PASS
- `npm run test`: PASS
- `npm run build`: PASS and includes the audio preparation step

## Self-Review

### Spec coverage

- Build-time conversion: covered in Task 2
- Background warmup after first load: covered in Task 5
- Looping playback via a lightweight service: covered in Task 3 and Task 5
- Service Worker cache enhancement: covered in Task 4
- Removal of old procedural music: covered in Task 5
- Static deployment compatibility and fallback: covered in Task 3 and Task 4

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain
- Every task names exact files and commands
- Every code-changing step includes concrete code

### Type consistency

- Service API is consistently named `clockOutMusic`
- Status names match the spec: `idle`, `warming`, `ready`, `playing`, `error`
- Audio URLs are consistently `/audio/clockout-theme.ogg` and `/audio/clockout-theme.mp3`
