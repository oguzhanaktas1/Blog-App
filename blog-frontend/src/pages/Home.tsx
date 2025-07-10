/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import api from "../api/axios";
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
import { getUserEmail } from "../utils/getUserEmail";
import UpdatePostForm from "../components/UpdatePostForm";
import { getUserRole } from "../utils/getUserRole";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "dark-lg");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

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

  const handleCreatePost = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
    } else {
      onOpen();
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({
        title: "Post silindi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: "Silme başarısız",
        description: "Bu postu silemedik.",
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
  
    // 🟩 DEBUG logları
    console.log("User role:", userRole);
    console.log("User email:", userEmail);
    console.log("Post author email:", post.author?.email);
    console.log("isAdmin:", isAdmin);
    console.log("isPostOwner:", isPostOwner);
  
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
    <Box
      minH="100vh"
      minW="100vw"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
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
          <Heading
            fontWeight="extrabold"
            fontSize={{ base: "3xl", md: "5xl" }}
            mb={4}
          >
            Welcome to the Modern Blog
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
            Discover, create, and share your thoughts with the world. Start by
            reading the latest posts or add your own!
          </Text>
        </Box>
      </Box>
      {/* Create Posts and Showing Posts  */}
      <Box w="100vw" p={0}>
        <Container
          maxW="container.xl" // Büyük ekranlarda varsayılan max genişlik
          px={{ base: 4, md: "20%" }} // Küçük ekranlarda 4, orta ve büyük ekranlarda %20 boşluk
          // minW="100vw" // Bu prop'u kaldırdık, çünkü px ile boşluk vereceğiz ve maxW yeterli
        >
          {/* Loading State */}
          {loading ? (
            <Flex justify="center" mt={20} minH="40vh">
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.8s"
                color="teal.400"
              />
            </Flex>
          ) : posts.length === 0 ? (
            <Flex direction="column" align="center" mt={16} minH="40vh">
              <Text fontSize="2xl" color="gray.500" mb={4}>
                Henüz hiç gönderi yok. İlk hikayeni paylaşan sen ol!
              </Text>
              <Button
                colorScheme="teal"
                leftIcon={<AddIcon />}
                onClick={handleCreatePost}
              >
                Gönderi Oluştur
              </Button>
            </Flex>
          ) : (
            <VStack
              spacing={8}
              w="100%"
              align="stretch" // İçerideki Box'ların tam genişliği kaplamasını sağlar
              py={8} // Üst ve alt padding ekleyelim
            >
              {posts.map((post) => (
                <Box
                  key={post.id}
                  p={6}
                  bg={bg}
                  boxShadow={boxShadow}
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: "xl",
                    transform: "translateY(-6px) scale(1.00)", // Sadece yukarı kayma efekti, scale yok
                    cursor: "pointer",
                  }}
                  display="flex"
                  flexDirection="column"
                  // minH="260px" // Tek sütunlu düzende minH'ye genelde gerek kalmaz, içerik kadar uzar
                  w="100%"
                  // onClick={() => navigate(`/posts/${post.id}`)} // Tıklanabilir hale getirmek için
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    {/* Heading sola hizalı */}
                    <Heading
                      fontSize={{ base: "lg", md: "xl" }}
                      noOfLines={1}
                      flex="1"
                      mr={4}
                    >
                      {post.title}
                    </Heading>

                    {/* Sağdaki elementleri içeren Flex kapsayıcı */}
                    {/* Bu Flex, Badge ve Menu'yü yan yana tutar ve ana Flex içinde sağa itilir */}
                    <Flex align="center" gap={2}>
                      {" "}
                      {/* gap ile Badge ve Menu arasında boşluk */}
                      {/* Yeni badge */}
                      {new Date().getTime() -
                        new Date(post.createdAt).getTime() <
                        24 * 60 * 60 * 1000 && (
                        <Badge
                          colorScheme="teal"
                          fontSize="0.8em"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          Yeni
                        </Badge>
                      )}
                      {/* Menü butonu ve içerikleri */}
                      {renderPostMenu(post)}
                    </Flex>
                  </Flex>

                  <Modal
                    isOpen={isEditOpen}
                    onClose={onEditClose}
                    size="xl"
                    isCentered
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Postu Güncelle</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        {editingPost && (
                          <UpdatePostForm
                            post={editingPost}
                            onClose={onEditClose}
                            onSuccess={() => {
                              setEditingPost(null);
                              // Postları tekrar fetch edelim
                              api.get<Post[]>("/posts").then((res) => {
                                setPosts(res.data);
                              });
                            }}
                          />
                        )}
                      </ModalBody>
                    </ModalContent>
                  </Modal>

                  <Text fontSize="sm" color="gray.500" mb={2}>
                    by {post.author?.name ?? "Bilinmiyor"} -{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>

                  <Text
                    noOfLines={4}
                    color={useColorModeValue("gray.700", "gray.300")}
                    mb={4}
                  >
                    {post.content}
                  </Text>
                  <Button
                    as={Link} // RouterLink yerine ChakraLink'i as ile kullanabilirsiniz
                    to={`/posts/${post.id}`}
                    mt="auto"
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    aria-label={`Devamını oku: ${post.title}`}
                    fontWeight="semibold"
                    // Bu butona tıklayınca da navigate olduğu için onClick'i kaldırdık
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
          <ModalHeader>Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <NewPostForm />
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Postu Güncell Modalı */}
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
                onSuccess={() => {
                  setEditingPost(null);
                  // Postları tekrar fetch edelim
                  // api.get<Post[]>("/posts").then((res) => { setPosts(res.data); });
                  // Daha önceki fetchPosts fonksiyonunu yeniden çağırabilirsiniz:
                  // getPosts(); // Eğer getPosts fonksiyonu kapsamdaysa
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
