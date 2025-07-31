// blog-frontend/src/pages/AdminDashboard.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Spinner,
  Container,
  Flex,
  useColorModeValue,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";

// Mevcut Interface'ler
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  profilePhoto?: string; // Profil fotoğrafı da eklenebilir
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string; // Tarihi de gösterebiliriz
}

interface Comment {
  id: number;
  text: string;
  postId: number;
  createdAt: string; // Tarihi de gösterebiliriz
}

// Yeni Interface'ler
interface Like {
  id: number;
  postId: number;
  // userId: number; // Zaten UserDetails içinde olduğu için burada gerek yok
}

interface Image {
  id: number;
  url: string;
  uploadedAt: string; // Yükleme tarihi
  postId?: number; // Hangi posta ait olduğu
}

interface Reaction {
  id: number;
  type: string;
  postId?: number;
  commentId?: number;
  createdAt: string;
}

interface Notification {
  id: number;
  type: string;
  message?: string; // Daha önceki bildirim çözümünden sonra 'message' olmalı
  createdAt: string;
  read: boolean;
  senderId: number; // Gönderen kullanıcı ID'si
  receiverId: number; // Alan kullanıcı ID'si (Zaten bu kullanıcının kendisi)
  postId?: number;
  commentId?: number;
}


// UserDetails interface'ini güncelliyoruz
interface UserDetails extends User {
  posts: Post[];
  comments: Comment[];
  likes: Like[]; // Yeni eklendi
  images: Image[]; // Yeni eklendi
  reactions: Reaction[]; // Yeni eklendi
  sentNotifications: Notification[]; // Yeni eklendi
  receivedNotifications: Notification[]; // Yeni eklendi
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boxBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const role = getUserRole();
    if (role !== "admin") {
      navigate("/"); // admin değilse anasayfaya at
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // Docker için localhost:3000 adresi uygun. Proxy'yi zaten ayarlamış olmanız beklenir.
      const res = await fetch("http://localhost:3000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Hata: ${res.status} - ${text}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserDetails = async (id: number) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // Docker için localhost:3000 adresi uygun.
      const res = await fetch(`http://localhost:3000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json(); // Hata mesajını yakalamak için
        throw new Error(errorData.message || "Kullanıcı detayları yüklenirken hata oluştu.");
      }
      const data = await res.json();
      setSelectedUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <Flex
      direction="column"
      minH="100vh"
      minW="100vw"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      {/* Hero Banner */}
      <Box
        w="100%"
        py={{ base: 10, md: 16 }}
        px={0}
        textAlign="center"
        bgGradient="linear(to-r, teal.400, blue.400)"
        color="white"
        mb={6}
      >
        <Container maxW="container.xl">
          <Heading
            fontWeight="extrabold"
            fontSize={{ base: "3xl", md: "5xl" }}
            mb={4}
          >
            Admin Dashboard
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }}>
            Manage users, view posts and comments in one place.
          </Text>
        </Container>
      </Box>

      {/* Ana içerik */}
      <Box flexGrow={1} overflowY="auto" w="100%">
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} pb={10}>
          {error && (
            <Text color="red.500" mb={4}>
              {error}
            </Text>
          )}

          <Heading size="lg" mb={4}>
            Registered Users
          </Heading>

          {loadingUsers ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="teal.400" />
            </Flex>
          ) : (
            <Table variant="striped" colorScheme="gray" size="md" mb={10}>
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Name</Th>
                  <Th>Username</Th>
                  <Th>Role</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr
                    key={user.id}
                    _hover={{ bg: "gray.100", cursor: "pointer" }}
                    onClick={() => fetchUserDetails(user.id)}
                  >
                    <Td>{user.name}</Td>
                    <Td>{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge
                        colorScheme={user.role === "admin" ? "green" : "blue"}
                      >
                        {user.role}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {loadingDetails ? (
            <Flex justify="center" py={4}>
              <Spinner size="lg" color="teal.400" />
            </Flex>
          ) : selectedUser ? (
            <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
              <Heading size="md" mb={2}>
                User Details
              </Heading>
              <Text>
                <strong>Name:</strong> {selectedUser.name}
              </Text>
              <Text>
                <strong>Username:</strong> {selectedUser.username}
              </Text>
              <Text>
                <strong>Email:</strong> {selectedUser.email}
              </Text>
              <Text mb={4}>
                <strong>Role:</strong>{" "}
                <Badge
                  colorScheme={selectedUser.role === "admin" ? "green" : "blue"}
                >
                  {selectedUser.role}
                </Badge>
              </Text>
              {selectedUser.profilePhoto && ( // Profil fotoğrafı varsa göster
                <Text mb={4}>
                  <strong>Profile Photo:</strong> <a href={selectedUser.profilePhoto} target="_blank" rel="noopener noreferrer" style={{ color: '#319795', textDecoration: 'underline' }}>View Photo</a>
                </Text>
              )}

              <Divider my={4} /> {/* Ayırıcı */}

              {/* TABS BAŞLANGICI */}
              <Tabs variant="enclosed" colorScheme="teal" isLazy> {/* isLazy ile sadece seçilen tab içeriği render edilir */}
                <TabList>
                  <Tab>Posts ({selectedUser.posts.length})</Tab>
                  <Tab>Comments ({selectedUser.comments.length})</Tab>
                  <Tab>Likes ({selectedUser.likes.length})</Tab>
                  <Tab>Images ({selectedUser.images.length})</Tab>
                  <Tab>Reactions ({selectedUser.reactions.length})</Tab>
                  <Tab>Sent Notifs ({selectedUser.sentNotifications.length})</Tab>
                  <Tab>Received Notifs ({selectedUser.receivedNotifications.length})</Tab>
                </TabList>

                <TabPanels>
                  {/* Posts TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Posts</Heading>
                    {selectedUser.posts.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.posts.map((post) => (
                          <Box
                            key={post.id}
                            p={3}
                            w="100%"
                            borderWidth={1}
                            borderRadius="md"
                          >
                            <Text fontSize="sm" color="gray.500">
                              Post ID: <a href={`/posts/${post.id}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{post.id}</a>
                            </Text>
                            <Text fontWeight="bold">{post.title}</Text>
                            <Text fontSize="sm" noOfLines={2}>
                              {post.content}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Created At: {new Date(post.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No posts</Text>
                    )}
                  </TabPanel>

                  {/* Comments TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Comments</Heading>
                    {selectedUser.comments.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.comments.map((comment) => (
                          <Box
                            key={comment.id}
                            p={3}
                            w="100%"
                            borderWidth={1}
                            borderRadius="md"
                          >
                            <Text fontSize="sm" color="gray.500">
                              Post ID: <a href={`/posts/${comment.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{comment.postId}</a>
                            </Text>
                            <Text mb={1}>{comment.text}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Created At: {new Date(comment.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No comments</Text>
                    )}
                  </TabPanel>

                  {/* Likes TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Likes</Heading>
                    {selectedUser.likes.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.likes.map((like) => (
                          <Box key={like.id} p={3} w="100%" borderWidth={1} borderRadius="md">
                            <Text>Liked Post ID: <a href={`/posts/${like.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{like.postId}</a></Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No likes</Text>
                    )}
                  </TabPanel>

                  {/* Images TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Uploaded Images</Heading>
                    {selectedUser.images.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.images.map((image) => (
                          <Box key={image.id} p={3} w="100%" borderWidth={1} borderRadius="md">
                            <Text>Image ID: {image.id}</Text>
                            <Text>URL: <a href={image.url} target="_blank" rel="noopener noreferrer" style={{ color: '#319795', textDecoration: 'underline' }}>{image.url}</a></Text>
                            {image.postId && <Text>Associated Post ID: <a href={`/posts/${image.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{image.postId}</a></Text>}
                            <Text fontSize="xs" color="gray.500">
                              Uploaded At: {new Date(image.uploadedAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No images uploaded</Text>
                    )}
                  </TabPanel>

                  {/* Reactions TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Reactions</Heading>
                    {selectedUser.reactions.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.reactions.map((reaction) => (
                          <Box key={reaction.id} p={3} w="100%" borderWidth={1} borderRadius="md">
                            <Text>Type: <Badge>{reaction.type}</Badge></Text>
                            {reaction.postId && <Text>To Post ID: <a href={`/posts/${reaction.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{reaction.postId}</a></Text>}
                            {reaction.commentId && <Text>To Comment ID: <a href={`/posts/${reaction.commentId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{reaction.commentId}</a></Text>}
                            <Text fontSize="xs" color="gray.500">
                              Created At: {new Date(reaction.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No reactions</Text>
                    )}
                  </TabPanel>

                  {/* Sent Notifications TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Sent Notifications</Heading>
                    {selectedUser.sentNotifications.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.sentNotifications.map((notification) => (
                          <Box key={notification.id} p={3} w="100%" borderWidth={1} borderRadius="md">
                            <Text>Type: <Badge>{notification.type}</Badge></Text>
                            {notification.message && <Text>Message: {notification.message}</Text>}
                            <Text>Receiver ID: {notification.receiverId}</Text>
                            {notification.postId && <Text>Related Post ID: <a href={`/posts/${notification.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{notification.postId}</a></Text>}
                            {notification.commentId && <Text>Related Comment ID: <a href={`/posts/${notification.commentId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{notification.commentId}</a></Text>}
                            <Text>Read: {notification.read ? "Yes" : "No"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Created At: {new Date(notification.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No sent notifications</Text>
                    )}
                  </TabPanel>

                  {/* Received Notifications TabPanel */}
                  <TabPanel>
                    <Heading size="sm" mb={2}>Received Notifications</Heading>
                    {selectedUser.receivedNotifications.length ? (
                      <VStack spacing={2} align="start">
                        {selectedUser.receivedNotifications.map((notification) => (
                          <Box key={notification.id} p={3} w="100%" borderWidth={1} borderRadius="md">
                            <Text>Type: <Badge>{notification.type}</Badge></Text>
                            {notification.message && <Text>Message: {notification.message}</Text>}
                            <Text>Sender ID: {notification.senderId}</Text>
                            {notification.postId && <Text>Related Post ID: <a href={`/posts/${notification.postId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{notification.postId}</a></Text>}
                            {notification.commentId && <Text>Related Comment ID: <a href={`/posts/${notification.commentId}`} style={{ color: '#319795', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{notification.commentId}</a></Text>}
                            <Text>Read: {notification.read ? "Yes" : "No"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Created At: {new Date(notification.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No received notifications</Text>
                    )}
                  </TabPanel>

                </TabPanels>
              </Tabs>
              {/* TABS BİTİŞİ */}

            </Box>
          ) : (
            <Text color="gray.500" fontSize="lg" mt={8}>
              Click a user to view details.
            </Text>
          )}
        </Container>
      </Box>
    </Flex>
  );
}