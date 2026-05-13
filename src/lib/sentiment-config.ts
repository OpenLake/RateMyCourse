/**
 * Sentiment Analysis Configuration
 * Centralized configuration for sentiment analysis system
 */

export const SENTIMENT_CONFIG = {
  // Gemini API Configuration
  gemini: {
    model: 'gemini-flash-latest',
    temperature: 0.3,       // Low for consistent analysis
    topK: 20,              // Focused token selection
    topP: 0.8,             // Balanced creativity
    maxOutputTokens: 400,  // Sufficient for detailed JSON
    
    // Rate limiting
    maxRequestsPerMinute: 60,
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },
  
  // Text preprocessing
  preprocessing: {
    minCommentLength: 10,        // Minimum characters
    maxCommentLength: 2000,      // Maximum characters
    minWordCount: 3,             // Minimum words for analysis
    
    // Content filtering
    filterProfanity: true,
    detectSpam: true,
    supportedLanguages: ['en'],  // Expand later
  },
  
  // Sentiment thresholds
  thresholds: {
    // Confidence levels
    highConfidence: 0.7,
    mediumConfidence: 0.4,
    lowConfidence: 0.3,
    
    // Sentiment score mapping
    veryPositive: 4.5,    // >= 4.5 is very positive
    positive: 3.5,        // >= 3.5 is positive
    neutral: 2.5,         // >= 2.5 is neutral
    negative: 1.5,        // >= 1.5 is negative
    // < 1.5 is very negative
    
    // Emotion intensity
    strongEmotion: 0.7,
    moderateEmotion: 0.4,
    weakEmotion: 0.2,
  },
  
  // Aggregation settings
  aggregation: {
    // Cache duration for aggregated sentiment
    cacheDurationMinutes: 5,
    
    // Minimum reviews for reliable aggregation
    minReviewsForAggregation: 3,
    
    // Trend analysis
    trendWindowDays: 30,
    minReviewsForTrend: 5,
    
    // Weighting
    recentReviewWeight: 1.5,  // Weight recent reviews more
    weightDecayDays: 180,     // Decay weight over 6 months
  },
  
  // Database
  database: {
    batchSize: 50,           // Reviews per batch processing
    maxRetries: 3,
    timeout: 30000,          // 30 seconds
  },
  
  // Error handling
  errorHandling: {
    logErrors: true,
    alertOnHighFailureRate: true,
    failureRateThreshold: 0.1, // Alert if >10% fail
    queueFailedReviews: true,
    maxQueueSize: 1000,
  },
  
  // Feature flags
  features: {
    enableEmotionDetection: true,
    enableAspectSentiment: true,
    enableTrendAnalysis: true,
    enableRealtimeProcessing: true,
    enableBatchReprocessing: true,
  },
  
  // Aspect configurations
  aspects: {
    course: {
      content: {
        label: 'Content Quality',
        description: 'Quality and relevance of course material',
        keywords: ['material', 'content', 'topics', 'curriculum'],
      },
      instruction: {
        label: 'Instruction',
        description: 'Teaching effectiveness',
        keywords: ['teaching', 'lectures', 'explained', 'instructor'],
      },
      workload: {
        label: 'Workload',
        description: 'Time commitment and effort required',
        keywords: ['workload', 'time', 'hours', 'effort', 'demanding'],
      },
      difficulty: {
        label: 'Difficulty',
        description: 'Challenge level of the course',
        keywords: ['difficult', 'hard', 'easy', 'challenging', 'tough'],
      },
      assignments: {
        label: 'Assignments',
        description: 'Quality of homework and projects',
        keywords: ['assignment', 'homework', 'project', 'lab'],
      },
      exams: {
        label: 'Exams',
        description: 'Assessment quality and fairness',
        keywords: ['exam', 'test', 'quiz', 'midterm', 'final'],
      },
      practical: {
        label: 'Practical Value',
        description: 'Real-world applicability',
        keywords: ['practical', 'useful', 'applicable', 'real-world'],
      },
      interest: {
        label: 'Interest Level',
        description: 'How engaging the course is',
        keywords: ['interesting', 'boring', 'engaging', 'exciting', 'dull'],
      },
    },
    
    professor: {
      teaching: {
        label: 'Teaching Style',
        description: 'Teaching methods and approach',
        keywords: ['teaching', 'style', 'method', 'approach'],
      },
      knowledge: {
        label: 'Knowledge',
        description: 'Subject matter expertise',
        keywords: ['knowledge', 'expert', 'knows', 'understands'],
      },
      approachability: {
        label: 'Approachability',
        description: 'Accessibility to students',
        keywords: ['approachable', 'accessible', 'available', 'friendly'],
      },
      clarity: {
        label: 'Clarity',
        description: 'Quality of explanations',
        keywords: ['clear', 'explains', 'understanding', 'confusing'],
      },
      responsiveness: {
        label: 'Responsiveness',
        description: 'Communication timeliness',
        keywords: ['responsive', 'replies', 'answers', 'communication'],
      },
      fairness: {
        label: 'Fairness',
        description: 'Grading fairness perception',
        keywords: ['fair', 'grading', 'biased', 'reasonable'],
      },
      engagement: {
        label: 'Engagement',
        description: 'Student interaction quality',
        keywords: ['engaging', 'interactive', 'discussion', 'participation'],
      },
    },
  },
  
  // Emotion labels
  emotions: {
    positive: [
      { value: 'excited', label: 'Excited', icon: '🎉' },
      { value: 'inspired', label: 'Inspired', icon: '✨' },
      { value: 'satisfied', label: 'Satisfied', icon: '😊' },
      { value: 'grateful', label: 'Grateful', icon: '🙏' },
      { value: 'motivated', label: 'Motivated', icon: '💪' },
    ],
    negative: [
      { value: 'frustrated', label: 'Frustrated', icon: '😤' },
      { value: 'overwhelmed', label: 'Overwhelmed', icon: '😰' },
      { value: 'disappointed', label: 'Disappointed', icon: '😞' },
      { value: 'confused', label: 'Confused', icon: '😕' },
      { value: 'stressed', label: 'Stressed', icon: '😫' },
    ],
    neutral: [
      { value: 'indifferent', label: 'Indifferent', icon: '😐' },
      { value: 'uncertain', label: 'Uncertain', icon: '🤔' },
      { value: 'calm', label: 'Calm', icon: '😌' },
    ],
  },
  
  // Sentiment labels with colors
  sentimentLabels: {
    very_positive: {
      label: 'Very Positive',
      color: '#22c55e', // green-500
      bgColor: '#dcfce7', // green-100
      icon: '😄',
    },
    positive: {
      label: 'Positive',
      color: '#84cc16', // lime-500
      bgColor: '#ecfccb', // lime-100
      icon: '🙂',
    },
    neutral: {
      label: 'Neutral',
      color: '#eab308', // yellow-500
      bgColor: '#fef9c3', // yellow-100
      icon: '😐',
    },
    negative: {
      label: 'Negative',
      color: '#f97316', // orange-500
      bgColor: '#ffedd5', // orange-100
      icon: '😟',
    },
    very_negative: {
      label: 'Very Negative',
      color: '#ef4444', // red-500
      bgColor: '#fee2e2', // red-100
      icon: '😞',
    },
  },
};

// Export individual configurations for easier imports
export const GEMINI_CONFIG = SENTIMENT_CONFIG.gemini;
export const PREPROCESSING_CONFIG = SENTIMENT_CONFIG.preprocessing;
export const THRESHOLD_CONFIG = SENTIMENT_CONFIG.thresholds;
export const AGGREGATION_CONFIG = SENTIMENT_CONFIG.aggregation;
export const ASPECT_CONFIG = SENTIMENT_CONFIG.aspects;
export const EMOTION_CONFIG = SENTIMENT_CONFIG.emotions;
export const SENTIMENT_LABELS = SENTIMENT_CONFIG.sentimentLabels;

// Type exports for configuration
export type AspectKey = keyof typeof SENTIMENT_CONFIG.aspects.course;
export type EmotionValue = 
  | typeof SENTIMENT_CONFIG.emotions.positive[number]['value']
  | typeof SENTIMENT_CONFIG.emotions.negative[number]['value']
  | typeof SENTIMENT_CONFIG.emotions.neutral[number]['value'];
