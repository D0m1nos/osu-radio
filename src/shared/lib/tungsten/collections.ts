import { flatRNG } from "./math";

/**
 * Randomly shuffle array of elements
 * @param array
 */
export function shuffle<T>(array: T[]): void {
  for (let i = 0; i < array.length - 1; ++i) {
    const j = flatRNG(i, array.length);

    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }
}
