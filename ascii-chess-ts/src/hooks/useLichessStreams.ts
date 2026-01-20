import { useCallback, useRef, useEffect } from "react";
import { lichessGame } from "../services/lichess/game";
import { lichessAuth } from "../services/lichess/auth";

interface StreamHandle {
  close: () => void;
}

type ConnectionChangeCallback = (connected: boolean, error?: string) => void;
type GameUpdateCallback = (data: any) => void;
type EventCallback = (data: any) => void;

export function useLichessStreams(
  onGameUpdate: GameUpdateCallback,
  onGameConnectionChange: ConnectionChangeCallback,
  onEvent: EventCallback,
) {
  const gameStreamRef = useRef<StreamHandle | null>(null);
  const eventStreamRef = useRef<StreamHandle | null>(null);

  const handleEventConnectionChange = useCallback(
    (connected: boolean, error?: string) => {
      if (!connected && error) {
        console.error("[useLichessStreams] Event stream connection error:", error);
      }
    },
    [],
  );

  const startGameStream = useCallback(
    (gameId: string) => {
      if (gameStreamRef.current) {
        gameStreamRef.current.close();
      }

      gameStreamRef.current = lichessGame.streamGame(
        gameId,
        onGameUpdate,
        onGameConnectionChange,
      );
    },
    [onGameUpdate, onGameConnectionChange],
  );

  const closeGameStream = useCallback(() => {
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
      gameStreamRef.current = null;
    }
  }, []);

  const closeAllStreams = useCallback(() => {
    if (eventStreamRef.current) {
      eventStreamRef.current.close();
      eventStreamRef.current = null;
    }
    closeGameStream();
  }, [closeGameStream]);

  // Handle incoming events (challenges, game starts)
  const handleEvent = useCallback(
    (data: any) => {
      console.log("[useLichessStreams] Event received:", data);

      if (data.type === "gameStart") {
        console.log("[useLichessStreams] Game starting event:", {
          gameId: data.game?.id,
          fullData: data,
        });

        onEvent(data);

        if (data.game?.id) {
          startGameStream(data.game.id);
        }
      } else if (data.type === "challenge") {
        console.log("[useLichessStreams] Challenge received:", data.challenge);
        onEvent(data);
      } else {
        onEvent(data);
      }
    },
    [onEvent, startGameStream],
  );

  // Start event stream when component mounts
  useEffect(() => {
    if (lichessAuth.isAuthenticated()) {
      eventStreamRef.current = lichessGame.streamEvents(
        handleEvent,
        handleEventConnectionChange,
      );
    }

    return () => {
      closeAllStreams();
    };
  }, [handleEvent, handleEventConnectionChange, closeAllStreams]);

  return {
    startGameStream,
    closeGameStream,
    closeAllStreams,
    gameStreamRef,
  };
}
