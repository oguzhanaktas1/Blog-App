import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  useColorModeValue,
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
  Button,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FiMoreVertical } from "react-icons/fi";
import UpdatePostForm from "./UpdatePostForm";
import React from "react";
import { Link } from "react-router-dom";

interface Author {
  name?: string | null;
  email?: string | null;
}

export interface PostContentBoxPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author?: Author;
  authorId?: number;
}

interface PostContentBoxProps {
  post: PostContentBoxPost;
  userEmail?: string | null;
  userRole?: string | null;
  onUpdate?: (updatedPost: PostContentBoxPost) => void;
  onDelete?: (postId: number) => void;
  children?: ReactNode;
  showBadge?: boolean;
  headingSize?: string;
  contentLines?: number;
  showReadMore?: boolean; // new prop
}

const PostContentBox = ({
  post,
  userEmail,
  userRole,
  onUpdate,
  onDelete,
  children,
  showBadge = true,
  headingSize = "xl",
  contentLines = 4,
  showReadMore = false,
}: PostContentBoxProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "dark-lg");
  const isNew =
    new Date().getTime() - new Date(post.createdAt).getTime() <
    24 * 60 * 60 * 1000;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPost, setEditingPost] =
    React.useState<PostContentBoxPost | null>(null);

  const isAdmin = userRole === "admin";
  const isPostOwner = userEmail === post.author?.email;
  const canModify = isAdmin || isPostOwner;

  const handleUpdate = (updatedPost: PostContentBoxPost) => {
    setEditingPost(null);
    onUpdate?.(updatedPost);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(post.id);
  };

  const renderPostMenu = () => (
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
              onOpen();
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
          <MenuItem color="red.500" onClick={handleDelete}>
            Sil
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg={bg}
      borderRadius="xl"
      boxShadow={boxShadow}
      transition="all 0.2s"
      w="100%"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Heading
          fontSize={{ base: headingSize, md: headingSize }}
          noOfLines={1}
          flex="1"
          mr={4}
          wordBreak="break-word"
        >
          {post.title}
        </Heading>
        <Flex align="center" gap={2}>
          {showBadge && isNew && (
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
          {renderPostMenu()}
        </Flex>
      </Flex>
      <Text fontSize="sm" color="gray.500" mb={2}>
        {post.author?.name ?? "Bilinmiyor"} -{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </Text>
      <Text
        noOfLines={contentLines}
        color={useColorModeValue("gray.700", "gray.300")}
        mb={4}
      >
        {post.content}
      </Text>
      {/* Devamını Oku butonu sadece showReadMore true ise ve içerik uzun ise göster */}
      {showReadMore && post.content.length > 300 && (
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
      )}
      {children}
      {/* Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Postu Güncelle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingPost && (
              <UpdatePostForm
                post={editingPost}
                onClose={onClose}
                onSuccess={(updated) => {
                  // Merge with previous editingPost to ensure all required fields
                  handleUpdate({ ...editingPost, ...updated });
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PostContentBox;
