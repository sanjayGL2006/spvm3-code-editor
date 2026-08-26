import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Info } from 'lucide-react';

export default function VisualizerPanel() {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([5, 2, 8, 1, 9, 3, 7, 4]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Generate sorting animation steps
  useEffect(() => {
    const steps = [];
    const arr = [...array];

    if (algorithm === 'bubble') {
      const temp = [...arr];
      const n = temp.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            arr: [...temp],
            active: [j, j + 1],
            compared: true,
            msg: `Comparing index ${j} (val: ${temp[j]}) with index ${j + 1} (val: ${temp[j + 1]})`
          });
          if (temp[j] > temp[j + 1]) {
            const swap = temp[j];
            temp[j] = temp[j + 1];
            temp[j + 1] = swap;
            steps.push({
              arr: [...temp],
              active: [j, j + 1],
              swapped: true,
              msg: `Swapped ${temp[j + 1]} and ${temp[j]}`
            });
          }
        }
      }
      steps.push({ arr: [...temp], active: [], msg: 'Bubble Sort complete!' });
    } else if (algorithm === 'selection') {
      const temp = [...arr];
      const n = temp.length;
      for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({
            arr: [...temp],
            active: [j, minIdx],
            msg: `Checking if element at index ${j} (${temp[j]}) is smaller than min (${temp[minIdx]})`
          });
          if (temp[j] < temp[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
          const t = temp[i];
          temp[i] = temp[minIdx];
          temp[minIdx] = t;
          steps.push({
            arr: [...temp],
            active: [i, minIdx],
            swapped: true,
            msg: `Swapped ${temp[i]} to sorted position at index ${i}`
          });
        }
      }
      steps.push({ arr: [...temp], active: [], msg: 'Selection Sort complete!' });
    }

    setHistory(steps);
    setStepIndex(0);
  }, [algorithm]);

  useEffect(() => {
    let timer;
    if (isPlaying && stepIndex < history.length - 1) {
      timer = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
      }, 600);
    } else if (stepIndex >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, history]);

  const currentStep = history[stepIndex] || { arr: array, active: [], msg: 'Ready' };

  return (
    <div className="visualizer-panel">
      <div className="visualizer-header">
        <div className="title-row">
          <h3>Algorithm & Memory Visualizer</h3>
          <span className="badge">Interactive Learning Engine</span>
        </div>
        <div className="controls-row">
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="algo-select">
            <option value="bubble">Bubble Sort O(N²)</option>
            <option value="selection">Selection Sort O(N²)</option>
          </select>
          <button className="viz-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button className="viz-btn" onClick={() => setStepIndex((prev) => Math.min(prev + 1, history.length - 1))}>
            <FastForward size={14} />
            <span>Step</span>
          </button>
          <button className="viz-btn" onClick={() => setStepIndex(0)}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        <div className="array-visualization">
          {currentStep.arr.map((val, idx) => {
            const isActive = currentStep.active.includes(idx);
            const isSwapped = currentStep.swapped && isActive;
            const heightPx = Math.max(val * 24, 30);
            return (
              <div key={idx} className="array-column-wrap">
                <span className="col-val">{val}</span>
                <div
                  className={`array-bar ${isActive ? 'active' : ''} ${isSwapped ? 'swapped' : ''}`}
                  style={{ height: `${heightPx}px` }}
                />
                <span className="col-idx">[{idx}]</span>
              </div>
            );
          })}
        </div>

        <div className="visualizer-info-card">
          <Info size={16} color="var(--accent)" />
          <div className="info-text">
            <strong>Step {stepIndex + 1} of {history.length}:</strong> {currentStep.msg}
          </div>
        </div>

        <div className="memory-inspection">
          <h4>Call Stack & Variable Memory Inspection</h4>
          <div className="memory-grid">
            <div className="mem-box">
              <span className="mem-label">Target Array</span>
              <code>numbers = [{currentStep.arr.join(', ')}]</code>
            </div>
            <div className="mem-box">
              <span className="mem-label">Time Complexity</span>
              <code>O(N²) quadratic</code>
            </div>
            <div className="mem-box">
              <span className="mem-label">Space Complexity</span>
              <code>O(1) in-place</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
