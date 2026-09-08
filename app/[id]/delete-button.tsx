"use client";

import styles from "../board.module.css";

export function DeleteButton({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("이 글을 삭제할까요?")) e.preventDefault();
      }}
    >
      <button type="submit" className={styles.dangerButton}>
        삭제
      </button>
    </form>
  );
}
