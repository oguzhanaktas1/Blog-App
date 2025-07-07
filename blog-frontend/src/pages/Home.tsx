/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Container,
  Flex,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

interface Post {
  id: number;
  title: string;
  content: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue("white", "gray.700");
  const boxShadow = useColorModeValue("md", "dark-lg");

  useEffect(() => {
    api
      .get("/posts")
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
    <Container maxW="container.md" mt={10} px={4}>
      <Heading mb={8} fontWeight="extrabold" fontSize={{ base: "3xl", md: "4xl" }} textAlign="center" color="teal.500">
        Latest Blog Posts
      </Heading>

      {loading ? (
        <Flex justify="center" mt={20}>
          <Spinner size="xl" thickness="4px" speed="0.8s" color="teal.400" />
        </Flex>
      ) : posts.length === 0 ? (
        <Text textAlign="center" mt={10} fontSize="lg" color="gray.500">
          No posts available. Create the first one!
        </Text>
      ) : (
        <Stack spacing={6}>
          {posts.map((post) => (
            <Box
              key={post.id}
              p={6}
              bg={bg}
              boxShadow={boxShadow}
              borderRadius="lg"
              _hover={{ boxShadow: "xl", transform: "translateY(-5px)", transition: "all 0.3s ease" }}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading fontSize={{ base: "lg", md: "xl" }}>{post.title}</Heading>
                <Badge colorScheme="teal" fontSize="0.8em" px={2} py={1} borderRadius="md">
                  New
                </Badge>
              </Flex>
              <Text noOfLines={3} color={useColorModeValue("gray.700", "gray.300")}>
                {post.content}
              </Text>
              <Button
                mt={4}
                size="sm"
                colorScheme="teal"
                variant="outline"
                aria-label={`Read more about ${post.title}`}
                // onClick={() => navigate(`/posts/${post.id}`)} // Eğer detay sayfa varsa
              >
                Read More
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Home;
