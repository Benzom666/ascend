import React from 'react';

/**
 * Reusable timer progress bar component
 * Shows a gradient progress bar that fills based on time remaining
 * 
 * @param {number} totalSeconds - Total duration in seconds
 * @param {number} remainingSeconds - Remaining time in seconds
 * @param {boolean} showLabel - Whether to show the time remaining label
 * @param {function} formatTime - Optional custom time formatter
 * @param {string|null} label - Optional fixed label text (overrides formatTime output)
 * @param {number} maxWidth - Max width of the bar
 * @param {number} height - Height of the bar in px
 */
const TimerProgressBar = ({ 
  totalSeconds, 
  remainingSeconds, 
  showLabel = false,
  formatTime = null,
  label = null,
  maxWidth = 280,
  height = 6,
}) => {
  // Calculate progress percentage (0-100)
  const progress = totalSeconds > 0 
    ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
    : 0;

  // Default time formatter (HH:MM:SS)
  const defaultFormatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const timeFormatter = formatTime || defaultFormatTime;
  return (
    <div className="timer-progress-container">
      {showLabel && (
        <div className="timer-progress-label">
          {label || timeFormatter(remainingSeconds)}
        </div>
      )}
      <div className="timer-progress-wrapper">
        <div className="timer-progress-bg" aria-hidden="true" />
        <div
          className="timer-progress-fill"
          aria-hidden="true"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <style jsx>{`
        .timer-progress-container {
          width: 100%;
          margin: 8px 0;
        }

        .timer-progress-label {
          font-size: 13px;
          color: #CCCCCC;
          margin-bottom: 6px;
          text-align: center;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .timer-progress-wrapper {
          width: 100%;
          max-width: ${maxWidth}px;
          height: ${height}px;
          position: relative;
          display: flex;
          align-items: center;
          margin: 0 auto;
          overflow: visible;
        }

        .timer-progress-bg {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: ${height}px;
          background: linear-gradient(90deg, #979797 0%, rgba(23, 18, 255, 0.4) 100%);
          opacity: 0.3;
          border-radius: 999px;
        }

        .timer-progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: ${height}px;
          background: linear-gradient(90deg, #1712ff 0%, #f24462 48.87%, #ff007a 100%);
          border-radius: 999px;
          pointer-events: none;
          box-shadow: 0 0 10px rgba(255, 0, 122, 0.5);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default TimerProgressBar;
