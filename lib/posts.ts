import { supabase } from "@/lib/supabaseClient";

export type Category = "일기" | "단상" | "평가";

export type Post = {
  id: string;
  title: string;
  category: Category;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type PostRow = {
  id: string;
  title: string;
  category: Category;
  content: string;
  created_at: string;
  updated_at: string;
};

function fromRow(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPosts(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { posts: (data as PostRow[]).map(fromRow), total, page, totalPages };
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as PostRow) : null;
}

export async function createPost(input: {
  title: string;
  category: Category;
  content: string;
}): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({ title: input.title, category: input.category, content: input.content })
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as PostRow);
}

export async function updatePost(
  id: string,
  input: { title: string; category: Category; content: string }
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      category: input.category,
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as PostRow) : null;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
