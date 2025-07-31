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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

interface Comment {
  id: number;
  text: string;
  postId: number;
}

interface UserDetails extends User {
  posts: Post[];
  comments: Comment[];
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
      const res = await fetch(`http://localhost:3000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error("Kullanıcı detayları yüklenirken hata oluştu.");
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

              <Heading size="sm" mb={2}>
                Posts
              </Heading>
              {selectedUser.posts.length ? (
                <VStack spacing={2} align="start" mb={4}>
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
                      
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text mb={4}>No posts</Text>
              )}

              <Heading size="sm" mb={2}>
                Comments
              </Heading>
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
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text>No comments</Text>
              )}
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
