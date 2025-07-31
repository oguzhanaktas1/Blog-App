/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Avatar,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FiMoreVertical } from "react-icons/fi";
import UpdatePostForm from "./UpdatePostForm";
import React, { useCallback, useMemo, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { likePost, unlikePost, isPostLiked } from "../services/post";
import { useNavigate } from "react-router-dom";
import Reactions from "./Reactions";
import { getUserInfo } from "../utils/getUserInfo"; // doğru path ile

interface Author {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  profilePhoto?: string | null;
}

export interface PostContentBoxPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author?: Author;
  authorId?: number;
  images?: {
    id: number;
    url: string;
  }[];
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
  showButton?: boolean;
  contentLines?: number;
  showReadMore?: boolean;
}

const PostContentBox = React.memo(
  ({
    post,
    userEmail,
    userRole,
    onUpdate,
    onDelete,
    children,
    showBadge = true,
    headingSize = "xl",
    showButton = true,
  }: PostContentBoxProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const boxShadow = useColorModeValue("md", "dark-lg");
    const isNew = useMemo(() => {
      return (
        new Date().getTime() - new Date(post.createdAt).getTime() <
        24 * 60 * 60 * 1000
      );
    }, [post.createdAt]);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingPost, setEditingPost] =
      React.useState<PostContentBoxPost | null>(null);
    const [liked, setLiked] = React.useState<boolean>(false);
    const [likeLoading, setLikeLoading] = React.useState<boolean>(false);
    const [showAllContent] = useState(false);
    const currentUser = getUserInfo();
    const navigate = useNavigate();

    React.useEffect(() => {
      let mounted = true;
      if (userEmail) {
        isPostLiked(post.id)
          .then((res) => {
            if (mounted) setLiked(res.liked);
          })
          .catch(() => setLiked(false));
      }
      return () => {
        mounted = false;
      };
    }, [post.id, userEmail]);

    const handleLikeToggle = useCallback(async () => {
      if (!userEmail) {
        toast({ title: "Giriş yapmalısınız", status: "warning" });
        return;
      }
      setLikeLoading(true);
      try {
        if (liked) {
          await unlikePost(post.id);
          setLiked(false);
        } else {
          await likePost(post.id);
          setLiked(true);
        }
      } catch {
        toast({ title: "Bir hata oluştu", status: "error" });
      } finally {
        setLikeLoading(false);
      }
    }, [userEmail, liked, post.id, toast]);

    const isAdmin = userRole === "admin";
    const isPostOwner = userEmail === post.author?.email;
    const canModify = isAdmin || isPostOwner;

    const handleUpdate = useCallback(
      (
        updated: {
          id: number;
          title: string;
          content: string;
        } & Partial<PostContentBoxPost>
      ) => {
        onUpdate?.({
          ...post,
          ...updated,
        });
        onClose();
      },
      [onUpdate, post, onClose]
    );

    const handleDelete = useCallback(() => {
      onDelete?.(post.id);
    }, [onDelete, post.id]);

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

    const authorName = useMemo(
      () => post.author?.name ?? "Bilinmiyor",
      [post.author?.name]
    );
    const authorAvatar = useMemo(() => {
      if (post.author?.profilePhoto) {
        return post.author.profilePhoto.startsWith("http")
          ? post.author.profilePhoto
          : `${import.meta.env.VITE_API_BASE_URL || ""}${
              post.author.profilePhoto
            }`;
      }
      return undefined;
    }, [post.author?.profilePhoto]);
    const images = useMemo(() => post.images || [], [post.images]);

    // Determine if content is longer than 4 lines
    const contentLines = useMemo(
      () => post.content.split("\n"),
      [post.content]
    );
    const isLongContent = contentLines.length > 4;
    const displayedContent = showAllContent
      ? post.content
      : contentLines.slice(0, 4).join("\n");

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
          <Flex align="center" mb={2}>
            {authorAvatar ? (
              <Avatar
                src={authorAvatar}
                name={authorName}
                size="sm"
                mr={2}
                display="inline-block"
                verticalAlign="middle"
              />
            ) : (
              <Avatar
                name={authorName}
                size="sm"
                mr={2}
                display="inline-block"
                verticalAlign="middle"
              />
            )}
            <Text fontSize="sm" color="gray.500">
              {authorName} - {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </Flex>
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
        {/* Post title, only render if present */}
        {post.title && (
          <Heading
            fontSize={{ base: headingSize, md: headingSize }}
            noOfLines={1}
            flex="1"
            mr={4}
            wordBreak="break-word"
            mb={4}
          >
            {post.title}
          </Heading>
        )}

        {images.length > 0 && (
          <Flex mb={4} gap={2} wrap="wrap">
            {images.map((img, idx) => (
              <img
                key={img.id ?? idx}
                src={
                  img.url.startsWith("http")
                    ? img.url
                    : `${import.meta.env.VITE_API_BASE_URL || ""}${img.url}`
                }
                alt={`Post görseli ${idx + 1}`}
                style={{ maxWidth: 180, borderRadius: 8 }}
              />
            ))}
          </Flex>
        )}

        <Box
          whiteSpace="pre-line"
          color={useColorModeValue("gray.700", "gray.300")}
          mb={4}
          fontSize="md"
        >
          {displayedContent}
        </Box>

        {/* Like (Kalp) Butonu */}
        <IconButton
          aria-label={liked ? "Beğenmekten vazgeç" : "Beğen"}
          icon={liked ? <AiFillHeart color="red" /> : <AiOutlineHeart />}
          variant="ghost"
          size="lg"
          mt={2}
          isLoading={likeLoading}
          onClick={handleLikeToggle}
        />

        <Reactions postId={post.id} userId={currentUser.userId!} />

        {/* Devamını Oku butonu sadece içerik 4 satırdan uzunsa ve henüz tamamı gösterilmiyorsa */}
        {isLongContent && !showAllContent && (
          <Button
            mt="auto"
            size="sm"
            colorScheme="teal"
            variant="outline"
            aria-label={`Devamını oku: ${post.title}`}
            fontWeight="semibold"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            Devamını Oku
          </Button>
        )}

        {showButton && (
          <Button
            mt={2}
            size="sm"
            colorScheme="purple"
            variant="solid"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            Postu İncele
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
                  post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    images: post.images?.map((img, idx) => ({
                      id: (img as any).id ?? idx, // backend'den id geliyorsa kullan, yoksa index
                      url: img.url,
                    })),
                  }}
                  onClose={onClose}
                  onSuccess={handleUpdate}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  }
);

export default PostContentBox;
