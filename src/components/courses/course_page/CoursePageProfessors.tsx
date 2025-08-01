import { StarRating } from '@/components/common/StarRating';
import { Professor } from '@/types'
import Link from 'next/link';
import React from 'react'

interface CoursePageProfessorsProps {
    professors: Professor[];
}
const CoursePageProfessors = ({professors}: CoursePageProfessorsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden flex flex-col">
                
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
      {professors && (
        <>  
        <div className="p-3 border-b border-muted flex justify-between items-center">
          <h2 className="font-semibold">Current Professor</h2>
          {professors.length > 1 && (
            <Link href="#" className="text-xs text-primary hover:underline">
              View all
            </Link>
          )}
        </div>
        {professors.length > 0 && (
          <div className="p-3">
            <div className="flex items-center gap-3">
              <img 
                src={professors[0].avatar_url} 
                alt={professors[0].name}
                className="rounded-full h-12 w-12 object-cover border-2 border-primary/20"
              />
              <div>
                <h3 className="font-medium text-sm">{professors[0].name}</h3>
                <p className="text-xs text-muted-foreground">{professors[0].department}</p>
                <div className="flex items-center mt-1">
                  <StarRating rating={4.2} />
                </div>
              </div>
            </div>
          </div>
          )}
          </>
        )
      }


    </div>
  </div>
  )
}

export default CoursePageProfessors
