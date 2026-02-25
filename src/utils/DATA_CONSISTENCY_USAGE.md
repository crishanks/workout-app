# Data Consistency Validation Usage Guide

This guide explains how to use the data consistency validation utilities in your components.

## Overview

The data consistency validator provides utilities to:
- Validate that health data and workouts fall within round boundaries
- Handle missing round context gracefully
- Provide user-friendly error messages
- Log data inconsistencies for debugging
- Filter data to only include entries within a round

## Basic Usage

### 1. Validating Health Data in a Component

```javascript
import { useHealthData } from '../hooks/useHealthData';
import { useRoundData } from '../hooks/useRoundData';

function HealthProgressComponent() {
  const { getValidatedHealthDataForRound } = useHealthData();
  const { roundStartDate, roundEndDate, isValid, validationErrors } = useRoundData();

  // Check if round context is valid
  if (!isValid) {
    return (
      <div className="error-message">
        <p>Unable to load health data</p>
        <p>{validationErrors.join(', ')}</p>
        <button onClick={() => startRound(1)}>Start Round</button>
      </div>
    );
  }

  // Get validated health data
  const { data, excluded, validation, userMessage } = 
    getValidatedHealthDataForRound(roundStartDate, roundEndDate);

  // Show user-friendly message if there are issues
  if (userMessage) {
    return (
      <div className="warning-message">
        <p>{userMessage}</p>
      </div>
    );
  }

  // Use the validated data
  return (
    <div>
      <h2>Health Progress</h2>
      {data.map(entry => (
        <div key={entry.date}>
          {entry.date}: {entry.steps} steps
        </div>
      ))}
      {excluded.length > 0 && (
        <p className="info">
          {excluded.length} entries outside current round
        </p>
      )}
    </div>
  );
}
```

### 2. Using handleMissingContext for Fallback Behavior

```javascript
import { useRoundData } from '../hooks/useRoundData';

function StatsComponent() {
  const { 
    roundStartDate, 
    isValid, 
    handleMissingContext 
  } = useRoundData();

  // Handle missing round context
  if (!isValid || !roundStartDate) {
    const { data, error, shouldShowPrompt } = 
      handleMissingContext('StatsComponent', 'stats');
    
    return (
      <div>
        <p>{error}</p>
        {shouldShowPrompt && (
          <button onClick={() => startRound(1)}>
            Start Your First Round
          </button>
        )}
        {/* Show fallback data */}
        <div>
          <p>Total Workouts: {data.totalWorkouts}</p>
          <p>Consistency: {data.consistency}%</p>
        </div>
      </div>
    );
  }

  // Normal component rendering with valid round context
  return <div>...</div>;
}
```

### 3. Filtering Data by Round

```javascript
import { filterDataByRound } from '../utils/dataConsistencyValidator';
import { useRoundData } from '../hooks/useRoundData';

function TimelineComponent() {
  const { roundStartDate, roundEndDate } = useRoundData();
  const [allData, setAllData] = useState([]);

  // Filter data to current round
  const { filtered, excluded } = filterDataByRound(
    allData, 
    roundStartDate, 
    roundEndDate
  );

  return (
    <div>
      <h2>Timeline (Current Round)</h2>
      {filtered.map(entry => (
        <div key={entry.date}>{entry.date}</div>
      ))}
      
      {excluded.length > 0 && (
        <details>
          <summary>
            {excluded.length} entries from other rounds
          </summary>
          {excluded.map(entry => (
            <div key={entry.date}>
              {entry.date} - {entry.reason}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
```

### 4. Comprehensive Data Validation

```javascript
import { validateDataConsistency } from '../utils/dataConsistencyValidator';
import { useRoundData } from '../hooks/useRoundData';
import { useHealthData } from '../hooks/useHealthData';
import { useSupabaseWorkoutHistory } from '../hooks/useSupabaseWorkoutHistory';

function UnifiedHistoryComponent() {
  const roundContext = useRoundData();
  const { healthData } = useHealthData();
  const { workouts } = useSupabaseWorkoutHistory();

  // Validate all data sources
  const validationResults = validateDataConsistency({
    roundContext,
    healthData,
    workouts
  });

  // Check overall validity
  if (!validationResults.overall.isValid) {
    return (
      <div className="error">
        <h3>Data Validation Errors</h3>
        <ul>
          {validationResults.overall.errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Show warnings if any
  if (validationResults.overall.warnings.length > 0) {
    console.warn('Data validation warnings:', validationResults.overall.warnings);
  }

  // Render component with validated data
  return <div>...</div>;
}
```

## API Reference

### validateHealthDataInRound(healthData, roundStartDate, roundEndDate)

Validates that health data entries fall within round boundaries.

**Returns:**
```javascript
{
  isValid: boolean,
  errors: string[],
  warnings: string[],
  metadata: {
    totalEntries: number,
    entriesOutsideRound: number,
    outsideRoundData: Array
  }
}
```

### validateWorkoutsInRound(workouts, roundStartDate, roundEndDate)

Validates that workout sessions fall within round boundaries and have correct week numbers.

**Returns:** Same structure as `validateHealthDataInRound`

### validateRoundContext(roundContext)

Validates that round context has all required fields and valid values.

**Returns:** Validation result with errors and warnings

### getUserFriendlyErrorMessage(validationResult, context)

Converts validation errors into user-friendly messages.

**Returns:** `string | null`

### createFallbackData(dataType)

Creates fallback data when round context is missing.

**Supported types:** `'health'`, `'workout'`, `'stats'`, `'round'`

**Returns:** Object with fallback data and message

### filterDataByRound(data, roundStartDate, roundEndDate)

Filters data array to only include entries within round boundaries.

**Returns:**
```javascript
{
  filtered: Array,  // Data within round
  excluded: Array   // Data outside round with reasons
}
```

### handleMissingRoundContext(componentName, dataType)

Handles missing round context with appropriate fallback.

**Returns:**
```javascript
{
  data: Object,           // Fallback data
  error: string,          // User-friendly error message
  shouldShowPrompt: boolean  // Whether to show "start round" prompt
}
```

## Logging

The validator includes a built-in logger that tracks all validation issues:

```javascript
import { consistencyLogger } from '../utils/dataConsistencyValidator';

// Get all logs
const allLogs = consistencyLogger.getLogs();

// Get logs by level
const errors = consistencyLogger.getLogs('error');
const warnings = consistencyLogger.getLogs('warn');

// Clear logs
consistencyLogger.clearLogs();

// Disable console output (useful for tests)
consistencyLogger.enabled = false;
```

## Best Practices

1. **Always validate round context first** before attempting to load data
2. **Use user-friendly error messages** from `getUserFriendlyErrorMessage`
3. **Provide fallback UI** when round context is missing
4. **Log validation warnings** but don't block the UI
5. **Filter data by round** when displaying historical information
6. **Check validation results** before performing calculations

## Error Handling Patterns

### Pattern 1: Early Return with Error Message

```javascript
if (!roundContext.isValid) {
  return <ErrorMessage errors={roundContext.validationErrors} />;
}
```

### Pattern 2: Fallback Data with Warning

```javascript
const { data, userMessage } = getValidatedHealthDataForRound(roundStartDate);
if (userMessage) {
  showWarning(userMessage);
}
// Continue with data (may be empty)
```

### Pattern 3: Graceful Degradation

```javascript
if (!roundStartDate) {
  const fallback = handleMissingContext('MyComponent', 'health');
  return <FallbackView data={fallback.data} message={fallback.error} />;
}
```

## Testing

When testing components that use validation:

```javascript
import { consistencyLogger } from '../utils/dataConsistencyValidator';

beforeEach(() => {
  consistencyLogger.clearLogs();
  consistencyLogger.enabled = false; // Disable console output
});

it('should handle invalid round context', () => {
  // Test with invalid context
  const { result } = renderHook(() => useRoundData(), {
    wrapper: ({ children }) => (
      <MockProvider roundData={null}>{children}</MockProvider>
    )
  });

  expect(result.current.isValid).toBe(false);
  expect(result.current.validationErrors).toContain('No active round');
});
```
