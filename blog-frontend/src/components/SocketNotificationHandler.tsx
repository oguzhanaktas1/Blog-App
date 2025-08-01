import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast, Box, Text } from "@chakra-ui/react";
import { addNotificationFromSocket } from "../store/slices/notificationSlice";
import socket from "../utils/socket";
import { useNavigate } from "react-router-dom";

const SocketNotificationHandler = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Tarayıcı bildirim izni kontrolü
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    
  }, []);

  useEffect(() => {
    const handleNewNotification = (data: { message: string }) => { 
      // 1. Redux Store'a ekle
      dispatch(addNotificationFromSocket({ content: data.message }));

      // toast bildirimi (tıklanabilir özel bileşen)
      toast({
        duration: 5000,
        isClosable: true,
        position: "top-right",
        render: () => (
          <Box
            p={3}
            bg="blue.500"
            color="white"
            borderRadius="md"
            boxShadow="md"
            cursor="pointer"
            onClick={() => navigate("/notifications")}
          >
            <Text fontWeight="bold">Yeni Bildirim</Text>
            <Text>{data.message}</Text>
          </Box>
        ),
      });

      // 3. Tarayıcı bildirimi (bildirim çubuğu)
      if (Notification.permission === "granted") {
        new Notification("Yeni Bildirim", {
          body: data.message,
          icon: "/logo.png", // varsa favicon tarzı bir görsel
        });
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [dispatch, toast, navigate]);

  return null;
};

export default SocketNotificationHandler;
