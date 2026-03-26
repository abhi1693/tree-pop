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
import './App.css';

const SEED = 'OpenProcessing';

function App() {
  const [numTrees, setNumTrees] = useState(1);
  const [minBranchLength, setMinBranchLength] = useState(25);
  const [initialHeight, setInitialHeight] = useState(100);
  const [leafScale, setLeafScale] = useState(0.8);
  const [windIntensity, setWindIntensity] = useState(0.5);
  const [birdAddTrigger, setBirdAddTrigger] = useState(0);

  const controls = [
    {
      icon: TreeDeciduous,
      label: 'Number of Trees',
      onClick: () => {
        setNumTrees((current) => {
          if (current === 1) {
            return 2;
          }

          if (current === 2) {
            return 3;
          }

          return 1;
        });
      },
    },
    {
      icon: SlidersVertical,
      label: 'Branch Density',
      onClick: () => {
        setMinBranchLength((current) => {
          if (current === 25) {
            return 15;
          }

          if (current === 15) {
            return 8;
          }

          return 25;
        });
      },
    },
    {
      icon: ArrowUp,
      label: 'Tree Height',
      onClick: () => {
        setInitialHeight((current) => {
          if (current === 100) {
            return 140;
          }

          if (current === 140) {
            return 180;
          }

          return 100;
        });
      },
    },
    {
      icon: Leaf,
      label: 'Leaf Size',
      onClick: () => {
        setLeafScale((current) => {
          if (current === 0.8) {
            return 1.5;
          }

          if (current === 1.5) {
            return 2.5;
          }

          return 0.8;
        });
      },
    },
    {
      icon: Wind,
      label: 'Wind Force',
      onClick: () => {
        setWindIntensity((current) => {
          if (current === 0.5) {
            return 2.5;
          }

          if (current === 2.5) {
            return 5;
          }

          return 0.5;
        });
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
          seed={SEED}
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
