'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RateThisProfessor from '../../../components/professors/professor_page/RateThisProfessor';
import ProfessorPageHeader from '../../../components/professors/professor_page/ProfessorPageHeader';
import ProfessorPageStats from '../../../components/professors/professor_page/ProfessorPageStats';
import ProfessorPageReviews from '../../../components/professors/professor_page/ProfessorPageReviews';
import { useProfessors } from '@/hooks/useProfessors';

export default function ProfessorPage({ params }: { params: { professorId: string } }) {
  const { professors, isLoading, error } = useProfessors();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const prof = professors.find((p) => p.id === params.professorId);

  useEffect(() => {
    if (!prof?.id) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating_value')
        .eq('target_id', prof.id)
        .eq('target_type', 'professor');

      if (error) {
        console.error('Error fetching ratings:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, r) => sum + (r.rating_value || 0), 0);
        const avg = total / data.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
        setReviewCount(data.length);
      } else {
        setAverageRating(0);
        setReviewCount(0);
      }
    };

    fetchRatings();
  }, [prof?.id]);

  if (isLoading) return <div>Loading professor...</div>;
  if (error) return <div>Error loading professor</div>;
  if (!prof) notFound();

  return (
    <div className="container px-4 md:px-6 py-4 mx-auto flex flex-col min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <ProfessorPageHeader
            professor={prof}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
          <ProfessorPageStats professor={prof} reviewCount={reviewCount} />
          <ProfessorPageReviews id={prof.id} reviewCount={reviewCount} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RateThisProfessor professor={prof} />
        </div>
      </div>
    </div>
  );
}
