import { ReactElement, ReactNode } from "react";
import clx from "classnames";
import styles from "./question.module.scss";

interface QuestionProps {
  author: {
    avatar: string;
    name: string;
  };
  children?: ReactNode;
  content: string;
  isAnswered?: boolean;
  isHighlighted?: boolean;
}

export function Question({
  author,
  children,
  content,
  isAnswered = false,
  isHighlighted = false,
}: QuestionProps): ReactElement {
  return (
    <div
      className={clx(styles.question, {
        [styles.answered]: isAnswered,
        [styles.highlighted]: isHighlighted && !isAnswered,
      })}
    >
      <p>{content}</p>
      <footer>
        <div className={styles["user-info"]}>
          <img src={author.avatar} alt={author.name} />
          <span>{author.name}</span>
        </div>
        {children && <div>{children}</div>}
      </footer>
    </div>
  );
}
