import { ReactElement } from "react";
import copyImg from "../../assets/copy.svg";

import styles from "./room-code.module.scss";

interface RoomCodeProps {
  code: string;
}

export function RoomCode({ code }: RoomCodeProps): ReactElement {
  function copyRoomCodeToClipboard(): void {
    navigator.clipboard.writeText(code);
  }
  return (
    <button className={styles["room-code"]} onClick={copyRoomCodeToClipboard}>
      <div>
        <img src={copyImg} alt="Copy room code" />
      </div>
      <span>Room #{code}</span>
    </button>
  );
}
