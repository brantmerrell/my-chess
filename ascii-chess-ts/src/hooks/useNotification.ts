import { useCallback, useState } from "react";

export type NotificationType = "error" | "warning" | "success" | "info";

export interface Notification {
  message: string;
  type: NotificationType;
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification>({
    message: "",
    type: "info",
  });

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      setNotification({ message, type });
    },
    [],
  );

  const clearNotification = useCallback(() => {
    setNotification({ message: "", type: "info" });
  }, []);

  return { notification, showNotification, clearNotification };
}
