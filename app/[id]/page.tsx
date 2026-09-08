import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { listComments } from "@/lib/comments";
import { formatDate, formatDateTime } from "@/lib/format";
import { createCommentAction, deletePostAction } from "@/app/actions";
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
  const comments = await listComments(id);
  const addComment = createCommentAction.bind(null, id);

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

      <section className={styles.comments}>
        <h2 className={styles.commentsTitle}>댓글 {comments.length}</h2>

        {comments.length > 0 && (
          <ul className={styles.commentList}>
            {comments.map((comment) => (
              <li key={comment.id} className={styles.commentRow}>
                {comment.isAi && <span className={styles.aiBadge}>AI</span>}
                <p className={styles.commentContent}>{comment.content}</p>
                <span className={styles.commentDate}>
                  {formatDateTime(comment.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form action={addComment} className={styles.commentForm}>
          <textarea
            name="content"
            rows={3}
            placeholder="댓글을 남겨보세요"
            required
          />
          <button type="submit">등록</button>
        </form>
      </section>
    </main>
  );
}
