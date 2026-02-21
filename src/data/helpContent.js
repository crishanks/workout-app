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
          keywords: ['rpe', 'rate', 'perceived', 'exertion', 'intensity', 'effort', 'scale', 'rating'],
          content: 'RPE stands for Rating of Perceived Exertion. It is your rating of how you perceived your exertion on a set, rated on a scale of 1-10.\n\nRPE is usually set up based on how many reps you think you had left in the tank:\n\n• RPE 10: You reached failure - you actually tried and failed to get the weight up\n• RPE 9-10: You didn\'t reach failure, but were very close (maybe 1 rep left)\n• RPE 9: You could\'ve done one more rep if you really tried\n• RPE 8-9: You could\'ve done 1 or 2 more reps - close to failure but not brutal\n• RPE 7-8: There are 2 or 3 reps in the tank\n• RPE 6-7: You have 3 or maybe 4 reps left in the tank\n\nNote: The "~" sign before RPE ratings means being off by about 1 RPE unit is normal.',
          relatedTopics: ['rir', 'failure-training', 'early-sets-last-sets'],
          categoryId: 'terminology'
        },
        {
          id: 'rir',
          title: 'RIR (Reps in Reserve)',
          keywords: ['rir', 'reps', 'reserve', 'remaining', 'left', 'tank'],
          content: 'RIR stands for Reps in Reserve. It indicates how many more repetitions you could perform before reaching failure.\n\nFor example:\n• RIR 0 = You reached complete failure\n• RIR 1 = You could do 1 more rep\n• RIR 2 = You could do 2 more reps\n\nRIR is closely related to RPE - if you have 0 reps in reserve, that corresponds to RPE 10. If you have 1 rep in reserve, that\'s RPE 9, and so on.',
          relatedTopics: ['rpe', 'failure-training'],
          categoryId: 'terminology'
        },
        {
          id: 'early-sets-last-sets',
          title: 'Early Sets vs Last Sets',
          keywords: ['early', 'last', 'sets', 'working', 'intensity', 'failure'],
          content: 'Working sets are divided into "Early Sets" and "Last Sets" to apply different intensity levels:\n\n• Early Sets: All working sets except the very last one. Usually stopped at RPE 8-9 (1-2 reps left in tank)\n• Last Sets: The final set of each exercise, taken all the way to failure (RPE 10)\n\nFor example, if an exercise calls for 3 sets:\n• Sets 1 and 2 = Early Sets (RPE 8-9)\n• Set 3 = Last Set (failure)\n\nNote: Early Sets are NOT warm-up sets - warm-ups are done separately before Early Sets.',
          relatedTopics: ['rpe', 'failure-training', 'warm-up'],
          categoryId: 'terminology'
        },
        {
          id: 'tension',
          title: 'Muscle Tension',
          keywords: ['tension', 'force', 'muscle', 'growth', 'hypertrophy', 'stimulus'],
          content: 'Tension is the main driver of muscle hypertrophy. It\'s the force created within a muscle as it is pulled and stretched during lifting, like a rope in a tug of war.\n\nWhen the muscle senses tension, anabolic signals are sent telling the muscle it needs to get bigger. Maximizing tension on the target muscle is achieved through proper technique, controlled negatives, full range of motion, and minimizing momentum.',
          relatedTopics: ['negative-tempo', 'range-of-motion', 'technique'],
          categoryId: 'terminology'
        },
        {
          id: 'progressive-overload',
          title: 'Progressive Overload',
          keywords: ['progressive', 'overload', 'progression', 'increase', 'weight', 'reps', 'volume'],
          content: 'Progressive overload is when you increase some training variable over time. It\'s crucial for continued progress because you need to continually provide the muscle with a new stimulus to adapt to.\n\nMain methods of progressive overload:\n• Adding reps (within the given rep range)\n• Adding weight (once you max out the rep range)\n• Improving form and technique\n• Improving mind-muscle connection\n\nFor exercises with rep ranges (e.g., 10-12 reps), use double progression: first max out the reps, then add weight and drop back to the bottom of the range.',
          relatedTopics: ['double-progression', 'rep-ranges'],
          categoryId: 'terminology'
        },
        {
          id: 'double-progression',
          title: 'Double Progression',
          keywords: ['double', 'progression', 'reps', 'weight', 'increase', 'advance'],
          content: 'Double progression means progressing both reps and weight, in that order.\n\nExample with Cable Crunches (2 sets of 10-12 reps):\n1. Week 1: Get 10 reps on both sets\n2. Week 2: Try to add a rep to at least one set\n3. Continue adding reps until you get 12 reps on both sets\n4. Once you max out at 12 reps, add weight and drop back to 10 reps\n5. Repeat the process\n\nOnly add weight once you\'ve maxed out the top end of the rep range.',
          relatedTopics: ['progressive-overload', 'rep-ranges'],
          categoryId: 'terminology'
        },
        {
          id: 'llp',
          title: 'LLP (Long-Length Partials)',
          keywords: ['llp', 'lengthened', 'partials', 'stretch', 'partial', 'reps', 'bottom'],
          content: 'Long-Length Partials (LLPs) are partial reps performed in the stretched/lengthened aspect of the lift.\n\nExamples:\n• Pendlay deficit rows: Come about halfway up, doing partial reps in the bottom part\n• Seated leg curl: Partial reps in the top half where the leg is more straight\n\nResearch shows the stretched aspect of a lift is better for hypertrophy than the squeezed aspect. LLPs allow you to spend more time in the most hypertrophic part of the range of motion.\n\nIn this program, LLPs are often used to extend the last set beyond failure, or some exercises use "bottom-half" variations where all reps are lengthened partials.',
          relatedTopics: ['intensity-techniques', 'range-of-motion', 'stretch'],
          categoryId: 'terminology'
        },
        {
          id: 'myo-reps',
          title: 'Myo-Reps',
          keywords: ['myo', 'reps', 'rest-pause', 'mini', 'rest', 'extend', 'set'],
          content: 'Myo-reps extend a set beyond failure by taking short mini-rests and cranking out extra reps between mini-rests.\n\nExample protocol:\n1. Do your set to failure (e.g., 10-12 reps)\n2. Rest for ~5 seconds\n3. Do another 3-4 reps\n4. Rest for another ~5 seconds\n5. Do another 3-4 reps\n6. Repeat until you can no longer get at least 3 reps\n\nMyo-reps are great because they allow you to squeeze out extra reps while the muscle is near full exhaustion. The reps close to the end of a set are more "effective" for muscle growth.',
          relatedTopics: ['intensity-techniques', 'failure-training'],
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
          id: 'technique',
          title: 'Proper Exercise Technique',
          keywords: ['technique', 'form', 'execution', 'perform', 'how to', 'proper'],
          content: 'Good and consistent technique is essential for applying tension to the target muscle. Key principles:\n\n• Controlled negatives: Use a 2-4 second negative on most exercises - slower than most people do, but not super slow\n• Explosive positives: Move the weight more explosively on the way up (except on exercises like cable flyes and kickbacks)\n• Full range of motion: Get to the deepest, most-stretched aspect of the range\n• Minimize momentum: Stay in control of the weight, avoid swinging and cheating\n• Consistency: Keep your form consistent week to week for accurate progression\n\nWatch the exercise demo videos for specific tempo and technique cues for each movement.',
          relatedTopics: ['negative-tempo', 'range-of-motion', 'tension'],
          categoryId: 'exercises'
        },
        {
          id: 'negative-tempo',
          title: 'Negative (Eccentric) Tempo',
          keywords: ['negative', 'eccentric', 'tempo', 'lower', 'control', 'slow'],
          content: 'A controlled, slightly slower negative is a pillar of good technique. Research indicates the eccentric (negative) phase is more important for hypertrophy than the concentric (positive) phase.\n\nGuidelines:\n• Use a 2-4 second negative on most exercises\n• Treat the negative as if it were a "failed positive" - resist the weight as it moves down\n• Really feel the muscle stretch as you lower the weight\n• Don\'t just let the weight free fall\n\nThis creates much more eccentric tension than allowing the weight to drop quickly.',
          relatedTopics: ['technique', 'tension', 'range-of-motion'],
          categoryId: 'exercises'
        },
        {
          id: 'range-of-motion',
          title: 'Range of Motion and Stretch',
          keywords: ['range', 'motion', 'rom', 'stretch', 'deep', 'bottom', 'lengthened'],
          content: 'Research shows that getting to the deepest, most-stretched aspect of the range of motion is what really matters for hypertrophy. The stretch is more important than the squeeze.\n\nExamples:\n• The bottom half of a squat is more important than the top half\n• The bottom half of a cable curl is more important than the top half\n• You need to get the muscle stretched while lifting\n\nRegularly ask yourself if you\'re getting a deep stretch at the bottom of each exercise. If not, you may be missing out on gains.',
          relatedTopics: ['technique', 'llp', 'stretch'],
          categoryId: 'exercises'
        },
        {
          id: 'momentum',
          title: 'Controlling Momentum',
          keywords: ['momentum', 'cheating', 'swinging', 'control', 'tension', 'form'],
          content: 'Minimizing momentum and swinging is crucial for keeping tension on the target muscle. You can get the weight from point A to B without actually applying much tension to the target muscle.\n\nExample: Bicep curls with excessive leaning forward and backward takes tension away from the biceps and disperses it onto the lower back.\n\nKey points:\n• Always be in control of the weight\n• Minimize momentum and swinging\n• Keep your target muscle in mind\n• Don\'t alter your form just to add weight - that\'s fake progression',
          relatedTopics: ['technique', 'tension', 'progressive-overload'],
          categoryId: 'exercises'
        },
        {
          id: 'warm-up',
          title: 'Warm-Up Protocol',
          keywords: ['warm', 'up', 'warmup', 'preparation', 'general', 'specific', 'sets'],
          content: 'Perform a full general warm-up and exercise-specific warm-up every workout (should take 5-10 mins max).\n\nGeneral Warm-Up:\n• 5-10 minutes light cardio\n• Arm swings (10 reps per side)\n• Arm circles (10 reps per side)\n• Front-to-back leg swings (10 reps per side)\n• Side-to-side leg swings (10 reps per side)\n\nExercise-Specific Warm-Up:\n• 1 warm-up set: ~60% of working weight for 6-10 reps\n• 2 warm-up sets: ~50% for 6-10 reps, then ~70% for 4-6 reps\n• 3 warm-up sets: ~45% for 6-10 reps, ~65% for 4-6 reps, ~85% for 3-4 reps\n• 4 warm-up sets: ~45%, ~60%, ~75%, ~85% with decreasing reps',
          relatedTopics: ['early-sets-last-sets'],
          categoryId: 'exercises'
        },
        {
          id: 'mind-muscle',
          title: 'Mind-Muscle Connection',
          keywords: ['mind', 'muscle', 'connection', 'feel', 'focus', 'concentration', 'activation'],
          content: 'The mind-muscle connection refers to consciously focusing on feeling the target muscle working during an exercise.\n\nResearch has shown that improving the mind-muscle connection can increase hypertrophy in some cases, especially on isolation exercises.\n\nWhile not as effective as adding reps or weight, it\'s worth keeping in mind as an overload option, particularly when adding reps and weight becomes impractical at a certain point of strength development.\n\nFocus on really feeling the muscle working and contracting throughout each rep.',
          relatedTopics: ['progressive-overload', 'technique'],
          categoryId: 'exercises'
        },
        {
          id: 'machines-vs-free-weights',
          title: 'Machines vs Free Weights',
          keywords: ['machines', 'free', 'weights', 'cables', 'equipment', 'smith', 'barbell'],
          content: 'Research shows machines are at least equally effective as free weights for building muscle, and may be superior in some cases.\n\nAdvantages of machines:\n• Higher stability = better force transfer to target muscle\n• Fewer warm-up sets needed\n• Safer to push to failure\n• Better resistance profiles (more even tension throughout ROM)\n• Continuous tension (especially cables)\n\nFree weight advantages:\n• More accessible\n• Better strength carryover\n• Activate stabilizers better\n• More versatile\n\nThis program emphasizes machines and cables but includes free weights. All exercises have free weight substitution options.',
          relatedTopics: ['technique', 'tension'],
          categoryId: 'exercises'
        },
        {
          id: 'static-stretching',
          title: 'Static Stretching',
          keywords: ['static', 'stretch', 'stretching', 'hold', 'inter-set', 'calves'],
          content: 'Static stretching involves holding a stretch in a fixed position. In this program, you\'ll hold specific stretches for certain muscles after the last set of an exercise.\n\nResearch shows inter-set stretching can enhance muscle growth for certain muscles, particularly the calves. Studies are mixed, with the effect likely being muscle-specific.\n\nGuidelines:\n• Only stretch after the last set (won\'t impact performance)\n• Hold stretches for 30 seconds\n• Stretches longer than 60 seconds may hurt performance\n• Focus on calves primarily in this program',
          relatedTopics: ['intensity-techniques', 'calves'],
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
          id: 'training-split',
          title: 'Training Split (5x Per Week)',
          keywords: ['split', 'schedule', 'frequency', 'upper', 'lower', 'push', 'pull', 'legs'],
          content: 'This program follows an Upper/Lower/Pull/Push/Legs split, training 5 days per week.\n\nWeekly Schedule:\n• Monday: Upper (Strength Focus)\n• Tuesday: Lower (Strength Focus)\n• Wednesday: Rest\n• Thursday: Pull (Hypertrophy Focus)\n• Friday: Push (Hypertrophy Focus)\n• Saturday: Legs (Hypertrophy Focus)\n• Sunday: Rest\n\nWhy 5x per week? It strikes the ideal balance between volume and recovery. Training muscle groups twice per week is beneficial once volume exceeds 6-8 sets per session.',
          relatedTopics: ['rest-recovery', 'volume'],
          categoryId: 'program'
        },
        {
          id: 'training-blocks',
          title: 'Training Blocks',
          keywords: ['blocks', 'foundation', 'ramping', 'phases', 'periodization', 'structure'],
          content: 'The program is divided into two training blocks:\n\nFoundation Block (5 weeks):\n• Consistent volume after intro week\n• Establishes baseline for progression\n• Focus on exercise mastery\n\nRamping Block (7 weeks):\n• Progressive volume increases after intro week\n• Weeks 7-8: Volume increases from baseline\n• Weeks 9-10: Volume increases again\n• Weeks 11-12: Final volume increase\n\nBoth blocks begin with an intro/deload week to familiarize yourself with new exercises. Research shows progressively increasing volume over time may be more effective than keeping it static.',
          relatedTopics: ['volume', 'deload', 'progression'],
          categoryId: 'program'
        },
        {
          id: 'failure-training',
          title: 'Training to Failure',
          keywords: ['failure', 'last', 'set', 'intensity', 'effort', 'maximum'],
          content: 'Every exercise goes to failure on the last set in this program (except during intro/deload weeks).\n\nReasons for failure training:\n• Reinforces what "all out" truly means\n• Helps you better estimate sub-maximal RPEs\n• Standardizes effort scientifically\n• Given mixed evidence on failure benefits, better to err on the side of pushing to failure\n\nFailure means you attempted and failed to get the weight all the way up with good form. Early sets are typically stopped at RPE 8-9 (1-2 reps shy of failure).',
          relatedTopics: ['rpe', 'rir', 'early-sets-last-sets'],
          categoryId: 'program'
        },
        {
          id: 'intensity-techniques',
          title: 'Intensity Techniques',
          keywords: ['intensity', 'techniques', 'advanced', 'methods', 'failure', 'partials', 'myo'],
          content: 'Intensity techniques are used to extend sets beyond normal failure or emphasize certain aspects of an exercise.\n\nTechniques used in this program:\n• Failure: Taking the last set to complete failure\n• Long-Length Partials (LLPs): Partial reps in the stretched position\n• Static Stretches: Holding stretches after the last set\n• Myo-reps: Short rest periods with additional mini-sets\n\nThese techniques are applied to the last set of exercises as indicated in the program. They help maximize muscle growth by increasing time under tension and effective reps.',
          relatedTopics: ['failure-training', 'llp', 'myo-reps', 'static-stretching'],
          categoryId: 'program'
        },
        {
          id: 'rest-recovery',
          title: 'Rest Periods and Recovery',
          keywords: ['rest', 'recovery', 'periods', 'between', 'sets', 'days', 'off'],
          content: 'Rest Days:\nThe program includes 2 rest days per week (Wednesday and Sunday). Rest days are essential for muscle recovery and growth, allowing your body to repair and adapt to training stress.\n\nRest Periods Between Sets:\n• You don\'t need to time rest periods precisely\n• Longer rest periods are generally better for hypertrophy\n• Rest long enough to feel recovered between sets\n• Don\'t rest so long that you lose focus\n• Rough guidelines are provided in the program\n\nUse rest days for light activity, stretching, or complete rest as needed.',
          relatedTopics: ['training-split', 'volume'],
          categoryId: 'program'
        },
        {
          id: 'volume',
          title: 'Training Volume',
          keywords: ['volume', 'sets', 'total', 'weekly', 'amount', 'workload'],
          content: 'Training volume refers to the total amount of work performed, typically measured in sets per muscle group per week.\n\nProgram Volume:\n• Foundation Block: Consistent volume after intro week\n• Ramping Block: Progressive increases every 2 weeks\n• Volume is carefully calibrated for intermediate-advanced lifters\n\nResearch shows volume matters for muscle growth up to a point. This program\'s volume is in line with science-based recommendations from high-level natural bodybuilding coaches.\n\nBefore adding volume, ensure your intensity/effort is on point - are you truly pushing the last set to failure?',
          relatedTopics: ['training-blocks', 'failure-training', 'progressive-overload'],
          categoryId: 'program'
        },
        {
          id: 'deload',
          title: 'Deload and Intro Weeks',
          keywords: ['deload', 'intro', 'recovery', 'light', 'week', 'rpe', 'lower'],
          content: 'Intro/Deload weeks occur at the start of each training block and when looping the program.\n\nCharacteristics:\n• Most sets taken to RPE 7-9 (leaving 1-3 reps in tank)\n• Lower intensity than normal training weeks\n• Allows familiarization with new exercises\n• Provides recovery before ramping up intensity\n\nAfter the first week of each block, intensity increases and you\'ll start taking the last set of every exercise to failure.\n\nThe program loops seamlessly - after Week 12, jump back to Week 1 which serves as a deload.',
          relatedTopics: ['rpe', 'training-blocks', 'failure-training'],
          categoryId: 'program'
        },
        {
          id: 'exercise-substitutions',
          title: 'Exercise Substitutions',
          keywords: ['substitutions', 'alternatives', 'swap', 'replace', 'options', 'equipment'],
          content: 'Each exercise has two substitution options. Suitable reasons for substituting:\n• You don\'t have access to the main exercise equipment\n• The main exercise causes you pain\n• You really dislike the main exercise (but love a substitution)\n• You don\'t "feel" the main exercise working after several weeks\n\nLess suitable reasons:\n• You haven\'t done it before (give it a shot!)\n• Someone is using the equipment (come back to it later)\n• The main exercise is harder (don\'t always choose the easiest option)\n\nTry to do the main exercise if possible - they were carefully selected for tension profile, long muscle length bias, and stimulus-to-fatigue ratio.',
          relatedTopics: ['machines-vs-free-weights'],
          categoryId: 'program'
        },
        {
          id: 'tracking',
          title: 'Progress Tracking',
          keywords: ['tracking', 'progress', 'measure', 'weight', 'reps', 'photos', 'bodyweight'],
          content: 'Three main tools for tracking progress:\n\n1. Strength Performance (Most Important):\n• Track weight and reps for all exercises\n• Gaining strength = gaining muscle\n• "Beat the logbook" each week\n\n2. Progress Photos:\n• Take photos every 2-3 months\n• Use same camera, background, lighting\n• Front, side, and rear views\n\n3. Bodyweight:\n• Bulking: Gain 1-2% bodyweight per month\n• Cutting: Lose 0.5-1% bodyweight per week\n• Recomp: Maintain bodyweight\n• Track weekly averages, not individual weigh-ins\n\nMeticulous tracking of weights makes a big difference in progress.',
          relatedTopics: ['progressive-overload', 'nutrition'],
          categoryId: 'program'
        },
        {
          id: 'rep-ranges',
          title: 'Rep Ranges',
          keywords: ['rep', 'range', 'reps', 'repetitions', 'count', 'target'],
          content: 'Most exercises provide a rep range (e.g., 10-12 reps) rather than a fixed rep count.\n\nHow to use rep ranges:\n1. Pick a weight that challenges you for the bottom of the range\n2. Try to add reps each week\n3. Once you hit the top of the range on all sets, add weight\n4. Drop back to the bottom of the range with the new weight\n5. Repeat the process\n\nThis is called double progression. Some exercises have fixed rep counts - just try to add weight when possible while maintaining good form.',
          relatedTopics: ['double-progression', 'progressive-overload'],
          categoryId: 'program'
        },
        {
          id: 'soreness',
          title: 'Muscle Soreness',
          keywords: ['soreness', 'doms', 'sore', 'pain', 'recovery', 'delayed'],
          content: 'Muscle soreness is NOT required for hypertrophy and isn\'t a reliable indicator of an effective workout.\n\nKey points:\n• Reduced soreness over time can indicate your body is adapting\n• Many activities cause soreness without building muscle\n• If pushing hard with good form, don\'t chase soreness\n• Foam rolling may help reduce soreness\n\nTraining while sore:\n• Mild soreness: Perform a longer warm-up and continue\n• Severe soreness: Skip exercises where you can\'t achieve full ROM\n• Increased soreness is normal when starting the program\n\nFocus on performance metrics (strength, reps) rather than soreness.',
          relatedTopics: ['tracking', 'rest-recovery'],
          categoryId: 'program'
        },
        {
          id: 'nutrition',
          title: 'Nutrition Guidelines',
          keywords: ['nutrition', 'diet', 'calories', 'protein', 'carbs', 'fats', 'macros', 'eating'],
          content: 'Basic nutrition setup for bodybuilding:\n\nCalories:\n• Bulking: 5-15% surplus (maintenance + 125-375 cal)\n• Maintenance/Recomp: At maintenance\n• Cutting: 5-15% deficit (maintenance - 125-375 cal)\n• Estimate maintenance: bodyweight (lbs) × 14-18\n\nProtein:\n• Bulking/Maintenance: 0.7-1g per lb bodyweight\n• Cutting: 0.8-1.2g per lb bodyweight\n• Or use height in cm as grams (e.g., 180cm = 180g)\n\nFats: 20-30% of total calories\nCarbs: Remaining calories after protein and fats\n\nConsider using MacroFactor app for automated tracking and adjustments.',
          relatedTopics: ['tracking', 'supplements'],
          categoryId: 'program'
        },
        {
          id: 'supplements',
          title: 'Supplements',
          keywords: ['supplements', 'creatine', 'protein', 'powder', 'caffeine', 'pre-workout'],
          content: 'Supplements make up a tiny part of your success. Recommended supplements:\n\nCreatine Monohydrate:\n• Take 5 grams (1 tsp) per day\n• Can take at any time of day\n• Most researched and effective supplement\n\nProtein Powder:\n• Take as needed to hit daily protein goals\n• Convenient, not required if hitting protein through food\n\nCaffeine (Optional):\n• ~150-250mg, 30-60 minutes before training\n• Use when feeling more tired than usual\n• Not necessary for every workout\n\nFocus on training and nutrition first - supplements are supplemental.',
          relatedTopics: ['nutrition'],
          categoryId: 'program'
        },
        {
          id: 'cardio',
          title: 'Cardio and Conditioning',
          keywords: ['cardio', 'conditioning', 'aerobic', 'hiit', 'running', 'cycling'],
          content: 'Cardio guidelines for this program:\n\nGeneral Recommendations:\n• Keep cardio to an effective minimum\n• Prioritize caloric deficit from diet, not cardio\n• 4-5 low-moderate intensity sessions per week, 20-30 minutes\n• High-intensity cardio: 1-2x per week maximum\n\nCardio won\'t kill your gains, but excessive cardio can interfere with recovery. Monitor your progress - if you\'re progressing fine, your cardio level is okay. If progress slows and you feel very fatigued, cut back on cardio.\n\nThe main point of cardio from a bodybuilding standpoint is to establish a caloric deficit for fat loss.',
          relatedTopics: ['rest-recovery', 'nutrition'],
          categoryId: 'program'
        },
        {
          id: 'long-muscle-length',
          title: 'Long Muscle Length Focus',
          keywords: ['long', 'length', 'stretch', 'lengthened', 'position', 'bias'],
          content: 'This program emphasizes exercises that place tension on muscles in their most stretched position.\n\nResearch shows training at long muscle lengths is optimal for hypertrophy. The program includes many exercises with this bias:\n\n• Pendlay Deficit Row\n• DB Bulgarian Split Squat\n• 1-Arm 45° Cable Rear Delt Flye\n• High-Cable Lateral Raise\n• Overhead Cable Triceps Extension\n• Smith Machine Static Lunge w/ Elevated Front Foot\n• 45° Hyperextension\n\nThese exercises load the muscle while it\'s being stretched, maximizing the hypertrophic stimulus.',
          relatedTopics: ['llp', 'range-of-motion', 'technique'],
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
