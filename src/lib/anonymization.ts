export const sanitizeContent = (content: string): string => {
  let sanitized = content.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL REMOVED]',
  );

  sanitized = sanitized.replace(
    /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    '[PHONE REMOVED]',
  );

  sanitized = sanitized.replace(
    /(?:I am|I'm|my name is|this is) ([A-Z][a-z]+ [A-Z][a-z]+)/g,
    'I am [NAME REMOVED]',
  );

  return sanitized;
};

export const createFuzzyTimestamp = (date: Date = new Date()): string => {
  const hour = Math.floor(date.getHours() / 3) * 3;
  const timeRanges = ['morning', 'afternoon', 'evening', 'night'];
  const timeOfDay = timeRanges[Math.floor(hour / 6)];

  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}, ${timeOfDay}`;
};

export const enhancedSanitizeContent = (content: string): string => {
  let sanitized = content;

  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    '[EMAIL REMOVED]',
  );

  sanitized = sanitized.replace(
    /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    '[PHONE REMOVED]',
  );

  sanitized = sanitized.replace(
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    '[SSN REMOVED]',
  );

  const namePatterns = [
    /(?:I am|I'm|my name is|this is|I go by) ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)/g,
    /(?:sincerely|regards|from|signed),? ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)/gi,
    /\b(?:Professor|Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.) ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)/g,
  ];

  namePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, (match, name) => match.replace(name, '[NAME REMOVED]'));
  });

  sanitized = sanitized.replace(
    /\b(student id|id number|id#):? *\d+\b/gi,
    '[STUDENT ID REMOVED]',
  );

  sanitized = sanitized.replace(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
    '[URL REMOVED]',
  );

  const termPatterns = [
    /\b(Spring|Fall|Summer|Winter) (20\d{2})\b/g,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.? (20\d{2})\b/g,
  ];

  termPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[TERM REMOVED]');
  });

  sanitized = sanitized.replace(
    /\b([A-Z]{2,4})\s*[-]?\s*(\d{3}[A-Z]?)\s*[-]?\s*(\d{1,3})\b/g,
    '[COURSE ID REMOVED]',
  );

  return sanitized;
};
