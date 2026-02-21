import './RoundStart.css';

export const RoundStart = ({ roundNumber, onStart }) => {
  return (
    <div className="app">
      <header className="header">
        <h1>Shreddit</h1>
      </header>
      <main className="content">
        <div className="round-start">
          <div className="round-start-card">
            <h2>Ready to Start?</h2>
            <div className="round-number">Round {roundNumber}</div>
            <p>12 weeks of training ahead</p>
            <button className="start-btn" onClick={onStart}>
              Start Round {roundNumber}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
