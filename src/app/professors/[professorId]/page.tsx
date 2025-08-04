'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RateThisProfessor from '../../../components/professors/professor_page/RateThisProfessor';
import ProfessorPageHeader from '../../../components/professors/professor_page/ProfessorPageHeader';
import ProfessorPageStats from '../../../components/professors/professor_page/ProfessorPageStats';
import ProfessorPageCourses from '../../../components/professors/professor_page/ProfessorPageCourses';
import ProfessorPageReviews from '../../../components/professors/professor_page/ProfessorPageReviews';
import PainOMeter from '@/components/courses/PainOMeter';
import { useProfessors } from '@/hooks/useProfessors';

export default function ProfessorPage({ params }: { params: { professorId: string } }) {
  const { professors, isLoading, error } = useProfessors();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const prof = professors.find((p) => p.id === params.professorId);

  /* ---------- Fetch Ratings for Professor ---------- */
  useEffect(() => {
    if (!prof?.id) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('overall_rating')
        .eq('target_id', prof.id)
        .eq('target_type', 'professor');

      if (error) {
        console.error('Error fetching ratings:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
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
        {/* Left column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <ProfessorPageHeader
            professor={prof}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
          <ProfessorPageStats reviewCount={reviewCount} />
          {/* <ProfessorPageCourses courses={prof.course_ids} /> */}
          <ProfessorPageReviews id={prof.id} reviewCount={reviewCount} />
        </div>
        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RateThisProfessor professor={prof} />
          {/* <PainOMeter
            difficulty={prof.averageDifficulty ?? 5}
            workload={prof.averageWorkload ?? 5}
            rating={prof.overall_rating ?? 0}
          /> */}
        </div>
      </div>
    </div>
  );
}
