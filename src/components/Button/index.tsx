import { ButtonHTMLAttributes, ReactElement } from "react";
import clx from "classnames";
import styles from "./button.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isOutlined?: boolean;
}

export function Button({
  children,
  className,
  isOutlined = false,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      {...props}
      className={clx(styles.button, {
        className: !!className,
        [styles.outlined]: isOutlined,
      })}
    >
      {children}
    </button>
  );
}
