import { useMemo } from 'react';
import './HealthDataCard.css';

const HealthDataCard = ({ date, steps, weight }) => {
  // Format date for display
  const formattedDate = useMemo(() => {
    const dateObj = new Date(date);
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  }, [date]);

  // Check if we have any data to display
  const hasData = (steps !== null && steps !== undefined) || (weight !== null && weight !== undefined);

  if (!hasData) {
    return null;
  }

  return (
    <article className="health-data-card">
      <header className="health-data-header">
        <div className="health-data-date-info">
          <div className="health-data-icon" aria-hidden="true">❤️</div>
          <div>
            <h3 className="health-data-date">{formattedDate}</h3>
            <p className="health-data-label">Health Data</p>
          </div>
        </div>
      </header>

      <section className="health-data-metrics" aria-label="Daily health metrics">
        {steps !== null && steps !== undefined && (
          <div className="health-metric-item">
            <span className="health-metric-icon" aria-hidden="true">👟</span>
            <div className="health-metric-content">
              <span className="health-metric-label">Steps</span>
              <span className="health-metric-value">{steps.toLocaleString()}</span>
            </div>
          </div>
        )}

        {weight !== null && weight !== undefined && (
          <div className="health-metric-item">
            <span className="health-metric-icon" aria-hidden="true">⚖️</span>
            <div className="health-metric-content">
              <span className="health-metric-label">Weight</span>
              <span className="health-metric-value">{weight} lbs</span>
            </div>
          </div>
        )}
      </section>
    </article>
  );
};

export default HealthDataCard;
