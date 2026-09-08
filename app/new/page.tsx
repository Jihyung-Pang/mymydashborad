import Link from "next/link";
import { createPostAction } from "@/app/actions";
import styles from "../board.module.css";

export const metadata = { title: "새 글 · 하루하루" };

export default function NewPostPage() {
  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← 목록
      </Link>
      <form action={createPostAction} className={styles.form}>
        <select name="category" defaultValue="일기">
          <option value="일기">일기</option>
          <option value="단상">단상</option>
          <option value="평가">평가</option>
        </select>
        <input type="text" name="title" placeholder="제목" required autoFocus />
        <textarea
          name="content"
          rows={14}
          placeholder="오늘 하루는 어땠나요?"
        />
        <div className={styles.actions}>
          <Link href="/">취소</Link>
          <button type="submit">저장</button>
        </div>
      </form>
    </main>
  );
}
