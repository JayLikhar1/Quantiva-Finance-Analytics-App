import { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 40, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDisplayed('');
    setIdx(0);
  }, [text]);

  useEffect(() => {
    if (idx < text.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + text[idx]);
        setIdx((i) => i + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onDone) {
      onDone();
    }
  }, [idx, text, speed, onDone]);

  return (
    <span>
      {displayed}
      {idx < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default TypewriterText;
