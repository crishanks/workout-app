const createWeek = (weekNum, block, modifications = {}) => {
    const baseWeek = {
        week: weekNum,
        block,
        days: [
            {
                day: "Upper (Strength Focus)",
                exercises: [
                    { name: "45° Incline Barbell Press", sets: weekNum === 1 ? 2 : 3, warmupSets: 2, warmupReps: ["10", "8"], reps: "6-8", earlyRPE: weekNum === 1 ? "7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "3-5 min", notes: "1 second pause at the bottom of each rep while maintaining tension on the pecs", sub1: "45° Incline DB Press", sub2: "45° Incline Machine Press" },
                    { name: "Cable Crossover Ladder", sets: weekNum === 1 ? 1 : 2, warmupSets: 1, warmupReps: ["12"], reps: "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Do one set with low cable position, one set with medium-height cable position, and one height with a high cable position.", sub1: "Pec Deck", sub2: "Bottom-Half DB Flye" },
                    { name: "Wide-Grip Pull-Up", sets: weekNum === 1 ? 2 : 3, warmupSets: 1, warmupReps: ["10"], reps: "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: "1.5x shoulder width overhand grip. Slow 2-3 second negative.", sub1: "Wide-Grip Lat Pulldown", sub2: "Dual-Handle Lat Pulldown" },
                    { name: "High-Cable Lateral Raise", sets: weekNum >= 11 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Focus on squeezing your lateral delt to move the weight.", sub1: "High-Cable Cuffed Lateral Raise", sub2: "Lean-In DB Lateral Raise" },
                    { name: "Pendlay Deficit Row", sets: weekNum >= 7 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, warmupReps: ["10", "8"], reps: "6-8", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "2-3 min", notes: "Stand on a bumper plate. Focus on getting a big stretch and touch your stomach/chest on each rep!", sub1: "Smith Machine Row", sub2: "Single-Arm DB Row" },
                    { name: "Overhead Cable Triceps Extension (Bar)", sets: weekNum >= 9 ? 3 : 2, warmupSets: 1, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Optionally pause for 0.5-1 second in the stretched aspect of each rep", sub1: "Overhead Cable Triceps Extension (Rope)", sub2: "DB Skull Crusher" },
                    { name: "Bayesian Cable Curl", sets: weekNum >= 9 ? 3 : 2, warmupSets: 1, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "If you have a left-right bicep size imbalance, do these 1 arm at a time.", sub1: "Seated Super-Bayesian High Cable Curl", sub2: "Incline DB Stretch Curl" }
                ]
            },
            {
                day: "Lower (Strength Focus)",
                exercises: [
                    { name: "Lying Leg Curl", sets: weekNum >= 9 ? 3 : 2, warmupSets: 2, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Set the machine so that you get the biggest stretch possible at the bottom.", sub1: "Seated Leg Curl", sub2: "Nordic Ham Curl" },
                    { name: weekNum >= 6 ? "Smith Machine Static Lunge w/ Elevated Front Foot" : "Smith Machine Squat", sets: weekNum >= 6 ? 4 : (weekNum === 1 ? 2 : 3), warmupSets: weekNum === 1 ? 2 : (weekNum >= 6 ? 2 : 4), warmupReps: ["10", "8"], reps: weekNum >= 6 ? "8-10" : "6-8", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "3-5 min", notes: weekNum >= 6 ? "Elevate your front foot on a small box." : "Set up your feet as you would a normal squat and then bring them forward ~3-6 inches.", sub1: "DB Bulgarian Split Squat", sub2: "High-Bar Back Squat" },
                    { name: weekNum >= 6 ? "45° Hyperextension" : "Barbell RDL", sets: weekNum >= 6 ? 4 : (weekNum === 1 ? 2 : 4), warmupSets: weekNum === 1 ? 2 : (weekNum >= 6 ? 2 : 4), warmupReps: ["10", "8"], reps: weekNum >= 6 ? "8-10" : "6-8", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: weekNum >= 6 ? "Squeeze your glutes hard at the top of each rep." : "To keep tension on the hamstrings, stop about 75% of the way to full lockout.", sub1: weekNum >= 6 ? "Glute-Ham Raise" : "DB RDL", sub2: weekNum >= 6 ? "Cable Pull-Through" : "Snatch-Grip RDL" },
                    { name: "Leg Extension", sets: weekNum >= 7 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Set the seat back as far as it will go. Use a 2-3 second negative.", sub1: "Reverse Nordic", sub2: "Sissy Squat" },
                    { name: weekNum >= 6 ? "Leg Press Calf Press" : "Standing Calf Raise", sets: weekNum >= 7 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "8-10" : "6-8", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "1-2 second pause at the bottom of each rep.", sub1: "Seated Calf Raise", sub2: weekNum >= 6 ? "Standing Calf Raise" : "Leg Press Calf Press" },
                    { name: weekNum >= 6 ? "Machine Crunch" : "Cable Crunch", sets: weekNum >= 9 ? 3 : 2, reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.", sub1: "Decline Weighted Crunch", sub2: weekNum >= 6 ? "Cable Crunch" : "Machine Crunch" }
                ]
            },
            { day: "Rest Day", exercises: [] },
            {
                day: "Pull (Hypertrophy Focus)",
                exercises: [
                    { name: weekNum >= 6 ? "Lean-Back Lat Pulldown" : "Neutral-Grip Lat Pulldown", sets: weekNum === 1 ? 2 : 3, warmupSets: weekNum === 1 ? 2 : 3, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: weekNum >= 6 ? "Lean back by about 15-30° to get the mid-back more involved." : "Do these pulldowns with the handle more out in front of you.", sub1: weekNum >= 6 ? "Lean-Back Machine Pulldown" : "Neutral-Grip Pull-Up", sub2: weekNum >= 6 ? "Pull-Up" : "Dual-Handle Lat Pulldown" },
                    { name: weekNum >= 6 ? "Chest-Supported T-Bar Row" : "Chest-Supported Machine Row", sets: weekNum >= 11 ? 4 : (weekNum === 1 ? 2 : 3), warmupSets: weekNum === 1 ? 2 : 3, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard.", sub1: "Chest-Supported Machine Row", sub2: "Incline Chest-Supported DB Row" },
                    { name: weekNum >= 6 ? "Dual-Handle Elbows-Out Cable Row" : "Neutral-Grip Seated Cable Row", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "2-3 min", notes: "Focus on squeezing your shoulder blades together, driving your elbows down and back.", sub1: weekNum >= 6 ? "Arm-Out Single-Arm DB Row" : "Helms Row", sub2: "Meadows Row" },
                    { name: "1-Arm 45° Cable Rear Delt Flye", sets: weekNum >= 7 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Pause for 1-2 seconds in the squeeze of each rep.", sub1: "Rope Face Pull", sub2: "Reverse Pec Deck" },
                    { name: weekNum >= 6 ? "Cable Paused Shrug-In" : "Machine Shrug", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 2 : 3), warmupSets: weekNum === 1 ? 2 : 3, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Brief pause at the top and bottom of ROM.", sub1: "Machine Shrug", sub2: "DB Shrug" },
                    { name: weekNum >= 6 ? "Cable Rope Hammer Curl" : "EZ-Bar Cable Curl", sets: weekNum >= 7 ? 3 : 2, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: weekNum >= 6 ? "Squeeze the rope hard as you curl the weight up." : "Set up the cable at the lowest position.", sub1: weekNum >= 6 ? "DB Hammer Curl" : "EZ-Bar Curl", sub2: weekNum >= 6 ? "Hammer Preacher Curl" : "DB Curl" },
                    { name: weekNum >= 6 ? "DB Concentration Curl" : "Machine Preacher Curl", sets: weekNum >= 9 ? 3 : weekNum >= 7 ? 2 : 1, reps: "12-15", earlyRPE: "", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Smooth, controlled reps. Mind-muscle connection with the biceps.", sub1: weekNum >= 6 ? "Concentration Cable Curl" : "EZ-Bar Preacher Curl", sub2: "DB Preacher Curl" }
                ]
            },
            {
                day: "Push (Hypertrophy Focus)",
                exercises: [
                    { name: weekNum >= 6 ? "Machine Chest Press" : "Barbell Bench Press", sets: weekNum >= 11 ? 4 : (weekNum === 1 ? 2 : 4), warmupSets: weekNum === 1 ? 2 : 4, warmupReps: ["10", "8"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "3-5 min", notes: weekNum >= 6 ? "1 second pause at the bottom of each rep while maintaining tension on the pecs" : "Set up a comfortable arch, quick pause on the chest and explode up on each rep.", sub1: weekNum >= 6 ? "Barbell Bench Press" : "Machine Chest Press", sub2: "DB Bench Press" },
                    { name: weekNum >= 6 ? "Seated DB Shoulder Press" : "Machine Shoulder Press", sets: weekNum === 1 ? 2 : 3, warmupSets: weekNum === 1 ? 2 : 3, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts.", sub1: "Cable Shoulder Press", sub2: weekNum >= 6 ? "Machine Shoulder Press" : "Seated DB Shoulder Press" },
                    { name: weekNum >= 6 ? "Bottom-Half Seated Cable Flye" : "Bottom-Half DB Flye", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "All reps and sets are to be performed in the bottom half of the ROM.", sub1: "Bottom-Half DB Flye", sub2: "Low-to-High Cable Crossover" },
                    { name: "High-Cable Lateral Raise", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Focus on squeezing your lateral delt to move the weight.", sub1: "High-Cable Cuffed Lateral Raise", sub2: "Lean-In DB Lateral Raise" },
                    { name: weekNum >= 6 ? "EZ-Bar Skull Crusher" : "Overhead Cable Triceps Extension (Bar)", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Optionally pause for 0.5-1 second in the stretched aspect of each rep", sub1: "DB Skull Crusher", sub2: "Katana Triceps Extension" },
                    { name: weekNum >= 6 ? "Triceps Pressdown (Bar)" : "Cable Triceps Kickback", sets: weekNum >= 9 ? 3 : (weekNum >= 7 ? 2 : 1), reps: weekNum >= 6 ? "15-20" : "12-15", earlyRPE: "", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Focus on squeezing your triceps to move the weight", sub1: weekNum >= 6 ? "Triceps Pressdown (Rope)" : "DB Triceps Kickback", sub2: weekNum >= 6 ? "DB Triceps Kickback" : "Bench Dip" },
                    { name: weekNum >= 6 ? "Ab Wheel Rollout" : "Roman Chair Leg Raise", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "12-15" : "10-20", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: weekNum >= 6 ? "Don't just bend at your hips, use your abs to lower yourself down under control." : "Allow your lower back to round as you curl your legs up.", sub1: weekNum >= 6 ? "Swiss Ball Rollout" : "Hanging Leg Raise", sub2: weekNum >= 6 ? "Long-Lever Plank" : "Modified Candlestick" }
                ]
            },
            { day: "Rest Day", exercises: [] },
            {
                day: "Legs (Hypertrophy Focus)",
                exercises: [
                    { name: weekNum >= 6 ? "Hack Squat" : "Leg Press", sets: weekNum >= 11 ? 4 : (weekNum === 1 ? 2 : 4), warmupSets: weekNum === 1 ? 2 : 4, warmupReps: ["10", "8"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: weekNum >= 6 ? "Use a controlled negative (don't free fall) and then explode on the positive." : "Feet lower on the platform for more quad focus.", sub1: weekNum >= 6 ? "Leg Press" : "Smith Machine Static Lunge", sub2: "DB Walking Lunge" },
                    { name: "Seated Leg Curl", sets: weekNum >= 11 ? 4 : (weekNum >= 7 ? 3 : (weekNum === 1 ? 1 : 2)), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Lean forward over the machine to get a maximum stretch in your hamstrings.", sub1: "Lying Leg Curl", sub2: "Nordic Ham Curl" },
                    { name: weekNum >= 6 ? "Walking Lunge" : "DB Bulgarian Split Squat", sets: weekNum >= 6 ? 2 : (weekNum === 1 ? 2 : 3), warmupSets: weekNum === 1 ? 2 : 3, warmupReps: ["12"], reps: weekNum >= 6 ? "10-12" : "8-10", earlyRPE: weekNum === 1 ? "6-7" : "8-9", lastRPE: weekNum === 1 ? "7-8" : "10", rest: "2-3 min", notes: weekNum >= 6 ? "Take medium strides. Minimize contribution from the back leg" : "Lower all the way down until your front thigh is parallel to the ground.", sub1: weekNum >= 6 ? "Smith Machine Static Lunge" : "DB Step-Up", sub2: weekNum >= 6 ? "DB Static Lunge" : "Goblet Squat" },
                    { name: "Leg Extension", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: 1, warmupReps: ["15"], reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Set the seat back as far as it will go. Use a 2-3 second negative.", sub1: "Reverse Nordic", sub2: "Sissy Squat" },
                    { name: "Machine Hip Adduction", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "Mind-muscle connection with your inner thighs.", sub1: "Cable Hip Adduction", sub2: "Copenhagen Hip Adduction" },
                    { name: "Machine Hip Abduction", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "If possible, use pads to increase the range of motion on the machine.", sub1: "Cable Hip Abduction", sub2: "Lateral Band Walk" },
                    { name: "Standing Calf Raise", sets: weekNum >= 9 ? 3 : (weekNum === 1 ? 1 : 2), warmupSets: weekNum === 1 ? 1 : 2, reps: weekNum >= 6 ? "12-15" : "10-12", earlyRPE: weekNum === 1 ? "7-8" : "8-9", lastRPE: weekNum === 1 ? "8-9" : "10", rest: "1-2 min", notes: "1-2 second pause at the bottom of each rep.", sub1: "Seated Calf Raise", sub2: "Leg Press Calf Press" }
                ]
            }
        ]
    };

    return baseWeek;
};

export const workoutProgram = {
    weeks: [
        createWeek(1, "Foundation"),
        createWeek(2, "Foundation"),
        createWeek(3, "Foundation"),
        createWeek(4, "Foundation"),
        createWeek(5, "Foundation"),
        createWeek(6, "Ramping"),
        createWeek(7, "Ramping"),
        createWeek(8, "Ramping"),
        createWeek(9, "Ramping"),
        createWeek(10, "Ramping"),
        createWeek(11, "Ramping"),
        createWeek(12, "Ramping")
    ]
};
