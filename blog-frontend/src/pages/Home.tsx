/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Container,
  Flex,
  Badge,
  Button,
  useColorModeValue,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { AddIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";
import UpdatePostForm from "../components/UpdatePostForm";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchPostsThunk, deletePostThunk, updatePostThunk } from "../store/slices/postsSlice";
import type { RootState, AppDispatch } from "../store";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "dark-lg");
  const posts = useSelector((state: RootState) => state.posts.posts);
  const loading = useSelector((state: RootState) => state.posts.loading);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [editingPost, setEditingPost] = useState<typeof posts[0] | null>(null);

  useEffect(() => {
    dispatch(fetchPostsThunk());
  }, [dispatch]);

  const handleCreatePost = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
    } else {
      onOpen();
    }
  };

  
  const handleDelete = async (postId: number) => {
    const result = await dispatch(deletePostThunk(postId));
  
    if (deletePostThunk.fulfilled.match(result)) {
      toast({
        title: "Post silindi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  const renderPostMenu = (post: typeof posts[0]) => {
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

  return (
    <Box minH="100vh" minW="100vw" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Hero Section */}
      <Box
        as="section"
        w="100vw"
        minH={{ base: "30vh", md: "40vh" }}
        py={{ base: 10, md: 16 }}
        px={0}
        textAlign="center"
        bgGradient="linear(to-r, teal.400, blue.400)"
        color="white"
        mb={10}
        position="relative"
        left="50%"
        right="50%"
        marginLeft="-50vw"
        marginRight="-50vw"
        maxW="100vw"
      >
        <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 0 }}>
          <Heading fontWeight="extrabold" fontSize={{ base: "3xl", md: "5xl" }} mb={4}>
            Welcome to the Modern Blog
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
            Discover, create, and share your thoughts with the world. Start by reading the latest posts or add your own!
          </Text>
        </Box>
      </Box>

      {/* Create Posts and Showing Posts */}
      <Box w="100vw" p={0}>
        <Container maxW="container.xl" px={{ base: 4, md: "20%" }}>
          {loading ? (
            <Flex justify="center" mt={20} minH="40vh">
              <Spinner size="xl" thickness="4px" speed="0.8s" color="teal.400" />
            </Flex>
          ) : posts.length === 0 ? (
            <Flex direction="column" align="center" mt={16} minH="40vh">
              <Text fontSize="2xl" color="gray.500" mb={4}>
                Henüz hiç gönderi yok.
              </Text>
            </Flex>
          ) : (
            <VStack spacing={8} w="100%" align="stretch" py={8}>
              {posts.slice().reverse().map((post) => (
                <Box
                  key={post.id}
                  p={6}
                  bg={bg}
                  boxShadow={boxShadow}
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: "xl",
                    transform: "translateY(-6px) scale(1.00)",
                    cursor: "pointer",
                  }}
                  display="flex"
                  flexDirection="column"
                  w="100%"
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Heading fontSize={{ base: "lg", md: "xl" }} noOfLines={1} flex="1" mr={4}>
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

                  <Text fontSize="sm" color="gray.500" mb={2}>
                    by {post.author?.name ?? "Bilinmiyor"} - {new Date(post.createdAt).toLocaleDateString()}
                  </Text>

                  <Text noOfLines={4} color={useColorModeValue("gray.700", "gray.300")} mb={4}>
                    {post.content}
                  </Text>
                  <Button
                    as={Link}
                    to={`/posts/${post.id}`}
                    mt="auto"
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    aria-label={`Devamını oku: ${post.title}`}
                    fontWeight="semibold"
                  >
                    Devamını Oku
                  </Button>
                </Box>
              ))}
            </VStack>
          )}
        </Container>
      </Box>

      {/* Floating Action Button for New Post */}
      <Tooltip label="Create New Post" hasArrow placement="left">
        <IconButton
          icon={<AddIcon />}
          colorScheme="teal"
          size="lg"
          position="fixed"
          bottom={8}
          right={8}
          borderRadius="full"
          boxShadow="lg"
          zIndex={100}
          aria-label="Create New Post"
          display={{ base: "flex", md: "none" }}
          onClick={handleCreatePost}
        />
      </Tooltip>

      {/* Modal for New Post Form */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <NewPostForm />
          </ModalBody>
        </ModalContent>
      </Modal>

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
                  dispatch(updatePostThunk(updatedPost)); // güncel veriyi redux üzerinden yenile
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;
