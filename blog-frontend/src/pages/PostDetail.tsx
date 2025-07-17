import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Text,
  Spinner,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";
// Redux
import { useDispatch } from "react-redux";
import { deletePostThunk, updatePostThunk } from "../store/slices/postsSlice";
import type { AppDispatch } from "../store";
import api from "../api/axios";
import PostCommentSection from "../components/PostCommentSection";
import PostContentBox from "../components/PostContentBox";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
  author?: {
    name: string;
    email: string;
  };
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data as Post);
      } catch (error) {
        console.error("Post yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const userEmail = getUserEmail();
  const userRole = getUserRole();

  return (
    <Box minH="100vh" minW="100vw" bg="gray.50"> 
      <Box w="100vw" p={0}>
        <Container maxW="container.xl" px={{ base: 4, md: "20%" }}>
          {loading ? (
            <Flex justify="center" mt={20} minH="40vh">
              <Spinner size="xl" thickness="4px" speed="0.8s" color="teal.400" />
            </Flex>
          ) : post ? (
            <PostContentBox
              post={post}
              userEmail={userEmail}
              userRole={userRole}
              onUpdate={(updatedPost) => {
                setPost((prev) =>
                  prev
                    ? {
                        ...prev,
                        ...updatedPost,
                        createdAt: prev.createdAt,
                        authorId: prev.authorId,
                        author: prev.author,
                      }
                    : null
                );
                dispatch(updatePostThunk(updatedPost));
              }}
              onDelete={(postId) => {
                dispatch(deletePostThunk(postId));
                toast({
                  title: "Post silindi.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
                navigate("/");
              }}
              showBadge={true}
              headingSize="2xl"
              contentLines={100}
            >
              <PostCommentSection postId={post.id} />
            </PostContentBox>
          ) : (
            <Text color="red.500">Post bulunamadı.</Text>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default PostDetail;
