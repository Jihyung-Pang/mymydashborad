import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import styles from "./board.module.css";

const PAGE_SIZE = 10;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, totalPages } = await listPosts(page, PAGE_SIZE);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>하루하루</h1>
        <Link href="/new" className={styles.newLink}>
          + 새 글
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>아직 기록이 없어요. 오늘 하루를 남겨보세요.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id} className={styles.row}>
              <Link href={`/${post.id}`} className={styles.rowLink}>
                <span className={styles.category}>{post.category}</span>
                <span className={styles.title}>{post.title}</span>
                <span className={styles.date}>{formatDate(post.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className={styles.pager}>
          {page > 1 ? <Link href={`/?page=${page - 1}`}>이전</Link> : <span />}
          <span>
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/?page=${page + 1}`}>다음</Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
