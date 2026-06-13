/** Suggested shot order for field agents */
export const CAPTURE_SHOT_GUIDE = [
  { tag: 'exterior', hint: 'Front of building & gate' },
  { tag: 'full-photo', hint: 'Wide shot of the property' },
  { tag: 'living_room', hint: 'Main living / sitting area' },
  { tag: 'kitchen', hint: 'Kitchen & fixtures' },
  { tag: 'bedroom', hint: 'Primary bedroom' },
  { tag: 'bathroom', hint: 'Bathroom / toilet' },
] as const;

export function getShotHint(sequence: number): { tag: string; hint: string } {
  const index = Math.max(0, Math.min(sequence - 1, CAPTURE_SHOT_GUIDE.length - 1));
  return CAPTURE_SHOT_GUIDE[index];
}
