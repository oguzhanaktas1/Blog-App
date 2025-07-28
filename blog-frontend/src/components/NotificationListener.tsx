import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import socket from "../utils/socket";

const NotificationListener = () => {
  const toast = useToast();

  useEffect(() => {
    const handleNotification = (message: string) => {
      toast({
        title: "Yeni Bildirim",
        description: message,
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    };

    socket.on("receive_notification", handleNotification);

    return () => {
      socket.off("receive_notification", handleNotification); // cleanup
    };
  }, [toast]);

  return null;
};

export default NotificationListener;
