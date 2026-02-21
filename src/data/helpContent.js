export const helpContent = {
  categories: [
    {
      id: 'terminology',
      name: 'Terminology',
      icon: 'BookOpen',
      topics: []
    },
    {
      id: 'training-principles',
      name: 'Training Principles',
      icon: 'Target',
      topics: []
    },
    {
      id: 'program-guide',
      name: 'Program Guide',
      icon: 'FileText',
      topics: []
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: 'Apple',
      topics: []
    },
    {
      id: 'exercises',
      name: 'Exercise Info',
      icon: 'Dumbbell',
      topics: []
    }
  ]
};

// Terminology Topics
helpContent.categories[0].topics = [
  {
    id: 'rpe',
    title: 'RPE (Rate of Perceived Exertion)',
    keywords: ['rpe', 'rate', 'perceived', 'exertion', 'intensity', 'effort', 'hard'],
    content: `RPE stands for Rating of Perceived Exertion. It's how you rate how hard a set felt on a scale of 1-10.

**RPE Scale:**
• RPE 10: Reached failure - you tried and failed to get the weight up
• RPE 9-10: You didn't reach failure, but were very close (maybe 1 rep left)
• RPE 9: You could've done one more rep if you really tried
• RPE 8-9: You could've done 1 or 2 more reps (didn't feel brutal but close to failure)
• RPE 7-8: There are 2 or 3 reps in the tank
• RPE 6-7: You have 3 or maybe 4 reps left in the tank
• RPE 1-4: More than 5 reps left (warm-up sets)

The "~" sign before RPE ratings means being off by about 1 RPE unit is normal. Just do your best to be within +/- 1 RPE.`,
    relatedTopics: ['rir', 'failure-training', 'progressive-overload'],
    categoryId: 'terminology'
  },
  {
    id: 'rir',
    title: 'RIR (Reps in Reserve)',
    keywords: ['rir', 'reps', 'reserve', 'tank', 'left'],
    content: `RIR stands for Reps in Reserve - how many more reps you think you had left in the tank after completing a set.

**RIR Scale:**
• 0 RIR = RPE 10 (failure, no reps left)
• 1 RIR = RPE 9 (1 rep left in tank)
• 2 RIR = RPE 8 (2 reps left in tank)
• 3 RIR = RPE 7 (3 reps left in tank)

RIR is just another way to express RPE. Most coaches use RPE, but they mean the same thing.`,
    relatedTopics: ['rpe', 'failure-training'],
    categoryId: 'terminology'
  }
];

helpContent.categories[0].topics.push(
  {
    id: 'tempo',
    title: 'Rep Tempo',
    keywords: ['tempo', 'speed', 'negative', 'eccentric', 'concentric', 'positive'],
    content: `Rep tempo refers to how fast you move the weight during each phase of a lift.

**Recommended Tempo:**
• Negative (lowering): 2-4 seconds - controlled and slow
• Positive (lifting): Forceful and explosive

**Why Slower Negatives?**
Research shows the eccentric (negative) phase is more important for muscle growth than the concentric (positive) phase. Treat the negative like a "failed positive" - resist the weight as it moves down.

**Key Cue:** Feel the muscle streeettttchhhhhhhh as you lower the weight. Don't just let it free fall!

Some exercises (like cable reverse flyes or triceps kickbacks) work better with a smoother positive rather than explosive.`,
    relatedTopics: ['tension', 'technique', 'range-of-motion'],
    categoryId: 'terminology'
  },
  {
    id: 'llp',
    title: 'LLP (Long-Length Partials)',
    keywords: ['llp', 'lengthened', 'partials', 'stretch', 'bottom', 'half'],
    content: `Long-Length Partials (LLPs) are partial reps performed in the stretched/lengthened part of an exercise.

**Examples:**
• Pendlay rows: Come about halfway up (bottom half of row)
• Leg curls: Partial reps in the top half where leg is more straight
• DB flyes: Bottom half only, emphasizing the stretch

**Why Use LLPs?**
Research shows the stretched/lengthened aspect of a lift is better for muscle growth than the squeezed/shortened aspect. LLPs let you spend more time in the most effective range.

**How They're Used:**
• After reaching failure with full ROM, switch to LLPs and continue to failure again
• Some exercises are prescribed as "Bottom-Half" meaning all reps are LLPs`,
    relatedTopics: ['range-of-motion', 'intensity-techniques', 'stretch'],
    categoryId: 'terminology'
  }
);

helpContent.categories[0].topics.push(
  {
    id: 'myo-reps',
    title: 'Myo-Reps',
    keywords: ['myo', 'reps', 'rest-pause', 'mini', 'rest', 'extend'],
    content: `Myo-reps extend a set beyond failure by taking short mini-rests and cranking out extra reps.

**How to Perform Myo-Reps:**
1. Do your set to failure (e.g., 10-12 reps)
2. Rest for ~5 seconds
3. Do another 3-4 reps
4. Rest for another ~5 seconds
5. Do another 3-4 reps
6. Repeat until you can no longer get at least 3 reps
7. Set is finished

**Why Use Myo-Reps?**
They allow you to squeeze out extra reps while the muscle is near full exhaustion. The reps close to the end of a set are more "effective" for muscle growth than reps at the beginning.`,
    relatedTopics: ['intensity-techniques', 'failure-training', 'effective-reps'],
    categoryId: 'terminology'
  }
);

// Training Principles Topics
helpContent.categories[1].topics = [
  {
    id: 'tension',
    title: 'Tension Over Everything',
    keywords: ['tension', 'force', 'muscle', 'growth', 'hypertrophy', 'stimulus'],
    content: `Tension is the main driver of muscle growth. Without tension, very little muscle growth can occur.

**What is Tension?**
Tension is the force created within a muscle as it's pulled and stretched during lifting - like a rope in a tug of war. When the muscle senses tension, anabolic signals are sent telling it to grow bigger.

**How to Maximize Tension:**
• Use proper technique
• Control the negative (2-4 seconds)
• Get a deep stretch at the bottom
• Minimize momentum and cheating
• Keep form consistent week to week
• Choose exercises with good resistance profiles`,
    relatedTopics: ['technique', 'tempo', 'range-of-motion'],
    categoryId: 'training-principles'
  }
];

helpContent.categories[1].topics.push(
  {
    id: 'technique',
    title: 'Proper Technique',
    keywords: ['technique', 'form', 'control', 'momentum', 'cheating', 'consistency'],
    content: `Good technique ensures tension is applied to the target muscle.

**Key Technique Principles:**

**1. Controlled Negative (2-4 seconds)**
Don't let the weight free fall. Resist it on the way down. Treat it like a "failed positive" - you're trying to push up but it keeps moving down.

**2. Full Range of Motion**
Get to the deepest, most-stretched aspect of the ROM. The stretch is more important than the squeeze. The bottom half of most exercises is more important than the top half.

**3. Minimize Momentum**
Stay in control of the weight. Minimize swinging and cheating. If you cheat the weight up, you're taking tension away from the target muscle.

**4. Form Consistency**
Keep your form consistent week to week. Don't alter form just to add weight - that's fake progression. Technique over weight, always.`,
    relatedTopics: ['tension', 'tempo', 'range-of-motion', 'progressive-overload'],
    categoryId: 'training-principles'
  },
  {
    id: 'range-of-motion',
    title: 'Range of Motion & Stretch',
    keywords: ['rom', 'range', 'motion', 'stretch', 'deep', 'bottom', 'lengthened'],
    content: `Getting to the deepest, most-stretched aspect of the range of motion is what really matters for muscle growth.

**Key Points:**
• The stretch is more important than the squeeze
• The bottom half of most exercises is more important than the top half
• Bottom of squat > top of squat
• Bottom of cable curl > top of cable curl

**Always Ask Yourself:**
"Am I getting a deep stretch at the bottom?" If not, you may be missing out on gains.

**Long Muscle Length Focus:**
This program emphasizes exercises that load the muscle while it's being stretched (e.g., Bayesian cable curl, Bulgarian split squat, pendlay deficit row).`,
    relatedTopics: ['technique', 'llp', 'tension'],
    categoryId: 'training-principles'
  }
);

helpContent.categories[1].topics.push(
  {
    id: 'effort',
    title: 'Training Effort & Intensity',
    keywords: ['effort', 'intensity', 'hard', 'failure', 'push', 'grind'],
    content: `You need to push sets hard to maximize muscle growth. Most people don't push hard enough.

**How Hard is Hard Enough?**
Push most sets either to failure or about 1 rep shy of failure (RPE 9-10).

**Early Sets vs Last Sets:**
• Early Sets: Stop with ~1-2 reps left (RPE 8-9)
• Last Set: Always go to failure (RPE 10)

**Why This Matters:**
Beyond the beginner stage, triggering muscle growth will be uncomfortable. You can't just go through the motions. Research shows that as you get closer to failure, you see more muscle growth.

**Reality Check:**
"Just showing up" won't build new tissue. You need to really make the muscle work. It needs to be hard.`,
    relatedTopics: ['rpe', 'rir', 'failure-training', 'progressive-overload'],
    categoryId: 'training-principles'
  },
  {
    id: 'failure-training',
    title: 'Training to Failure',
    keywords: ['failure', 'last', 'set', 'rep', 'failed', 'attempt'],
    content: `Training to failure means you attempted and failed to get the weight all the way up with good form.

**In This Program:**
The last set of every exercise goes to failure (except intro/deload weeks).

**Why Failure on Last Sets?**
• Reinforces what "all out" truly means
• Helps you better estimate sub-maximal RPEs
• Standardizes effort scientifically
• Evidence shows it may be better for muscle growth

**Why Not Every Set?**
Too much failure training can:
• Impair volume tolerance
• Require more recovery
• Increase injury risk on certain exercises

**The Balance:**
Early sets at RPE 8-9, last set to failure = best of both worlds.`,
    relatedTopics: ['rpe', 'rir', 'effort', 'volume'],
    categoryId: 'training-principles'
  }
);

helpContent.categories[1].topics.push(
  {
    id: 'progressive-overload',
    title: 'Progressive Overload',
    keywords: ['progressive', 'overload', 'progression', 'weight', 'reps', 'stronger', 'progress'],
    content: `Progressive overload means increasing some training variable over time. It's crucial for continued progress.

**Main Methods (in order of priority):**

**1. Adding Reps**
If the program calls for 10-12 reps and you get 10 on both sets, try to add a rep next week. Once you hit 12 reps on both sets, add weight and drop back to 10 reps. This is called "double progression."

**2. Adding Weight**
Only add weight once you've maxed out the top end of the rep range.

**3. Improving Form**
Better technique cues, especially controlling the negative, increases tension on the target muscle.

**4. Improving Mind-Muscle Connection**
Focus on feeling the muscle working better. Most effective on isolation exercises.

**Key Point:**
You need to continually provide the muscle with a new stimulus to adapt to. Without overload, the muscle has no reason to continue growing.`,
    relatedTopics: ['tension', 'technique', 'tracking'],
    categoryId: 'training-principles'
  },
  {
    id: 'volume',
    title: 'Training Volume',
    keywords: ['volume', 'sets', 'total', 'weekly', 'how', 'many', 'enough'],
    content: `Training volume refers to the total number of sets performed for a muscle group.

**Volume in This Program:**
The program is designed with appropriate volume for intermediate-advanced natural lifters. Volume progressively increases in the Ramping Block.

**Foundation Block (Weeks 1-5):**
Consistent volume after intro week

**Ramping Block (Weeks 6-12):**
• Weeks 7-8: Volume increases from baseline
• Weeks 9-10: Volume increases again  
• Weeks 11-12: Final volume increase

**Should You Add Sets?**
Probably not. Before adding volume, ensure your intensity/effort is on point. Are you truly pushing the last set to failure? Volume feels low usually means effort isn't high enough.

**Research Shows:**
Increasing volume over time may be more effective than keeping it static, even when average volume is similar.`,
    relatedTopics: ['effort', 'failure-training', 'recovery'],
    categoryId: 'training-principles'
  }
);

// Program Guide Topics
helpContent.categories[2].topics = [
  {
    id: 'training-split',
    title: 'Training Split (5x Per Week)',
    keywords: ['split', 'schedule', 'days', 'week', 'upper', 'lower', 'push', 'pull', 'legs'],
    content: `This program follows an Upper/Lower/Pull/Push/Legs split, training 5 days per week.

**Weekly Schedule:**
• Monday: Upper
• Tuesday: Lower  
• Wednesday: Rest
• Thursday: Pull
• Friday: Push
• Saturday: Legs
• Sunday: Rest

**Why 5x Per Week?**
Strikes the ideal balance between volume and recovery. 4x can make it tough to fit enough volume, while 6x provides only one rest day.

**Why This Split?**
• Trains muscle groups twice per week (optimal for intermediate-advanced)
• Breaking Upper into Pull/Push makes workouts more engaging
• More fun than full-body while maintaining high frequency

**Can I Train 4x Per Week?**
Yes! Simply carry over the remaining workout(s) into the following week.`,
    relatedTopics: ['volume', 'recovery', 'program-structure'],
    categoryId: 'program-guide'
  }
];

helpContent.categories[2].topics.push(
  {
    id: 'program-structure',
    title: 'Program Structure & Blocks',
    keywords: ['blocks', 'structure', 'foundation', 'ramping', 'weeks', 'intro', 'deload'],
    content: `The program is divided into two 12-week training blocks.

**Foundation Block (Weeks 1-5):**
• Week 1: Intro/deload week
• Weeks 2-5: Consistent volume
• Establishes baseline for progression
• Focus on learning exercises and tracking

**Ramping Block (Weeks 6-12):**
• Week 6: Intro/deload week (new exercises)
• Weeks 7-12: Progressive volume increases
• Volume ramps up every 2 weeks

**Why Two Blocks?**
• Exercise variation keeps things fresh
• Intro weeks allow you to learn new movements
• Progressive volume increases drive adaptation
• Research shows ramping volume may be superior to constant volume

**After Week 12:**
The program loops seamlessly - jump back to Week 1 which serves as a deload.`,
    relatedTopics: ['volume', 'progressive-overload', 'training-split'],
    categoryId: 'program-guide'
  },
  {
    id: 'rest-periods',
    title: 'Rest Periods Between Sets',
    keywords: ['rest', 'periods', 'between', 'sets', 'how', 'long', 'wait', 'recovery'],
    content: `Rest periods between sets don't need to be precisely timed.

**General Guidelines:**
• Rest until you feel recovered enough to perform the next set well
• Longer rest = better performance = more volume = more growth
• Don't rest so long that you lose focus or the workout drags on

**Practical Approach:**
Keep a rough eye on the clock, but don't stress about exact timing. If you feel ready after 2 minutes, go. If you need 4 minutes after a heavy compound, take it.

**Research Shows:**
Longer rest periods are generally associated with better muscle growth because they allow you to recover more and perform more total volume.

**Bottom Line:**
Feel recovered but stay focused. Somewhere between 2-4 minutes for most exercises is typical.`,
    relatedTopics: ['volume', 'effort', 'recovery'],
    categoryId: 'program-guide'
  }
);

helpContent.categories[2].topics.push(
  {
    id: 'substitutions',
    title: 'Exercise Substitutions',
    keywords: ['substitutions', 'substitute', 'swap', 'replace', 'alternative', 'option'],
    content: `Each exercise has two substitution options available.

**Good Reasons to Substitute:**
• You don't have access to the equipment
• The exercise causes you pain
• You really dislike it (but love one of the subs)
• You don't "feel" it working after several honest weeks (and you do feel a sub)

**Poor Reasons to Substitute:**
• You haven't done it before (now's the time to learn!)
• Someone is using the equipment (come back to it later)
• The main exercise is harder (don't always pick the easiest option!)

**Which Substitution?**
Option 1 and Option 2 aren't ranked - they're just different options. Both will provide a very similar training effect.

**Recommendation:**
Try to do the main exercise if you can. They were carefully selected for their unique advantages in tension profile and stimulus-to-fatigue ratio.`,
    relatedTopics: ['exercise-selection', 'equipment'],
    categoryId: 'program-guide'
  },
  {
    id: 'tracking',
    title: 'Progress Tracking',
    keywords: ['tracking', 'progress', 'weight', 'reps', 'photos', 'bodyweight', 'logbook'],
    content: `Track your progress using three main tools:

**1. Strength Performance (Most Important)**
The single best indicator you're gaining muscle is gaining strength in the 8-15 rep ranges. Track weight and reps for as many exercises as possible. Beat the logbook!

**2. Progress Photos**
Take photos every 2-3 months (no more than once per week). Use same camera, background, and lighting. Take front, side, and rear photos.

**3. Bodyweight**
Track weekly trends, not individual weigh-ins. Single weigh-ins fluctuate due to water, digestion, sleep, etc.

**Gaining Muscle:**
Aim for 1-2% bodyweight gain per month (mostly muscle). Example: 170 lbs person gains 1.7-3.4 lbs/month.

**Losing Fat:**
Aim for 0.5-1% bodyweight loss per week. Example: 220 lbs person loses 1.1-2.2 lbs/week.

**Meticulous tracking makes a big difference!**`,
    relatedTopics: ['progressive-overload', 'nutrition-goals'],
    categoryId: 'program-guide'
  }
);

helpContent.categories[2].topics.push(
  {
    id: 'soreness',
    title: 'Muscle Soreness (DOMS)',
    keywords: ['soreness', 'sore', 'doms', 'pain', 'recovery', 'delayed'],
    content: `Muscle soreness is NOT required for muscle growth.

**Not Sore? That's OK!**
Soreness isn't a reliable indicator of an effective workout. Reduced soreness over time can be good - it means your body is adapting and recovering.

**What Matters:**
• Pushing yourself hard
• Executing exercises with good form
• Being consistent with workouts

**Very Sore? Here's What to Do:**
• Foam rolling may help reduce soreness (3-5 min post-workout)
• Training while mildly sore is fine
• If soreness prevents full ROM or proper positioning, skip that exercise until recovered
• Perform a longer warm-up when mildly sore

**Remember:**
Many activities cause soreness but don't build muscle (like running a marathon). Soreness ≠ muscle growth.`,
    relatedTopics: ['recovery', 'effort', 'technique'],
    categoryId: 'program-guide'
  },
  {
    id: 'cardio',
    title: 'Adding Cardio',
    keywords: ['cardio', 'conditioning', 'aerobic', 'running', 'hiit', 'fat', 'loss'],
    content: `Cardio can be added but should be kept to an effective minimum.

**Recommendations:**
• 4-5 low-moderate intensity sessions per week
• 20-30 minutes per session
• High-intensity cardio: 1-2x per week max

**For Fat Loss:**
Prioritize creating a caloric deficit through diet first, rather than relying heavily on cardio.

**Will Cardio Kill Gains?**
No, but excessive cardio can interfere with recovery. Monitor your progress:
• If you're progressing fine → cardio is fine
• If progress slows and you feel very fatigued → cut back on cardio

**Bottom Line:**
Cardio is great for health and can help with fat loss, but don't overdo it if muscle growth is your primary goal.`,
    relatedTopics: ['recovery', 'nutrition-goals', 'fat-loss'],
    categoryId: 'program-guide'
  }
);

// Nutrition Topics
helpContent.categories[3].topics = [
  {
    id: 'calories',
    title: 'Setting Up Calories',
    keywords: ['calories', 'maintenance', 'surplus', 'deficit', 'tdee', 'energy'],
    content: `Your calorie intake determines whether you gain, lose, or maintain weight.

**For Muscle Gain (Lean Bulk):**
5-15% caloric surplus. Bigger surplus = more fat gain alongside muscle.

**For Fat Loss:**
5-15% caloric deficit. Larger deficits = more muscle loss and less sustainable.

**For Body Recomposition:**
Maintenance calories (0% surplus/deficit).

**Finding Your Maintenance:**

Method 1 (Faster, Less Accurate):
Multiply bodyweight (lbs) by 14-18
• More active: closer to 18
• Less active: closer to 14
• Not sure: use 16

Method 2 (Slower, More Accurate):
Track weight and calories for 2 weeks, calculate averages, adjust based on weight change.

**Example:**
Maintenance = 2,500 cal
Lean bulk = 2,625-2,875 cal (add 125-375)
Cut = 2,125-2,375 cal (subtract 125-375)`,
    relatedTopics: ['protein', 'nutrition-goals', 'tracking'],
    categoryId: 'nutrition'
  }
];

helpContent.categories[3].topics.push(
  {
    id: 'protein',
    title: 'Protein Requirements',
    keywords: ['protein', 'grams', 'intake', 'daily', 'how', 'much', 'amino'],
    content: `Protein is crucial for building and maintaining muscle.

**Bulking or Maintaining:**
• 0.7-1 gram per lb of bodyweight per day
• OR 1.6-2.2 grams per kg of bodyweight per day

**Cutting (Fat Loss):**
• 0.8-1.2 grams per lb of bodyweight per day
• OR 1.8-2.7 grams per kg of bodyweight per day

**Very Overweight?**
Use your height in centimeters as a rough guide.
Example: 180 cm tall = 180 grams protein per day

**Examples:**
• 170 lb person bulking: 119-170g protein/day
• 170 lb person cutting: 136-204g protein/day
• 200 lb person bulking: 140-200g protein/day

**Note:**
The height formula generally overestimates needs. Most people can build muscle with ~20-40g less than what it predicts.`,
    relatedTopics: ['calories', 'nutrition-goals', 'supplements'],
    categoryId: 'nutrition'
  },
  {
    id: 'fats-carbs',
    title: 'Fats and Carbs',
    keywords: ['fats', 'carbs', 'carbohydrates', 'macros', 'lipids'],
    content: `Fats and carbs are less critical than calories and protein, but still important.

**Fats:**
Set at 20-30% of total calories.

Example: 2,700 calories per day
• 675 calories from fat (25%)
• 675 ÷ 9 cal/gram = 75g fat per day

**Why Fats Matter:**
Too low can cause hormonal or performance issues.

**Carbs:**
Fill remaining calories after protein and fats are set.

Example: 2,700 total calories
• 170g protein = 680 cal
• 75g fat = 675 cal
• Remaining: 1,345 cal = 336g carbs

**Bottom Line:**
Don't need to micromanage fats and carbs. Just ensure fats aren't too low (below 20% of calories) and fill the rest with carbs.`,
    relatedTopics: ['calories', 'protein', 'nutrition-goals'],
    categoryId: 'nutrition'
  }
);

helpContent.categories[3].topics.push(
  {
    id: 'supplements',
    title: 'Recommended Supplements',
    keywords: ['supplements', 'creatine', 'protein', 'powder', 'caffeine', 'pre-workout'],
    content: `Supplements make up a tiny part of your success. Here are the essentials:

**Creatine Monohydrate (Recommended)**
• Dose: 5 grams (1 tsp) per day
• Timing: Anytime of day
• Benefits: Improves strength and muscle growth
• Most researched and effective supplement

**Caffeine (Optional)**
• Dose: 150-250mg
• Timing: 30-60 minutes before training
• Use: When feeling more tired than usual
• Benefits: Improved focus and performance

**Protein Powder (As Needed)**
• Use: To help hit daily protein goals
• Not required if you get enough protein from whole foods
• Convenient, not magical

**What About Other Supplements?**
Most other supplements have minimal to no benefit. Focus on training, nutrition, and recovery first.`,
    relatedTopics: ['protein', 'nutrition-goals', 'performance'],
    categoryId: 'nutrition'
  }
);

// Exercise Info Topics
helpContent.categories[4].topics = [
  {
    id: 'machines-vs-free-weights',
    title: 'Machines vs Free Weights',
    keywords: ['machines', 'free', 'weights', 'cables', 'smith', 'barbell', 'dumbbell'],
    content: `This program emphasizes machines and cables over free weights for bodybuilding.

**Why Machines?**

**Higher Stability:**
More stable = better force transfer to target muscle. Less "tension leakage."

**Better Resistance Profiles:**
Machines apply more even tension throughout ROM. Free weights often have "dead spots."

**Safer Failure Training:**
Can push to failure more safely. Weight is supported if you fail a rep.

**Fewer Warm-up Sets:**
Get to working sets faster without wasting energy.

**Research Shows:**
Machines are at least equally effective as free weights for muscle growth, and may be superior in some cases.

**Free Weights Still Included:**
They're more accessible, have better strength carryover, and are more versatile. Substitution options provided for all exercises.`,
    relatedTopics: ['exercise-selection', 'tension', 'substitutions'],
    categoryId: 'exercises'
  }
];

helpContent.categories[4].topics.push(
  {
    id: 'intensity-techniques',
    title: 'Intensity Techniques',
    keywords: ['intensity', 'techniques', 'advanced', 'methods', 'failure', 'extend'],
    content: `Intensity techniques extend sets beyond normal failure to maximize muscle growth.

**Used in This Program:**

**1. Failure**
Taking the last set to complete failure on every exercise (except intro/deload weeks).

**2. Long-Length Partials (LLPs)**
Partial reps in the stretched position after reaching failure with full ROM.

**3. Static Stretches**
Holding a stretch for 30 seconds after the last set (mainly for calves).

**4. Myo-Reps**
Short rest-pause technique with 5-second mini-rests between clusters of 3-4 reps.

**When to Use:**
The program specifies which technique to use on each exercise's last set. Don't add extra intensity techniques beyond what's prescribed.

**Why They Work:**
They allow you to accumulate more "effective reps" - the hard reps near failure that drive the most growth.`,
    relatedTopics: ['llp', 'myo-reps', 'failure-training', 'effort'],
    categoryId: 'exercises'
  },
  {
    id: 'warm-up',
    title: 'Warm-Up Sets',
    keywords: ['warm', 'up', 'warmup', 'sets', 'preparation', 'injury', 'prevention'],
    content: `Warm-up sets prepare your muscles and nervous system for working sets.

**Guidelines:**
• Warm-up sets should be light and easy (RPE 1-4)
• Do NOT count warm-up sets as working sets
• Machines typically need fewer warm-ups (2-3 sets)
• Free weights typically need more warm-ups (4-5 sets)

**Example Warm-Up Progression:**
Working weight: 225 lbs for 10 reps
• Set 1: 95 lbs x 8 reps (easy)
• Set 2: 135 lbs x 6 reps (easy)
• Set 3: 185 lbs x 4 reps (moderate)
• Working Set 1: 225 lbs x 10 reps (RPE 8-9)

**Key Points:**
• Don't fatigue yourself during warm-ups
• Practice technique cues during warm-ups
• Read exercise notes before warm-ups
• More warm-ups needed for heavy compounds`,
    relatedTopics: ['rpe', 'technique', 'injury-prevention'],
    categoryId: 'exercises'
  }
);

// Add a few more common questions
helpContent.categories[2].topics.push(
  {
    id: 'recovery',
    title: 'Recovery & Rest Days',
    keywords: ['recovery', 'rest', 'days', 'sleep', 'fatigue', 'overtraining'],
    content: `Recovery is when muscle growth actually happens.

**Rest Days in Program:**
• Wednesday: Full rest day
• Sunday: Full rest day

**Signs of Poor Recovery:**
• Strength decreasing over multiple weeks
• Persistent fatigue during workouts
• Poor sleep quality
• Increased resting heart rate
• Loss of motivation

**How to Improve Recovery:**
• Get 7-9 hours of sleep per night
• Manage stress levels
• Eat adequate calories and protein
• Stay hydrated
• Consider reducing cardio if excessive
• Take deload weeks seriously

**Deload Weeks:**
Week 1 and Week 6 are intro/deload weeks. Use lighter weights and focus on technique. Don't skip these!

**Remember:**
You don't grow in the gym. You grow when you recover from the gym.`,
    relatedTopics: ['volume', 'effort', 'soreness', 'cardio'],
    categoryId: 'program-guide'
  }
);
