import { ReactElement, useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { Button } from "../../components/Button";
import { Question } from "../../components/Question";
import { useRoom } from "../../hooks/useRoom";
import answerImg from "../../assets/answer.svg";
import cancelImg from "../../assets/cancel.svg";
import checkImg from "../../assets/check.svg";
import deleteImg from "../../assets/delete.svg";
import { database } from "../../services/firebase";
import { useLoader } from "../../hooks/useLoader";
import { RoomScaffold } from "../../components/RoomScaffold";
import styles from "../../components/RoomScaffold/room-scaffold.module.scss";

Modal.setAppElement(document.getElementById("root") as HTMLDivElement);
interface ModalOpen {
  isOpen: true;
  questionId: string;
}

interface ModalClosed {
  isOpen: false;
  questionId: undefined;
}

type ModalState = ModalOpen | ModalClosed;

interface RoomParams {
  id: string;
}

export function AdminRoom(): ReactElement {
  const { changeLoadingState } = useLoader();
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { questions } = useRoom({ roomId });

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    questionId: undefined,
  });

  async function handleDeleteQuestion(questionId: string): Promise<void> {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
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
    <RoomScaffold isAdminRoom>
      <Modal
        className={styles["remove-dialog"]}
        closeTimeoutMS={600}
        contentLabel="Remove question modal"
        isOpen={modalState.isOpen}
        onRequestClose={() =>
          setModalState({ isOpen: false, questionId: undefined })
        }
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
        <button
          onClick={() =>
            setModalState({ isOpen: false, questionId: undefined })
          }
        >
          <img alt="Close the modal" src={cancelImg} />
        </button>
        <p>Close room</p>
        <span>Are you sure about closing this room?</span>
        <div>
          <Button
            onClick={() =>
              setModalState({ isOpen: false, questionId: undefined })
            }
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={
              modalState.isOpen
                ? () => handleDeleteQuestion(modalState.questionId)
                : undefined
            }
            type="button"
          >
            Sure, close
          </Button>
        </div>
      </Modal>
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
          <button
            onClick={() =>
              setModalState({
                isOpen: true,
                questionId: question.id,
              })
            }
            type="button"
          >
            <img src={deleteImg} alt="Remove question" />
          </button>
        </Question>
      ))}
    </RoomScaffold>
  );
}
