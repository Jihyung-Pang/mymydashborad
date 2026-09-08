"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPost, deletePost, updatePost, type Category } from "@/lib/posts";
import { createComment } from "@/lib/comments";

const CATEGORIES: Category[] = ["일기", "단상", "평가"];

function readFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "");
  const category = (CATEGORIES as string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : "일기";
  const content = String(formData.get("content") ?? "");
  return { title, category, content };
}

export async function createPostAction(formData: FormData) {
  const { title, category, content } = readFields(formData);
  if (!title) return;
  const post = await createPost({ title, category, content });
  revalidatePath("/");
  redirect(`/${post.id}`);
}

export async function updatePostAction(id: string, formData: FormData) {
  const { title, category, content } = readFields(formData);
  if (!title) return;
  await updatePost(id, { title, category, content });
  revalidatePath("/");
  revalidatePath(`/${id}`);
  redirect(`/${id}`);
}

export async function deletePostAction(id: string) {
  await deletePost(id);
  revalidatePath("/");
  redirect("/");
}

export async function createCommentAction(postId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  await createComment(postId, content);
  revalidatePath(`/${postId}`);
}
