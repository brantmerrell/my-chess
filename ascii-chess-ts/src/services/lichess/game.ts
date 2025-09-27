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

  async createSeek(
    options: {
      rated?: boolean;
      time?: number;
      increment?: number;
      variant?: string;
      color?: "random" | "white" | "black";
    } = {},
  ): Promise<any> {
    const params: any = {
      rated: options.rated || false,
      time: options.time || 10,
      increment: options.increment || 0,
      variant: options.variant || "standard",
      color: options.color || "random",
    };

    const response = await lichessAuth.makeAuthenticatedRequest("/board/seek", {
      method: "POST",
      data: new URLSearchParams(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
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
