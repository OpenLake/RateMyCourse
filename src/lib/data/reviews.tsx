import { supabase } from "@/lib/supabase";

export async function getReviewsByCourseId(courseId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("target_id", courseId)
    .eq("target_type", "course")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
