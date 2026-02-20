import { useState, useEffect } from 'react';

export const useExerciseVariants = () => {
  const [exerciseVariants, setExerciseVariants] = useState({});

  useEffect(() => {
    const savedVariants = localStorage.getItem('shreddit-variants');
    if (savedVariants) {
      setExerciseVariants(JSON.parse(savedVariants));
    }
  }, []);

  const saveVariants = (variants) => {
    setExerciseVariants(variants);
    localStorage.setItem('shreddit-variants', JSON.stringify(variants));
  };

  const getActiveExercise = (exercise, exerciseKey) => {
    const variantIdx = exerciseVariants[exerciseKey] || 0;
    const variants = [exercise.name, exercise.sub1, exercise.sub2].filter(Boolean);
    return variants[variantIdx] || exercise.name;
  };

  const setExerciseVariant = (exerciseKey, variantIdx) => {
    saveVariants({ ...exerciseVariants, [exerciseKey]: variantIdx });
  };

  return {
    exerciseVariants,
    getActiveExercise,
    setExerciseVariant
  };
};
