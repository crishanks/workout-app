import './SetsTracker.css';

export const SetsTracker = ({ sets, warmupSets = 0, warmupReps = [], repRange, exerciseName, lastWorkout, onLogSet, getCurrentLog }) => {
  const getWarmupRepScheme = (warmupCount) => {
    if (warmupCount === 1) return ["8"];
    if (warmupCount === 2) return ["8", "6"];
    if (warmupCount === 3) return ["8", "6", "4"];
    if (warmupCount === 4) return ["8", "6", "5", "3"];
    return [];
  };

  const getWarmupWeightPercentages = (warmupCount) => {
    if (warmupCount === 1) return [0.60];
    if (warmupCount === 2) return [0.50, 0.70];
    if (warmupCount === 3) return [0.45, 0.65, 0.85];
    if (warmupCount === 4) return [0.45, 0.60, 0.75, 0.85];
    return [];
  };

  // Parse rep range (e.g., "6-8" or "10-12")
  const parseRepRange = (reps) => {
    if (!reps || typeof reps !== 'string') return { min: 8, max: 12 };
    const match = reps.match(/(\d+)-(\d+)/);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }
    const single = parseInt(reps);
    return { min: single, max: single };
  };

  // Calculate progressive overload suggestion
  const getSuggestedWeightAndReps = (setIdx) => {
    if (!lastWorkout?.sets[setIdx]) return { weight: '', reps: '' };

    const lastWeight = parseFloat(lastWorkout.sets[setIdx].weight);
    const lastReps = parseFloat(lastWorkout.sets[setIdx].reps);

    if (!lastWeight || !lastReps) return { weight: lastWeight || '', reps: lastReps || '' };

    const { min, max } = parseRepRange(repRange);

    // Check if ALL sets from last workout maxed out the rep range
    const allSetsMaxed = Object.values(lastWorkout.sets).every(set => {
      const reps = parseFloat(set.reps);
      return reps >= max;
    });

    // ONLY if ALL sets hit max reps, suggest weight increase and reset to min reps
    if (allSetsMaxed) {
      return { weight: lastWeight + 5, reps: min };
    }

    // Otherwise, keep same weight and same reps (user will try to add reps themselves)
    // Show last reps as placeholder to remind them what they did
    return { weight: lastWeight, reps: lastReps };
  };

  const defaultWarmupReps = warmupReps.length > 0 ? warmupReps : getWarmupRepScheme(warmupSets);
  const warmupPercentages = getWarmupWeightPercentages(warmupSets);

  // Get the first working set weight to calculate warm-up weights
  const firstWorkingSetLog = getCurrentLog(exerciseName, 0);
  const workingWeight = parseFloat(firstWorkingSetLog.weight) || 0;

  return (
    <div className="sets-tracker">
      {warmupSets > 0 && (
        <div className="warmup-section">
          <div className="warmup-header">Warm-up Sets</div>
          {[...Array(warmupSets)].map((_, setIdx) => {
            const repsValue = defaultWarmupReps[setIdx] || "8";
            const percentage = warmupPercentages[setIdx] || 0.60;
            const calculatedWeight = workingWeight > 0 ? Math.round(workingWeight * percentage * 2) / 2 : '';

            return (
              <div key={`warmup-${setIdx}`} className="set-row warmup-row">
                <span className="set-label">W{setIdx + 1}</span>
                <div className="weight-display warmup-weight">
                  {calculatedWeight || '-'}
                </div>
                <div className="reps-display warmup-reps">{repsValue}</div>
              </div>
            );
          })}
        </div>
      )}

      {sets > 0 && warmupSets > 0 && <div className="working-sets-header">Working Sets</div>}

      {[...Array(sets)].map((_, setIdx) => {
        const log = getCurrentLog(exerciseName, setIdx);
        const suggestion = getSuggestedWeightAndReps(setIdx);

        return (
          <div key={setIdx} className="set-row">
            <span className="set-label">Set {setIdx + 1}</span>
            <input
              type="number"
              placeholder={suggestion.weight || 'lbs'}
              value={log.weight}
              onChange={(e) => onLogSet(exerciseName, setIdx, e.target.value, log.reps)}
              className="weight-input"
            />
            <input
              type="number"
              placeholder={suggestion.reps || 'reps'}
              value={log.reps}
              onChange={(e) => onLogSet(exerciseName, setIdx, log.weight, e.target.value)}
              className="reps-input"
            />
          </div>
        );
      })}
    </div>
  );
};
