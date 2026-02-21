import './TopicCard.css';

export const TopicCard = ({
  topic,
  isExpanded,
  onToggle,
  searchQuery = '',
  onRelatedTopicClick
}) => {
  // Highlight search terms in content
  const highlightText = (text, query) => {
    if (!query || query.trim() === '') {
      return text;
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase());
      return isMatch ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : (
        part
      );
    });
  };

  const hasRelatedTopics = topic.relatedTopics && topic.relatedTopics.length > 0;

  return (
    <div className={`topic-card ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className={`topic-header ${isExpanded ? 'expanded' : ''}`} 
        onClick={onToggle}
      >
        <h3>{highlightText(topic.title, searchQuery)}</h3>
        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="topic-details">
          <div className="topic-content">
            {topic.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx}>{highlightText(paragraph, searchQuery)}</p>
              )
            ))}
          </div>

          {hasRelatedTopics && (
            <div className="related-topics">
              <span className="related-label">Related:</span>
              <div className="related-chips">
                {topic.relatedTopics.map((relatedId) => (
                  <button
                    key={relatedId}
                    className="related-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRelatedTopicClick?.(relatedId);
                    }}
                  >
                    {relatedId.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
