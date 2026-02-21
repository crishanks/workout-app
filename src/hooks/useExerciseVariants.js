import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';

export const useExerciseVariants = () => {
  const [exerciseVariants, setExerciseVariants] = useState({});
  const [userId, setUserId] = useState(null);

  // Get browser fingerprint as user ID
  useEffect(() => {
    const id = getBrowserFingerprint();
    setUserId(id);
  }, []);

  // Load exercise variants from Supabase
  useEffect(() => {
    if (!userId) return;

    const loadVariants = async () => {
      try {
        const { data, error } = await supabase
          .from('exercise_variants')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.variants) {
          setExerciseVariants(data.variants);
        }
      } catch (error) {
        console.error('Error loading exercise variants:', error);
      }
    };

    loadVariants();
  }, [userId]);

  const saveVariants = async (variants) => {
    if (!userId) return;

    setExerciseVariants(variants);

    try {
      const { error } = await supabase
        .from('exercise_variants')
        .upsert({
          user_id: userId,
          variants: variants
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving exercise variants:', error);
    }
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
