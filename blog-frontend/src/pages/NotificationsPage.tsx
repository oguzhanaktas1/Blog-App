/* eslint-disable @typescript-eslint/no-explicit-any */
 

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  useToast,
  Grid,
  GridItem,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";

type Notification = {
  id: number;
  message: string;
  createdAt: string;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // "Hepsini Sil" butonu için AlertDialog state'leri
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const notificationBg = useColorModeValue("white", "gray.700");
  const notificationBorderColor = useColorModeValue("gray.200", "gray.600");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Notification[]>(
        "http://localhost:3000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(res.data);
    } catch (err: any) {
      console.error("Fetch notifications error:", err);
      toast({
        title: "Bildirimler alınamadı",
        description:
          err.response?.data?.message || err.message || "Bir hata oluştu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({
          title: "Başarılı",
          description: "Bildirim silindi.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (err: any) {
        toast({
          title: "Silinemedi",
          description:
            err.response?.data?.message || "Bildirim silinirken hata oluştu.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:3000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]); 
      toast({
        title: "Başarılı",
        description: "Tüm bildirimler silindi.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: "Silinemedi",
        description:
          err.response?.data?.message ||
          "Tüm bildirimler silinirken hata oluştu.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast, onClose]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Box minH="100vh" minW="100vw" p={6} bg={useColorModeValue("gray.50", "gray.900")}>
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 2fr 1fr" }}
        gap={8}
        maxW="container.xl" // Genişliği sınırla
        mx="auto" // Ortala
        py={10} // Üstten ve alttan boşluk
      >
        {/* Sol sütun (boş bırakılabilir veya ek içerik eklenebilir) */}
        <GridItem colSpan={1} display={{ base: "none", md: "block" }}>
          {/* Buraya reklam, navigasyon veya boş bırakılabilir */}
        </GridItem>

        {/* Orta sütun - Bildirimler */}
        <GridItem colSpan={{ base: 1, md: 1 }}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="xl">Notifications</Heading>
              {notifications.length > 0 && (
                <Button colorScheme="red" onClick={onOpen}>
                  Hepsini Sil
                </Button>
              )}
            </HStack>

            {loading ? (
              <Box display="flex" justifyContent="center" py={10}>
                <Spinner size="xl" />
              </Box>
            ) : notifications.length === 0 ? (
              <Text fontSize="lg" color="gray.500" textAlign="center" py={10}>
                Hiç bildirim bulunamadı.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {notifications.map((notif) => (
                  <HStack
                    key={notif.id}
                    justify="space-between"
                    p={4}
                    bg={notificationBg}
                    borderRadius="lg"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={notificationBorderColor}
                    _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                    transition="all 0.2s ease-in-out"
                  >
                    <Box>
                      <Text fontWeight="medium" fontSize="md">
                        {notif.message}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {new Date(notif.createdAt).toLocaleString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => deleteNotification(notif.id)}
                    >
                      Sil
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </GridItem>

        {/* Sağ sütun (boş bırakılabilir veya ek içerik eklenebilir) */}
        <GridItem colSpan={1} display={{ base: "none", md: "block" }}>
          {/* Buraya reklam, trendler veya boş bırakılabilir */}
        </GridItem>
      </Grid>

      {/* "Hepsini Sil" Onay Diyaloğu */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Tüm Bildirimleri Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Tüm bildirimleri silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={deleteAllNotifications} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default NotificationsPage;