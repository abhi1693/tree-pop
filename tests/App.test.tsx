import type { ButtonHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
}));

vi.mock('../src/components/TreeCanvas', () => ({
  default: ({
    initialHeight,
    leafScale,
    minBranchLength,
    numTrees,
    seed,
    windIntensity,
  }: {
    initialHeight: number;
    leafScale: number;
    minBranchLength: number;
    numTrees: number;
    seed: string;
    windIntensity: number;
  }) => (
    <div
      data-testid="tree-canvas"
      data-initial-height={initialHeight}
      data-leaf-scale={leafScale}
      data-min-branch-length={minBranchLength}
      data-num-trees={numTrees}
      data-seed={seed}
      data-wind-intensity={windIntensity}
    />
  ),
}));

vi.mock('../src/components/BirdOverlay', () => ({
  default: ({ birdAddTrigger }: { birdAddTrigger: number }) => (
    <div data-testid="bird-overlay" data-bird-add-trigger={birdAddTrigger} />
  ),
}));

describe('App', () => {
  it('renders the title and seeded initial props', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Tree Pop' })).toBeInTheDocument();

    const treeCanvas = screen.getByTestId('tree-canvas');
    const birdOverlay = screen.getByTestId('bird-overlay');

    expect(treeCanvas).toHaveAttribute('data-num-trees', '1');
    expect(treeCanvas).toHaveAttribute('data-min-branch-length', '25');
    expect(treeCanvas).toHaveAttribute('data-initial-height', '100');
    expect(treeCanvas).toHaveAttribute('data-leaf-scale', '0.8');
    expect(treeCanvas).toHaveAttribute('data-wind-intensity', '0.5');
    expect(treeCanvas).toHaveAttribute('data-seed', 'OpenProcessing');
    expect(birdOverlay).toHaveAttribute('data-bird-add-trigger', '0');
  });

  it('cycles the tree controls and updates child props', async () => {
    const user = userEvent.setup();
    render(<App />);

    const treeCanvas = screen.getByTestId('tree-canvas');
    const birds = screen.getByTestId('bird-overlay');

    await user.click(screen.getByRole('button', { name: 'Number of Trees' }));
    expect(treeCanvas).toHaveAttribute('data-num-trees', '2');

    await user.click(screen.getByRole('button', { name: 'Number of Trees' }));
    expect(treeCanvas).toHaveAttribute('data-num-trees', '3');

    await user.click(screen.getByRole('button', { name: 'Number of Trees' }));
    expect(treeCanvas).toHaveAttribute('data-num-trees', '1');

    await user.click(screen.getByRole('button', { name: 'Branch Density' }));
    expect(treeCanvas).toHaveAttribute('data-min-branch-length', '15');

    await user.click(screen.getByRole('button', { name: 'Branch Density' }));
    expect(treeCanvas).toHaveAttribute('data-min-branch-length', '8');

    await user.click(screen.getByRole('button', { name: 'Tree Height' }));
    expect(treeCanvas).toHaveAttribute('data-initial-height', '140');

    await user.click(screen.getByRole('button', { name: 'Leaf Size' }));
    expect(treeCanvas).toHaveAttribute('data-leaf-scale', '1.5');

    await user.click(screen.getByRole('button', { name: 'Wind Force' }));
    expect(treeCanvas).toHaveAttribute('data-wind-intensity', '2.5');

    await user.click(screen.getByRole('button', { name: 'Add Birds' }));
    expect(birds).toHaveAttribute('data-bird-add-trigger', '1');

    await user.click(screen.getByRole('button', { name: 'Add Birds' }));
    expect(birds).toHaveAttribute('data-bird-add-trigger', '2');
  });
});
