import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { getBrowserFingerprint } from '../../utils/browserFingerprint';
import './UserIdManager.css';

export const UserIdManager = () => {
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = getBrowserFingerprint();
    setUserId(id);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userId) return null;

  return (
    <div className="user-id-manager">
      <div className="user-id-label">Your Browser ID (auto-generated):</div>
      <div className="user-id-display">
        <code>{userId}</code>
        <button onClick={copyToClipboard} className="copy-btn" title="Copy User ID">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="user-id-note">
        This ID is generated from your browser fingerprint and persists across sessions.
      </div>
    </div>
  );
};
