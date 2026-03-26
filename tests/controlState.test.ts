import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BIRD_TRIGGER,
  DEFAULT_INITIAL_HEIGHT,
  DEFAULT_LEAF_SCALE,
  DEFAULT_MIN_BRANCH_LENGTH,
  DEFAULT_NUM_TREES,
  DEFAULT_WIND_INTENSITY,
  TREE_POP_SEED,
  getNextInitialHeight,
  getNextLeafScale,
  getNextMinBranchLength,
  getNextNumTrees,
  getNextWindIntensity,
} from '../src/lib/controlState';

describe('controlState', () => {
  it('exposes the expected default values', () => {
    expect(TREE_POP_SEED).toBe('OpenProcessing');
    expect(DEFAULT_NUM_TREES).toBe(1);
    expect(DEFAULT_MIN_BRANCH_LENGTH).toBe(25);
    expect(DEFAULT_INITIAL_HEIGHT).toBe(100);
    expect(DEFAULT_LEAF_SCALE).toBe(0.8);
    expect(DEFAULT_WIND_INTENSITY).toBe(0.5);
    expect(DEFAULT_BIRD_TRIGGER).toBe(0);
  });

  it('cycles tree count through the deployed values', () => {
    expect(getNextNumTrees(1)).toBe(2);
    expect(getNextNumTrees(2)).toBe(3);
    expect(getNextNumTrees(3)).toBe(1);
    expect(getNextNumTrees(99)).toBe(1);
  });

  it('cycles branch density through the deployed values', () => {
    expect(getNextMinBranchLength(25)).toBe(15);
    expect(getNextMinBranchLength(15)).toBe(8);
    expect(getNextMinBranchLength(8)).toBe(25);
    expect(getNextMinBranchLength(99)).toBe(25);
  });

  it('cycles tree height through the deployed values', () => {
    expect(getNextInitialHeight(100)).toBe(140);
    expect(getNextInitialHeight(140)).toBe(180);
    expect(getNextInitialHeight(180)).toBe(100);
    expect(getNextInitialHeight(99)).toBe(100);
  });

  it('cycles leaf scale through the deployed values', () => {
    expect(getNextLeafScale(0.8)).toBe(1.5);
    expect(getNextLeafScale(1.5)).toBe(2.5);
    expect(getNextLeafScale(2.5)).toBe(0.8);
    expect(getNextLeafScale(99)).toBe(0.8);
  });

  it('cycles wind intensity through the deployed values', () => {
    expect(getNextWindIntensity(0.5)).toBe(2.5);
    expect(getNextWindIntensity(2.5)).toBe(5);
    expect(getNextWindIntensity(5)).toBe(0.5);
    expect(getNextWindIntensity(99)).toBe(0.5);
  });
});
