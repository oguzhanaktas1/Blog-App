import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import socket from "../utils/socket";

const NotificationListener = () => {
  const toast = useToast();

  useEffect(() => {
    const handleMention = (data: { message: string; postId: number }) => {
      toast({
        title: "Mentioned!",
        description: data.message,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    };

    socket.on("mention", handleMention);

    return () => {
      socket.off("mention", handleMention);
    };
  }, [toast]);

  return null;
};

export default NotificationListener;
