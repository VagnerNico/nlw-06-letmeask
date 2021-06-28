import { FormEvent, ReactElement, ReactNode, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import logoImg from "../../assets/logo.svg";
import { Button } from "../Button";
import { RoomCode } from "../RoomCode";
import { useAuth } from "../../hooks/useAuth";
import { useRoom } from "../../hooks/useRoom";
import { database } from "../../services/firebase";
import { DBReferences } from "../../utils/db-references";
import styles from "./room-scaffold.module.scss";

interface RoomParams {
  id: string;
}

interface RoomScaffoldProps {
  children: ReactNode;
  isAdminRoom?: boolean;
}

export function RoomScaffold({
  children,
  isAdminRoom = false,
}: RoomScaffoldProps): ReactElement {
  const { signInWithGoogle, user } = useAuth();
  const history = useHistory();
  const params = useParams<RoomParams>();

  const roomId = params.id;

  const { questions, title } = useRoom({ roomId });
  const [newQuestion, setNewQuestion] = useState<string>("");

  async function handleEndRoom(): Promise<void> {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push(`/`);
  }

  async function handleSendQuestion(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (newQuestion.trim() === "") return;
    if (!user) throw new Error("You must be logged in");
    const question = {
      author: {
        avatar: user.avatar,
        name: user.name,
      },
      content: newQuestion,
      isAnswered: false,
      isHighlighted: false,
    };

    await database
      .ref(`${DBReferences.ROOMS}/${roomId}/questions`)
      .push(question);

    setNewQuestion("");
  }

  return (
    <div id={styles["page-room"]}>
      <header>
        <div className={styles.content}>
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            {isAdminRoom && (
              <Button isOutlined onClick={handleEndRoom} type="button">
                Close room
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className={styles["room-title"]}>
          <h1>Room {title}</h1>
          {questions.length > 0 && (
            <span>
              {questions.length} question{questions.length > 1 ? `s` : ``}
            </span>
          )}
        </div>

        {!isAdminRoom && (
          <form onSubmit={handleSendQuestion}>
            <textarea
              onChange={(event) => setNewQuestion(event.target.value)}
              placeholder="What do you want to ask?"
              value={newQuestion}
            />
            <div className={styles["form-footer"]}>
              {user ? (
                <div className={styles["user-info"]}>
                  <img src={user.avatar} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              ) : (
                <span>
                  To ask something,{" "}
                  <button onClick={() => signInWithGoogle()} type="button">
                    log in.
                  </button>
                </span>
              )}
              <Button disabled={!user} type="submit">
                Ask
              </Button>
            </div>
          </form>
        )}
        <div className={styles["question-list"]}>{children}</div>
      </main>
    </div>
  );
}
