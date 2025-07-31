 
import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  List,
  ListItem,
  Divider,
  Button,
} from "@chakra-ui/react";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  posts: Post[];
  comments: Comment[];
}

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Kullanıcı bulunamadı");
        const data = await res.json();
        setUser(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;

  if (!user) return null;

  return (
    <Box maxW="container.md" mx="auto" p={4}>
      <Button mb={4} as={RouterLink} to="/admin/users" colorScheme="teal">
        Geri Dön
      </Button>
      <Heading mb={4}>{user.name} - Detaylar</Heading>
      <Text><b>Username:</b> {user.username}</Text>
      <Text><b>Email:</b> {user.email}</Text>
      <Text><b>Rol:</b> {user.role}</Text>

      <Divider my={4} />

      <Heading size="md" mb={2}>Postlar</Heading>
      {user.posts.length === 0 ? (
        <Text>Post bulunamadı.</Text>
      ) : (
        <List spacing={3}>
          {user.posts.map(post => (
            <ListItem key={post.id}>
              <Text fontWeight="bold">{post.title}</Text>
              <Text fontSize="sm" color="gray.600">{new Date(post.createdAt).toLocaleString()}</Text>
              <Text>{post.content}</Text>
            </ListItem>
          ))}
        </List>
      )}

      <Divider my={4} />

      <Heading size="md" mb={2}>Yorumlar</Heading>
      {user.comments.length === 0 ? (
        <Text>Yorum bulunamadı.</Text>
      ) : (
        <List spacing={3}>
          {user.comments.map(comment => (
            <ListItem key={comment.id}>
              <Text>{comment.content}</Text>
              <Text fontSize="sm" color="gray.600">
                {new Date(comment.createdAt).toLocaleString()} (Post ID: {comment.postId})
              </Text>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UserDetail;
