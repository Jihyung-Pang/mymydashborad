import { supabase } from "@/lib/supabaseClient";

export type Comment = {
  id: string;
  postId: string;
  content: string;
  isAi: boolean;
  createdAt: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
};

function fromRow(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    content: row.content,
    isAi: row.is_ai,
    createdAt: row.created_at,
  };
}

export async function listComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as CommentRow[]).map(fromRow);
}

export async function createComment(
  postId: string,
  content: string,
  options?: { isAi?: boolean }
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, content, is_ai: options?.isAi ?? false })
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as CommentRow);
}
