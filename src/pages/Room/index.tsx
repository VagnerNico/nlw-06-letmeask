import { FormEvent, ReactElement, useState } from "react";
import { useParams } from "react-router-dom";
import clx from "classnames";
import logoImg from "../../assets/logo.svg";
import { Button } from "../../components/Button";
import { Question } from "../../components/Question";
import questionStyles from "../../components/Question/question.module.scss";
import { RoomCode } from "../../components/RoomCode";
import { useAuth } from "../../hooks/useAuth";
import { useRoom } from "../../hooks/useRoom";
import { database } from "../../services/firebase";
import { DBReferences } from "../../utils/db-references";
import "../../styles/room.scss";

interface RoomParams {
  id: string;
}

export function Room(): ReactElement {
  const { user } = useAuth();
  const params = useParams<RoomParams>();

  const roomId = params.id;

  const { questions, title } = useRoom({ roomId });
  const [newQuestion, setNewQuestion] = useState<string>("");

  async function handleLikeQuestion(
    questionId: string,
    likeId?: string
  ): Promise<void> {
    if (likeId) {
      await database
        .ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`)
        .remove();
      return;
    }
    await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
      authorId: user?.id,
    });
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
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main className="content">
        <div className="room-title">
          <h1>Room {title}</h1>
          {questions.length > 0 && (
            <span>
              {questions.length} question{questions.length > 1 ? `s` : ``}
            </span>
          )}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            onChange={(event) => setNewQuestion(event.target.value)}
            placeholder="What do you want to ask?"
            value={newQuestion}
          />
          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>
                To ask something, <button type="button">log in.</button>
              </span>
            )}
            <Button disabled={!user} type="submit">
              Ask
            </Button>
          </div>
        </form>
        <div className="question-list">
          {questions.map((question) => (
            <Question
              author={question.author}
              content={question.content}
              key={question.id}
            >
              {!question.isAnswered && (
                <button
                  aria-label="Like button"
                  className={clx(questionStyles["like-button"], {
                    [questionStyles.liked]: question.likeId,
                  })}
                  onClick={() =>
                    handleLikeQuestion(question.id, question.likeId)
                  }
                  type="button"
                >
                  {question.likedCount > 0 && (
                    <span>{question.likedCount}</span>
                  )}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
                      stroke="#737380"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </Question>
          ))}
        </div>
      </main>
    </div>
  );
}
