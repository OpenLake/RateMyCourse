'use client';

import { notFound } from 'next/navigation';
import RateThisProfessor from '../../../components/professors/professor_page/RateThisProfessor';
import ProfessorPageHeader from '../../../components/professors/professor_page/ProfessorPageHeader';
import ProfessorPageStats from '../../../components/professors/professor_page/ProfessorPageStats';
import ProfessorPageCourses from '../../../components/professors/professor_page/ProfessorPageCourses';
import ProfessorPageReviews from '../../../components/professors/professor_page/ProfessorPageReviews';

import PainOMeter from '@/components/courses/PainOMeter';
import { useProfessors } from '@/hooks/useProfessors';

export default function ProfessorPage({ params }: { params: { professorId: string } }) {
  const { professors, isLoading, error } = useProfessors();

  if (isLoading) return <div>Loading professor...</div>;
  if (error) return <div>Error loading professor</div>;

  const prof = professors.find(p => p.id === params.professorId);
  if (!prof) notFound();

  return (
    <div className="container px-4 md:px-6 py-4 mx-auto flex flex-col min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <ProfessorPageHeader professor={prof} />
          <ProfessorPageStats reviewCount={prof.review_count ?? 0} />
          <ProfessorPageCourses courses={prof.coursesTaught} />
          <ProfessorPageReviews id={prof.id} reviewCount={prof.review_count ?? 0} />
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
