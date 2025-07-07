import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Container,
} from "@chakra-ui/react";

interface Post {
  id: number;
  title: string;
  content: string;
}

const PostForm = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          setPosts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPosts([]);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxW="container.md" mt={10}>
      <Heading mb={6}>Blog Posts</Heading>
      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Stack gap={6} align="stretch">
          {posts.map((post) => (
            <Box key={post.id} p={4} borderWidth="1px" borderRadius="md">
              <Heading size="md">{post.title}</Heading>
              <Text mt={2}>{post.content}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default PostForm;
