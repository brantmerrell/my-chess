import { lichessAuth } from "./auth";

interface GameStream {
  type: string;
  id?: string;
  white?: any;
  black?: any;
  state?: any;
  moves?: string;
  wtime?: number;
  btime?: number;
  winc?: number;
  binc?: number;
  status?: string;
  winner?: string;
}

interface Challenge {
  id: string;
  status: string;
  challenger: any;
  destUser: any;
  variant: any;
  rated: boolean;
  speed: string;
  timeControl: any;
  color: string;
  perf: any;
}

interface StreamConfig {
  maxReconnectAttempts?: number;
  reconnectDelayBase?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
}

class LichessGameService {
  private readonly defaultStreamConfig: StreamConfig = {
    maxReconnectAttempts: 5,
    reconnectDelayBase: 1000,
    maxReconnectDelay: 30000,
    heartbeatInterval: 30000,
  };
  async createChallenge(
    username: string,
    options: {
      rated?: boolean;
      clock?: { limit: number; increment: number };
      color?: "random" | "white" | "black";
      variant?: string;
    } = {},
  ): Promise<Challenge> {
    const params: any = {
      rated: options.rated || false,
      color: options.color || "random",
      variant: options.variant || "standard",
    };

    if (options.clock) {
      params["clock.limit"] = options.clock.limit;
      params["clock.increment"] = options.clock.increment;
    }

    const response = await lichessAuth.makeAuthenticatedRequest(
      `/challenge/${username}`,
      {
        method: "POST",
        data: new URLSearchParams(params),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data;
  }

  async acceptChallenge(challengeId: string): Promise<any> {
    const response = await lichessAuth.makeAuthenticatedRequest(
      `/challenge/${challengeId}/accept`,
      { method: "POST" },
    );
    return response.data;
  }

  async declineChallenge(challengeId: string, reason?: string): Promise<any> {
    const params = reason
      ? new URLSearchParams({ reason })
      : new URLSearchParams();
    const response = await lichessAuth.makeAuthenticatedRequest(
      `/challenge/${challengeId}/decline`,
      {
        method: "POST",
        data: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }

  /**
   * Creates a seek by opening a streaming connection.
   * The seek remains active as long as the connection is open.
   * When the connection closes, the seek is cancelled.
   *
   * @returns A handle with a close() method to cancel the seek, or null if not authenticated
   */
  streamSeek(
    options: {
      rated?: boolean;
      time?: number;
      increment?: number;
      variant?: string;
      color?: "random" | "white" | "black";
    } = {},
    onSeekActive?: () => void,
    onSeekClosed?: (reason?: string) => void,
  ): { close: () => void } | null {
    const token = lichessAuth.getToken();
    if (!token) {
      console.error("Not authenticated");
      return null;
    }

    const params = new URLSearchParams({
      rated: String(options.rated || false),
      time: String(options.time || 10),
      increment: String(options.increment || 0),
      variant: options.variant || "standard",
      color: options.color || "random",
    });

    let abortController = new AbortController();
    let isClosed = false;

    const startSeek = async () => {
      try {
        console.log("[LichessGame] Opening seek stream...");

        const response = await fetch(
          `https://lichess.org/api/board/seek`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("[LichessGame] Seek stream connected - seek is now active");
        onSeekActive?.();

        // Keep reading to maintain the connection
        // The seek endpoint doesn't send data, but we need to keep the connection open
        const reader = response.body?.getReader();
        if (reader) {
          while (!isClosed) {
            const { done } = await reader.read();
            if (done) {
              console.log("[LichessGame] Seek stream ended (game matched or server closed)");
              break;
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("[LichessGame] Seek cancelled by user");
          onSeekClosed?.("cancelled");
        } else if (!isClosed) {
          console.error("[LichessGame] Seek stream error:", error);
          onSeekClosed?.(error.message);
        }
      }
    };

    startSeek();

    return {
      close: () => {
        if (!isClosed) {
          console.log("[LichessGame] Closing seek stream");
          isClosed = true;
          abortController.abort();
          onSeekClosed?.("closed");
        }
      },
    };
  }

  async makeMove(gameId: string, move: string): Promise<any> {
    console.log(`Making move: POST /board/game/${gameId}/move/${move}`);

    try {
      const response = await lichessAuth.makeAuthenticatedRequest(
        `/board/game/${gameId}/move/${move}`,
        { method: "POST" },
      );
      console.log("Move API response:", response);
      return response.data;
    } catch (error) {
      console.error("Move API error:", error);
      throw error;
    }
  }

  async resign(gameId: string): Promise<any> {
    const response = await lichessAuth.makeAuthenticatedRequest(
      `/board/game/${gameId}/resign`,
      { method: "POST" },
    );
    return response.data;
  }

  async handleDraw(gameId: string, accept: boolean): Promise<any> {
    const endpoint = accept
      ? `/board/game/${gameId}/draw/accept`
      : `/board/game/${gameId}/draw/offer`;
    const response = await lichessAuth.makeAuthenticatedRequest(endpoint, {
      method: "POST",
    });
    return response.data;
  }

  streamGame(
    gameId: string,
    onMessage: (data: GameStream) => void,
    onConnectionChange?: (connected: boolean, error?: string) => void,
    config?: StreamConfig,
  ): { close: () => void } | null {
    const token = lichessAuth.getToken();
    if (!token) {
      console.error("Not authenticated");
      return null;
    }

    const streamConfig = { ...this.defaultStreamConfig, ...config };
    let abortController = new AbortController();
    let isClosed = false;
    let reconnectAttempts = 0;
    let lastHeartbeat = Date.now();
    let heartbeatTimer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = null;
      }
      abortController.abort();
    };

    const checkHeartbeat = () => {
      const now = Date.now();
      if (now - lastHeartbeat > streamConfig.heartbeatInterval! * 2) {
        console.warn("Game stream heartbeat timeout, reconnecting...");
        cleanup();
        if (!isClosed) {
          reconnect();
        }
      }
    };

    const reconnect = () => {
      if (isClosed || reconnectAttempts >= streamConfig.maxReconnectAttempts!) {
        console.error("Max reconnection attempts reached or stream closed");
        onConnectionChange?.(false, "Max reconnection attempts reached");
        return;
      }

      reconnectAttempts++;
      const delay = Math.min(
        streamConfig.reconnectDelayBase! * Math.pow(2, reconnectAttempts - 1),
        streamConfig.maxReconnectDelay!,
      );

      console.log(
        `Attempting to reconnect game stream (attempt ${reconnectAttempts}) in ${delay}ms...`,
      );

      setTimeout(() => {
        if (!isClosed) {
          abortController = new AbortController();
          startStream();
        }
      }, delay);
    };

    const startStream = async () => {
      try {
        onConnectionChange?.(false, "Connecting...");

        const response = await fetch(
          `https://lichess.org/api/board/game/stream/${gameId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/x-ndjson",
            },
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log("Game stream connected successfully");
        onConnectionChange?.(true);
        reconnectAttempts = 0;
        lastHeartbeat = Date.now();

        if (streamConfig.heartbeatInterval && !heartbeatTimer) {
          heartbeatTimer = setInterval(
            checkHeartbeat,
            streamConfig.heartbeatInterval,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (!isClosed) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Game stream ended");
            break;
          }

          lastHeartbeat = Date.now();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                onMessage(data);
              } catch (e) {
                console.error("Failed to parse game stream data:", e);
              }
            }
          }
        }
      } catch (error: any) {
        if (!isClosed) {
          console.error("Game stream error:", error);
          onConnectionChange?.(false, error.message);

          if (error.name !== "AbortError") {
            reconnect();
          }
        }
      } finally {
        cleanup();
      }
    };

    startStream();

    return {
      close: () => {
        console.log("Closing game stream");
        isClosed = true;
        cleanup();
        onConnectionChange?.(false, "Stream closed");
      },
    };
  }

  streamEvents(
    onMessage: (data: any) => void,
    onConnectionChange?: (connected: boolean, error?: string) => void,
    config?: StreamConfig,
  ): { close: () => void } | null {
    const token = lichessAuth.getToken();
    if (!token) {
      console.error("Not authenticated");
      return null;
    }

    const streamConfig = { ...this.defaultStreamConfig, ...config };
    let abortController = new AbortController();
    let isClosed = false;
    let reconnectAttempts = 0;
    let lastHeartbeat = Date.now();
    let heartbeatTimer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = null;
      }
      abortController.abort();
    };

    const checkHeartbeat = () => {
      const now = Date.now();
      if (now - lastHeartbeat > streamConfig.heartbeatInterval! * 2) {
        console.warn("Event stream heartbeat timeout, reconnecting...");
        cleanup();
        if (!isClosed) {
          reconnect();
        }
      }
    };

    const reconnect = () => {
      if (isClosed || reconnectAttempts >= streamConfig.maxReconnectAttempts!) {
        console.error("Max reconnection attempts reached or stream closed");
        onConnectionChange?.(false, "Max reconnection attempts reached");
        return;
      }

      reconnectAttempts++;
      const delay = Math.min(
        streamConfig.reconnectDelayBase! * Math.pow(2, reconnectAttempts - 1),
        streamConfig.maxReconnectDelay!,
      );

      console.log(
        `Attempting to reconnect event stream (attempt ${reconnectAttempts}) in ${delay}ms...`,
      );

      setTimeout(() => {
        if (!isClosed) {
          abortController = new AbortController();
          startStream();
        }
      }, delay);
    };

    const startStream = async () => {
      try {
        onConnectionChange?.(false, "Connecting...");

        const response = await fetch(`https://lichess.org/api/stream/event`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/x-ndjson",
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log("Event stream connected successfully");
        onConnectionChange?.(true);
        reconnectAttempts = 0;
        lastHeartbeat = Date.now();

        if (streamConfig.heartbeatInterval && !heartbeatTimer) {
          heartbeatTimer = setInterval(
            checkHeartbeat,
            streamConfig.heartbeatInterval,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (!isClosed) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Event stream ended");
            break;
          }

          lastHeartbeat = Date.now();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                onMessage(data);
              } catch (e) {
                console.error("Failed to parse event stream data:", e);
              }
            }
          }
        }
      } catch (error: any) {
        if (!isClosed) {
          console.error("Event stream error:", error);
          onConnectionChange?.(false, error.message);

          if (error.name !== "AbortError") {
            reconnect();
          }
        }
      } finally {
        cleanup();
      }
    };

    startStream();

    return {
      close: () => {
        console.log("Closing event stream");
        isClosed = true;
        cleanup();
        onConnectionChange?.(false, "Stream closed");
      },
    };
  }

  async getOngoingGames(): Promise<any[]> {
    const response =
      await lichessAuth.makeAuthenticatedRequest("/account/playing");
    return response.data.nowPlaying || [];
  }

  /**
   * Polls for game events as a fallback for browsers that don't support streaming fetch.
   * This is used on iOS/Safari where ReadableStream has issues.
   *
   * Polls /account/playing to detect new games starting.
   */
  pollEvents(
    onMessage: (data: any) => void,
    onConnectionChange?: (connected: boolean, error?: string) => void,
    pollInterval: number = 2000,
  ): { close: () => void } | null {
    const token = lichessAuth.getToken();
    if (!token) {
      console.error("Not authenticated");
      return null;
    }

    let isClosed = false;
    let pollTimer: NodeJS.Timeout | null = null;
    let knownGameIds = new Set<string>();
    let isFirstPoll = true;

    const poll = async () => {
      if (isClosed) return;

      try {
        const games = await this.getOngoingGames();

        if (isFirstPoll) {
          // On first poll, just record existing games without triggering events
          games.forEach((game: any) => knownGameIds.add(game.gameId));
          isFirstPoll = false;
          onConnectionChange?.(true);
          console.log("[LichessGame] Polling started, known games:", knownGameIds.size);
        } else {
          // Check for new games
          for (const game of games) {
            if (!knownGameIds.has(game.gameId)) {
              console.log("[LichessGame] New game detected via polling:", game.gameId);
              knownGameIds.add(game.gameId);

              // Emit synthetic gameStart event
              onMessage({
                type: "gameStart",
                game: {
                  id: game.gameId,
                  fullId: game.fullId,
                  color: game.color,
                  fen: game.fen,
                  hasMoved: game.hasMoved,
                  isMyTurn: game.isMyTurn,
                  lastMove: game.lastMove,
                  opponent: game.opponent,
                  perf: game.perf,
                  rated: game.rated,
                  secondsLeft: game.secondsLeft,
                  source: "polling", // Mark this as from polling
                },
              });
            }
          }

          // Clean up ended games from known set
          const currentGameIds = new Set(games.map((g: any) => g.gameId));
          knownGameIds.forEach((id) => {
            if (!currentGameIds.has(id)) {
              knownGameIds.delete(id);
            }
          });
        }
      } catch (error: any) {
        console.error("[LichessGame] Polling error:", error);
        if (!isClosed) {
          onConnectionChange?.(false, error.message);
        }
      }

      // Schedule next poll
      if (!isClosed) {
        pollTimer = setTimeout(poll, pollInterval);
      }
    };

    // Start polling
    poll();

    return {
      close: () => {
        console.log("[LichessGame] Stopping event polling");
        isClosed = true;
        if (pollTimer) {
          clearTimeout(pollTimer);
          pollTimer = null;
        }
        onConnectionChange?.(false, "Polling stopped");
      },
    };
  }

  async challengeAI(
    level: number = 1,
    options: {
      clock?: { limit: number; increment: number };
      color?: "random" | "white" | "black";
      variant?: string;
    } = {},
  ): Promise<any> {
    const params: any = {
      level: Math.min(Math.max(level, 1), 8),
      color: options.color || "random",
      variant: options.variant || "standard",
    };

    if (options.clock) {
      params["clock.limit"] = options.clock.limit;
      params["clock.increment"] = options.clock.increment;
    }

    const response = await lichessAuth.makeAuthenticatedRequest(
      "/challenge/ai",
      {
        method: "POST",
        data: new URLSearchParams(params),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }
}

export const lichessGame = new LichessGameService();
