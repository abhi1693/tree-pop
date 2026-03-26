export const TREE_POP_SEED = 'OpenProcessing';

export const DEFAULT_NUM_TREES = 1;
export const DEFAULT_MIN_BRANCH_LENGTH = 25;
export const DEFAULT_INITIAL_HEIGHT = 100;
export const DEFAULT_LEAF_SCALE = 0.8;
export const DEFAULT_WIND_INTENSITY = 0.5;
export const DEFAULT_BIRD_TRIGGER = 0;

export function getNextNumTrees(current: number) {
  if (current === 1) {
    return 2;
  }

  if (current === 2) {
    return 3;
  }

  return 1;
}

export function getNextMinBranchLength(current: number) {
  if (current === 25) {
    return 15;
  }

  if (current === 15) {
    return 8;
  }

  return 25;
}

export function getNextInitialHeight(current: number) {
  if (current === 100) {
    return 140;
  }

  if (current === 140) {
    return 180;
  }

  return 100;
}

export function getNextLeafScale(current: number) {
  if (current === 0.8) {
    return 1.5;
  }

  if (current === 1.5) {
    return 2.5;
  }

  return 0.8;
}

export function getNextWindIntensity(current: number) {
  if (current === 0.5) {
    return 2.5;
  }

  if (current === 2.5) {
    return 5;
  }

  return 0.5;
}
