import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { deletePostAction } from "@/app/actions";
import { DeleteButton } from "./delete-button";
import styles from "../board.module.css";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← 목록
      </Link>
      <article className={styles.article}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
        </div>
        <h1>{post.title}</h1>
        <p className={styles.content}>{post.content}</p>
      </article>
      <div className={styles.actions}>
        <Link href={`/${post.id}/edit`}>수정</Link>
        <DeleteButton action={deletePostAction.bind(null, post.id)} />
      </div>
    </main>
  );
}
