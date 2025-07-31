import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import type { RootState } from "../store";
import socket from "../utils/socket";

const SocketMentionHandler = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    socket.emit("user-online", user.id);
    
    socket.on("mention", (data) => {
      console.log("Mention bildirimi geldi:", data);

      if (Notification.permission === "granted") {
        new Notification("Etiketlendin!", {
          body: data.message,
        });
      }

      toast({
        title: "Etiketlendin!",
        description: data.message,
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    });

    return () => {
      socket.off("mention");
    };
  }, [user, toast]);

  return null;
};

export default SocketMentionHandler;
