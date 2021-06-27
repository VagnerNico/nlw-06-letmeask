import { FormEvent, ReactElement, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import illustrationImg from "../../assets/illustration.svg";
import logoImg from "../../assets/logo.svg";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";
import { database } from "../../services/firebase";
import { DBReferences } from "../../utils/db-references";

import "../../styles/auth.scss";

export function NewRoom(): ReactElement {
  const history = useHistory();
  const { user } = useAuth();

  const [newRoom, setNewRoom] = useState<string>("");

  async function handleCreateRoom(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (newRoom.trim() === "") return;
    const roomRef = database.ref(DBReferences.ROOMS);

    const firebaseRoom = await roomRef.push({
      authorId: user?.id,
      title: newRoom,
    });

    history.push(`/rooms/${firebaseRoom.key}`);
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
          <h2>Create a new room</h2>
          <form onSubmit={handleCreateRoom}>
            <input
              onChange={(event) => setNewRoom(event.target.value)}
              placeholder="Room's name"
              type="text"
              value={newRoom}
            />
            <Button type="submit">Create room</Button>
          </form>
          <p>
            Want&apos;s to join an existing room? <Link to="/">Click here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
