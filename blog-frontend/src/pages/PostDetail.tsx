/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Flex,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import UpdatePostForm from "../components/UpdatePostForm";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";
// Redux
import { useDispatch } from "react-redux";
import { deletePostThunk, updatePostThunk } from "../store/slices/postsSlice";
import type { AppDispatch } from "../store";
import api from "../api/axios";

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
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
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

  const handleDelete = async (postId: number) => {
    const result = await dispatch(deletePostThunk(postId));
    if (deletePostThunk.fulfilled.match(result)) {
      toast({
        title: "Post silindi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } else {
      toast({
        title: "Silme başarısız",
        description: result.payload || "Bu postu silemedik.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderPostMenu = (post: Post) => {
    const userEmail = getUserEmail();
    const userRole = getUserRole();
    const isAdmin = userRole === "admin";
    const isPostOwner = userEmail === post.author?.email;
    const canModify = isAdmin || isPostOwner;
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiMoreVertical />}
          variant="ghost"
          size="sm"
          aria-label="Post options"
        />
        <MenuList>
          {canModify && (
            <MenuItem
              onClick={() => {
                setEditingPost(post);
                onEditOpen();
              }}
            >
              Güncelle
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              const url = `${window.location.origin}/posts/${post.id}`;
              navigator.clipboard.writeText(url);
              toast({
                title: "Bağlantı kopyalandı!",
                description: "Gönderi bağlantısı panoya kopyalandı.",
                status: "info",
                duration: 2500,
                isClosable: true,
              });
            }}
          >
            Paylaş
          </MenuItem>
          {canModify && (
            <MenuItem color="red.500" onClick={() => handleDelete(post.id)}>
              Sil
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  };

  const bg = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "dark-lg");

  return (
    <Box minH="100vh" minW="100vw" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box w="100vw" p={0}>
        <Container maxW="container.xl" px={{ base: 4, md: "20%" }}>
          {loading ? (
            <Flex justify="center" mt={20} minH="40vh">
              <Spinner size="xl" thickness="4px" speed="0.8s" color="teal.400" />
            </Flex>
          ) : post ? (
            <Box
              bg={bg}
              p={{ base: 4, md: 8 }}
              borderRadius="xl"
              boxShadow={boxShadow}
              transition="all 0.2s"
              w="100%"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading fontSize={{ base: "2xl", md: "4xl" }}  flex="1" mr={4} wordBreak="break-word" >
                  {post.title}
                </Heading>
                <Flex align="center" gap={2}>
                  {new Date().getTime() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000 && (
                    <Badge colorScheme="teal" fontSize="0.8em" px={2} py={1} borderRadius="md">
                      Yeni
                    </Badge>
                  )}
                  {renderPostMenu(post)}
                </Flex>
              </Flex>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {post.author?.name ?? "Bilinmiyor"} tarafından — {new Date(post.createdAt).toLocaleDateString()}
              </Text>
              <Text fontSize={{ base: "md", md: "lg" }} color={useColorModeValue("gray.700", "gray.200")} mb={4}>
                {post.content}
              </Text>
            </Box>
          ) : (
            <Text color="red.500">Post bulunamadı.</Text>
          )}
        </Container>
      </Box>
      {/* Postu Güncelle Modalı */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Postu Güncelle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingPost && (
              <UpdatePostForm
                post={editingPost}
                onClose={onEditClose}
                onSuccess={(updatedPost) => {
                  setEditingPost(null);
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
                  ); // local olarak güncelle
                  dispatch(updatePostThunk(updatedPost));
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PostDetail;
