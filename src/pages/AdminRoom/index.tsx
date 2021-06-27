import React, { ReactElement, useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import Modal from "react-modal";
import toast from "react-hot-toast";
import logoImg from "../../assets/logo.svg";
import { Button } from "../../components/Button";
import { Question } from "../../components/Question";
import { RoomCode } from "../../components/RoomCode";
import { useRoom } from "../../hooks/useRoom";
import answerImg from "../../assets/answer.svg";
import cancelImg from "../../assets/cancel.svg";
import checkImg from "../../assets/check.svg";
import deleteImg from "../../assets/delete.svg";
import { database } from "../../services/firebase";
import { useLoader } from "../../hooks/useLoader";
import "../../styles/room.scss";

interface RoomParams {
  id: string;
}

export function AdminRoom(): ReactElement {
  const { changeLoadingState } = useLoader();
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { questions, title } = useRoom({ roomId });

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  async function handleDeleteQuestion(questionId: string): Promise<void> {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
  }

  async function handleEndRoom(): Promise<void> {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push(`/`);
  }

  async function handleHighlightQuestion(questionId: string): Promise<void> {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  async function handleQuestionAsAnswered(questionId: string): Promise<void> {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  useEffect(() => {
    changeLoadingState(true);
    database
      .ref(`rooms/${roomId}`)
      .get()
      .then((roomRef) => {
        if (roomRef.val().endedAt) {
          toast.error(`Room already closed`);
          history.push(`/`);
        }
        changeLoadingState(false);
      });
  }, [changeLoadingState, history, roomId]);

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={handleEndRoom} type="button">
              Close room
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Room {title}</h1>
          {questions.length > 0 && (
            <span>
              {questions.length} question{questions.length > 1 ? `s` : ``}
            </span>
          )}
        </div>
        <div className="question-list">
          {questions.map((question) => (
            <Question
              author={question.author}
              content={question.content}
              key={question.id}
              isAnswered={question.isAnswered}
              isHighlighted={question.isHighlighted}
            >
              {!question.isAnswered && (
                <>
                  <button
                    onClick={() => handleQuestionAsAnswered(question.id)}
                    type="button"
                  >
                    <img src={checkImg} alt="Highlight question" />
                  </button>
                  <button
                    onClick={() => handleHighlightQuestion(question.id)}
                    type="button"
                  >
                    <img src={answerImg} alt="Mark question as answered" />
                  </button>
                </>
              )}
              <button onClick={() => setModalIsOpen(true)} type="button">
                <img src={deleteImg} alt="Remove question" />
              </button>
              <Modal
                appElement={document.getElementById("root") || undefined}
                className="remove-dialog"
                contentLabel="Remove question modal"
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={{
                  content: {
                    alignSelf: "center",
                    background: "#ffffff",
                    height: "fit-content",
                    padding: "4rem",
                    width: "fit-content",
                  },
                  overlay: {
                    alignItems: "center",
                    background: "rgba(5, 2, 6, 0.8)",
                    display: "flex",
                    justifyContent: "center",
                  },
                }}
              >
                <button onClick={() => setModalIsOpen(false)}>
                  <img alt="Close the modal" src={cancelImg} />
                </button>
                <p>Close room</p>
                <span>Are you sure about closing this room?</span>
                <div>
                  <Button onClick={() => setModalIsOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDeleteQuestion(question.id)}
                    type="button"
                  >
                    Sure, close
                  </Button>
                </div>
              </Modal>
            </Question>
          ))}
        </div>
      </main>
    </div>
  );
}
