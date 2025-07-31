/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

type Notification = {
  id: number;
  message: string;
  createdAt: string;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Notification[]>(
        "/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", res.data); // Debug log to see actual response structure
      setNotifications(res.data); // Directly set the data
      setLoading(false);
    } catch (err: any) {
      console.error("Fetch notifications error:", err);
      setLoading(false);
      toast({
        title: "Bildirimler alınamadı",
        description:
          err.response?.data?.message || err.message || "Bir hata oluştu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: "Başarılı",
        description: "Bildirim silindi.",
        status: "success",
        duration: 2000,
      });
    } catch (err: any) {
      toast({
        title: "Silinemedi",
        description:
          err.response?.data?.message || "Bildirim silinirken hata oluştu.",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box minH="100vh" minW="100vw" p={6}>
      <Heading mb={4}>Notifications</Heading>
      {loading ? (
        <Spinner />
      ) : notifications.length === 0 ? (
        <Text>No notifications found.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {notifications.map((notif) => (
            <HStack
              key={notif.id}
              justify="space-between"
              p={3}
              bg="gray.100"
              borderRadius="md"
            >
              <Box>
                <Text>{notif.message}</Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(notif.createdAt).toLocaleString()}
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => deleteNotification(notif.id)}
              >
                Sil
              </Button>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default NotificationsPage;