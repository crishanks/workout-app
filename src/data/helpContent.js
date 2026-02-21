// Help content structure for searchable reference documentation
export const helpContent = {
  categories: [
    {
      id: 'terminology',
      name: 'Terminology',
      icon: 'BookOpen',
      topics: [
        {
          id: 'rpe',
          title: 'RPE (Rate of Perceived Exertion)',
          keywords: ['rpe', 'rate', 'perceived', 'exertion', 'intensity', 'effort'],
          content: 'RPE stands for Rate of Perceived Exertion. It is a subjective measure of how hard you feel you are working during exercise, typically rated on a scale from 1-10.\n\nAn RPE of 7-8 means you are working hard but could do 2-3 more reps if needed. An RPE of 9-10 means you are at or near maximum effort.',
          relatedTopics: ['rir', 'intensity'],
          categoryId: 'terminology'
        },
        {
          id: 'rir',
          title: 'RIR (Reps in Reserve)',
          keywords: ['rir', 'reps', 'reserve', 'remaining', 'left'],
          content: 'RIR stands for Reps in Reserve. It indicates how many more repetitions you could perform before reaching failure.\n\nFor example, RIR 2 means you could do 2 more reps. RIR 0 means you reached complete failure.',
          relatedTopics: ['rpe', 'intensity'],
          categoryId: 'terminology'
        }
      ]
    },
    {
      id: 'exercises',
      name: 'Exercise Instructions',
      icon: 'Dumbbell',
      topics: [
        {
          id: 'exercise-basics',
          title: 'Exercise Execution Basics',
          keywords: ['form', 'technique', 'execution', 'perform', 'how to'],
          content: 'Proper exercise execution is crucial for safety and effectiveness. Focus on controlled movements, full range of motion, and maintaining proper form throughout each repetition.\n\nAlways warm up before starting your working sets.',
          relatedTopics: [],
          categoryId: 'exercises'
        }
      ]
    },
    {
      id: 'program',
      name: 'Program Guidelines',
      icon: 'Calendar',
      topics: [
        {
          id: 'rest-days',
          title: 'Rest Days',
          keywords: ['rest', 'recovery', 'off', 'day off'],
          content: 'Rest days are essential for muscle recovery and growth. The program includes scheduled rest days to allow your body to repair and adapt to training stress.\n\nUse rest days for light activity, stretching, or complete rest as needed.',
          relatedTopics: [],
          categoryId: 'program'
        },
        {
          id: 'intensity',
          title: 'Training Intensity',
          keywords: ['intensity', 'effort', 'hard', 'heavy', 'load'],
          content: 'Training intensity refers to how hard you work during your sets. It can be measured using RPE, RIR, or percentage of your one-rep max.\n\nProper intensity management is key to making progress while avoiding overtraining.',
          relatedTopics: ['rpe', 'rir'],
          categoryId: 'program'
        }
      ]
    }
  ]
};

// Flatten all topics for easier searching
export const getAllTopics = () => {
  return helpContent.categories.flatMap(category => category.topics);
};

// Get topics by category
export const getTopicsByCategory = (categoryId) => {
  if (!categoryId || categoryId === 'all') {
    return getAllTopics();
  }
  const category = helpContent.categories.find(cat => cat.id === categoryId);
  return category ? category.topics : [];
};

// Get topic by ID
export const getTopicById = (topicId) => {
  return getAllTopics().find(topic => topic.id === topicId);
};
