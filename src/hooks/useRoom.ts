import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

export interface FirebaseQuestions {
  author: {
    avatar: string;
    name: string;
  };
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likes?: Record<string, { authorId: string }>;
}

interface QuestionProps extends FirebaseQuestions {
  id: string;
  likedCount: number;
  likeId?: string;
}

interface UseRoomProps {
  roomId: string;
}

interface UseRoomReturn {
  questions: QuestionProps[];
  title: string;
}

export function useRoom({ roomId }: UseRoomProps): UseRoomReturn {
  const { user } = useAuth();
  const { id: userId } = user ?? {};
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    roomRef.on("value", (room) => {
      const databaseRoom = room.val();
      const firebaseQuestions: Record<string, FirebaseQuestions> =
        databaseRoom.questions ?? {};
      const parsedQuestions = Object.entries(firebaseQuestions || {}).map(
        ([key, value]): QuestionProps => ({
          author: value.author,
          content: value.content,
          id: key,
          isAnswered: value.isAnswered,
          isHighlighted: value.isHighlighted,
          likedCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(
            ([_likeKey, like]) => like.authorId === userId
          )?.[0],
        })
      );
      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
    });
    return () => roomRef.off("value");
  }, [roomId, userId]);

  return { questions, title };
}
