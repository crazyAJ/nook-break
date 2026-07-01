export type ClockOutAnimalKey =
  | "bear"
  | "buffalo"
  | "chick"
  | "chicken"
  | "cow"
  | "crocodile"
  | "dog"
  | "duck"
  | "elephant"
  | "frog"
  | "giraffe"
  | "goat"
  | "gorilla"
  | "hippo"
  | "horse"
  | "monkey"
  | "moose"
  | "narwhal"
  | "owl"
  | "panda"
  | "parrot"
  | "penguin"
  | "pig"
  | "rabbit"
  | "rhino"
  | "sloth"
  | "snake"
  | "walrus"
  | "whale"
  | "zebra";

export const CLOCKOUT_ANIMAL_KEYS: ClockOutAnimalKey[] = [
  "bear",
  "buffalo",
  "chick",
  "chicken",
  "cow",
  "crocodile",
  "dog",
  "duck",
  "elephant",
  "frog",
  "giraffe",
  "goat",
  "gorilla",
  "hippo",
  "horse",
  "monkey",
  "moose",
  "narwhal",
  "owl",
  "panda",
  "parrot",
  "penguin",
  "pig",
  "rabbit",
  "rhino",
  "sloth",
  "snake",
  "walrus",
  "whale",
  "zebra",
];

export function getClockOutAnimalSpriteUrl(key: ClockOutAnimalKey) {
  return `/images/clockout/animals/${key}.png`;
}

export function getShuffledClockOutAnimalKeys() {
  const pool = [...CLOCKOUT_ANIMAL_KEYS];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool;
}

let preloadClockOutAnimalSpritesPromise: Promise<void> | null = null;

export function preloadClockOutAnimalSprites() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (preloadClockOutAnimalSpritesPromise) {
    return preloadClockOutAnimalSpritesPromise;
  }

  preloadClockOutAnimalSpritesPromise = Promise.all(
    CLOCKOUT_ANIMAL_KEYS.map((key) => {
      const image = new Image();
      image.decoding = "async";
      image.src = getClockOutAnimalSpriteUrl(key);

      if (typeof image.decode === "function") {
        return image.decode().catch(() => undefined);
      }

      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    }),
  ).then(() => undefined);

  return preloadClockOutAnimalSpritesPromise;
}
