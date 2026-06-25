type MusicStatus = 'idle' | 'warming' | 'ready' | 'playing' | 'paused' | 'error';

const OGG_URL = '/audio/clockout-theme.ogg';
const MP3_URL = '/audio/clockout-theme.mp3';
const CLOCKOUT_AUDIO_URLS = [OGG_URL, MP3_URL];
const FADE_DURATION_MS = 800;
const FADE_STEPS = 4;
const DEFAULT_VOLUME = 1;

class ClockOutMusicService {
  private status: MusicStatus = 'idle';
  private muted = false;
  private resolvedUrl = MP3_URL;
  private audio: HTMLAudioElement | null = null;
  private warmupPromise: Promise<void> | null = null;
  private fadeJobId = 0;

  public getStatus() {
    return this.status;
  }

  public getResolvedUrl() {
    return this.resolvedUrl;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  public async warmup() {
    if (this.warmupPromise) {
      return this.warmupPromise;
    }

    this.status = 'warming';
    this.resolvedUrl = this.pickUrl();

    this.warmupPromise = fetch(this.resolvedUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to warm up clock-out music.');
        }

        await response.blob();
        this.ensureAudio();
        this.audio?.load();
        void this.notifyServiceWorker();
        this.status = 'ready';
      })
      .catch((error) => {
        this.ensureAudio();
        this.status = 'error';
        this.warmupPromise = null;
        throw error;
      });

    return this.warmupPromise;
  }

  public async playLoop() {
    if (this.muted) {
      return;
    }

    if (this.status === 'playing') {
      return;
    }

    try {
      await this.warmup();
    } catch {
      return;
    }

    if (this.muted) {
      return;
    }

    const audio = this.ensureAudio();
    audio.volume = DEFAULT_VOLUME;
    await this.audio?.play();
    if (this.muted) {
      return;
    }

    this.status = 'playing';
  }

  public stop() {
    if (!this.audio) {
      return;
    }

    this.fadeJobId += 1;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = DEFAULT_VOLUME;
    this.status = this.status === 'error' ? 'error' : 'ready';
  }

  public async pause() {
    if (!this.audio) {
      return;
    }

    const fadeCompleted = await this.fadeVolume(0);
    if (!fadeCompleted) {
      return;
    }

    this.audio.pause();
    this.status = this.status === 'error' ? 'error' : 'paused';
  }

  private ensureAudio() {
    if (this.audio) {
      return this.audio;
    }

    this.audio = new Audio(this.resolvedUrl);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = DEFAULT_VOLUME;
    return this.audio;
  }

  private async fadeVolume(targetVolume: number, durationMs = FADE_DURATION_MS) {
    const audio = this.ensureAudio();
    const startVolume = audio.volume;
    const fadeJobId = ++this.fadeJobId;

    if (startVolume === targetVolume) {
      return true;
    }

    for (let step = 1; step <= FADE_STEPS; step += 1) {
      await new Promise((resolve) => {
        globalThis.setTimeout(resolve, durationMs / FADE_STEPS);
      });

      if (fadeJobId !== this.fadeJobId) {
        return false;
      }

      const nextVolume =
        startVolume + (targetVolume - startVolume) * (step / FADE_STEPS);
      audio.volume = Math.max(0, Math.min(DEFAULT_VOLUME, nextVolume));
    }

    return true;
  }

  private async notifyServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const message = {
      type: 'CACHE_CLOCKOUT_AUDIO',
      urls: CLOCKOUT_AUDIO_URLS,
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
      return;
    }

    const readyPromise = navigator.serviceWorker.ready;
    if (!readyPromise) {
      return;
    }

    const registration = await readyPromise.catch(() => null);
    registration?.active?.postMessage(message);
  }

  private pickUrl() {
    const probe = new Audio();
    return probe.canPlayType('audio/ogg') ? OGG_URL : MP3_URL;
  }
}

export const clockOutMusic = new ClockOutMusicService();
