import { FormEvent, ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";
import toast from "react-hot-toast";
import googleIconImg from "../../assets/google-icon.svg";
import illustrationImg from "../../assets/illustration.svg";
import logoImg from "../../assets/logo.svg";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";
import { database } from "../../services/firebase";
import { DBReferences } from "../../utils/db-references";

import "../../styles/auth.scss";

export function Home(): ReactElement {
  const { user, signInWithGoogle } = useAuth();
  const history = useHistory();

  const [roomCode, setRoomCode] = useState<string>("");

  async function handleCreateRoom(): Promise<void> {
    if (!user) {
      await signInWithGoogle();
    }
    history.push("rooms/new");
  }

  async function handleJoinRoom(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (roomCode.trim() === "") return;

    const roomRef = await database
      .ref(`${DBReferences.ROOMS}/${roomCode}`)
      .get();

    if (!roomRef.exists()) {
      toast.error(`Room does not exists`);
      return;
    }

    if (roomRef.val().endedAt) {
      toast.error(`Room already closed`);
      return;
    }

    history.push(`rooms/${roomRef.key}`);
  }

  return (
    <div id="page-auth">
      <aside>
        <img
          alt="Illustration for questions and answers"
          src={illustrationImg}
        />
        <strong>Create rooms for live Q&amp;A</strong>
        <p>Answer your audience&apos;s questions in real-time</p>
      </aside>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          <Button
            className="create-room"
            onClick={handleCreateRoom}
            type="button"
          >
            <img src={googleIconImg} alt="Google trademark" />
            Create your room with Google
          </Button>
          <div className="separator">or enter in a room</div>
          <form onSubmit={handleJoinRoom}>
            <input
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Type the room code"
              type="text"
              value={roomCode}
            />
            <Button type="submit">Join room</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
