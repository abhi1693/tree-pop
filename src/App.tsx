import { motion } from 'framer-motion';
import {
  ArrowUp,
  Bird,
  Leaf,
  SlidersVertical,
  TreeDeciduous,
  Wind,
} from 'lucide-react';
import { useState } from 'react';
import BirdOverlay from './components/BirdOverlay';
import TreeCanvas from './components/TreeCanvas';
import {
  DEFAULT_BIRD_TRIGGER,
  DEFAULT_INITIAL_HEIGHT,
  DEFAULT_LEAF_SCALE,
  DEFAULT_MIN_BRANCH_LENGTH,
  DEFAULT_NUM_TREES,
  DEFAULT_WIND_INTENSITY,
  getNextInitialHeight,
  getNextLeafScale,
  getNextMinBranchLength,
  getNextNumTrees,
  getNextWindIntensity,
  TREE_POP_SEED,
} from './lib/controlState';
import './App.css';

function App() {
  const [numTrees, setNumTrees] = useState(DEFAULT_NUM_TREES);
  const [minBranchLength, setMinBranchLength] = useState(DEFAULT_MIN_BRANCH_LENGTH);
  const [initialHeight, setInitialHeight] = useState(DEFAULT_INITIAL_HEIGHT);
  const [leafScale, setLeafScale] = useState(DEFAULT_LEAF_SCALE);
  const [windIntensity, setWindIntensity] = useState(DEFAULT_WIND_INTENSITY);
  const [birdAddTrigger, setBirdAddTrigger] = useState(DEFAULT_BIRD_TRIGGER);

  const controls = [
    {
      icon: TreeDeciduous,
      label: 'Number of Trees',
      onClick: () => {
        setNumTrees(getNextNumTrees);
      },
    },
    {
      icon: SlidersVertical,
      label: 'Branch Density',
      onClick: () => {
        setMinBranchLength(getNextMinBranchLength);
      },
    },
    {
      icon: ArrowUp,
      label: 'Tree Height',
      onClick: () => {
        setInitialHeight(getNextInitialHeight);
      },
    },
    {
      icon: Leaf,
      label: 'Leaf Size',
      onClick: () => {
        setLeafScale(getNextLeafScale);
      },
    },
    {
      icon: Wind,
      label: 'Wind Force',
      onClick: () => {
        setWindIntensity(getNextWindIntensity);
      },
    },
    {
      icon: Bird,
      label: 'Add Birds',
      onClick: () => {
        setBirdAddTrigger((current) => current + 1);
      },
    },
  ];

  return (
    <main className="scene">
      <div className="scene__layer">
        <TreeCanvas
          numTrees={numTrees}
          minBranchLength={minBranchLength}
          initialHeight={initialHeight}
          leafScale={leafScale}
          windIntensity={windIntensity}
          seed={TREE_POP_SEED}
        />
      </div>

      <div className="scene__layer scene__layer--overlay">
        <BirdOverlay birdAddTrigger={birdAddTrigger} />
      </div>

      <div className="scene__title-wrap">
        <h1 className="scene__title">Tree Pop</h1>
      </div>

      <div className="scene__controls" aria-label="Tree controls" role="toolbar">
        {controls.map(({ icon: Icon, label, onClick }) => (
          <motion.button
            key={label}
            type="button"
            aria-label={label}
            className="control-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            title={label}
          >
            <Icon className="control-button__icon" />
          </motion.button>
        ))}
      </div>
    </main>
  );
}

export default App;
