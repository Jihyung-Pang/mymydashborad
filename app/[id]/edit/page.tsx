import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { updatePostAction } from "@/app/actions";
import styles from "../../board.module.css";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const action = updatePostAction.bind(null, id);

  return (
    <main className={styles.main}>
      <Link href={`/${id}`} className={styles.back}>
        ← 돌아가기
      </Link>
      <form action={action} className={styles.form}>
        <select name="category" defaultValue={post.category}>
          <option value="일기">일기</option>
          <option value="단상">단상</option>
          <option value="평가">평가</option>
        </select>
        <input type="text" name="title" defaultValue={post.title} required />
        <textarea name="content" rows={14} defaultValue={post.content} />
        <div className={styles.actions}>
          <Link href={`/${id}`}>취소</Link>
          <button type="submit">저장</button>
        </div>
      </form>
    </main>
  );
}
