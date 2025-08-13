import { supabase } from "@/lib/supabase";

export async function getReviewsByCourseId(courseId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
