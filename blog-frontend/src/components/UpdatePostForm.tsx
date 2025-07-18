import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Image,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { updatePostThunk } from "../store/slices/postsSlice";
import { CloseIcon } from "@chakra-ui/icons";
import axios from "../utils/axios";
import type { Post } from "../services/post";

interface ImageObj {
  id: number;
  url: string;
}

interface Props {
  post: {
    id: number;
    title: string;
    content: string;
    images?: ImageObj[];
  };
  onClose: () => void;
  onSuccess: (updatedPost: {
    id: number;
    title: string;
    content: string;
  }) => void;
}

const UpdatePostForm = ({ post, onClose, onSuccess }: Props) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ImageObj[]>(
    post.images || []
  );
  const toast = useToast();
  const dispatch = useDispatch<AppDispatch>();

  // Mevcut fotoğrafı sil
  const handleDeleteImage = async (imgId: number) => {
    try {
      console.log("Silinecek imgId:", imgId);
      console.log("Mevcut görseller silme öncesi:", existingImages);
      const response = await axios.delete(`/posts/postimages/${imgId}`);
      console.log("Silme isteği yanıtı:", response.status, response.data);
      // Silindikten sonra güncel postu backend'den çek
      const updatedPost = await axios.get<Post>(`/posts/${post.id}`);
      console.log("Silme sonrası güncel görseller:", updatedPost.data.images);
      setExistingImages(updatedPost.data.images || []);
      toast({ title: "Fotoğraf silindi.", status: "info" });
    } catch (err) {
      console.error("Fotoğraf silme hatası:", err);
      toast({ title: "Fotoğraf silinemedi.", status: "error" });
    }
  };

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Postu güncelle
      const result = await dispatch(
        updatePostThunk({ id: post.id, title, content })
      );

      if (updatePostThunk.fulfilled.match(result)) {
        // 2. Yeni fotoğraflar varsa yükle
        if (selectedImages.length > 0) {
          const formData = new FormData();
          selectedImages.forEach((file) => formData.append("images", file));
          await axios.post(`/posts/${post.id}/upload-image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
        // 3. Güncel postu backend'den çek ve görselleri güncelle
        const updatedPost = await axios.get<Post>(`/posts/${post.id}`);
        console.log("Güncelleme sonrası güncel görseller:", updatedPost.data.images);
        setExistingImages(updatedPost.data.images || []);
        setSelectedImages([]);
        setImagePreviews([]);
        toast({
          title: "Post güncellendi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess(result.payload);
        onClose();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Post güncelleme hatası:", err);
      toast({
        title: "Hata",
        description: "Post güncellenemedi.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [dispatch, post.id, title, content, selectedImages, toast, onSuccess, onClose]);

  return (
    <Box as="form" onSubmit={handleUpdate}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Başlık</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>İçerik</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </FormControl>
        {/* Mevcut fotoğraflar */}
        {existingImages.length > 0 && (
          <Flex gap={2} wrap="wrap">
            {existingImages.map((img) => (
              <Box key={img.id} position="relative">
                <Image
                  src={
                    img.url.startsWith("http")
                      ? img.url
                      : `${import.meta.env.VITE_API_BASE_URL || ""}${img.url}`
                  }
                  alt="Post görseli"
                  maxW={24}
                  borderRadius={8}
                />
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top={1}
                  right={1}
                  aria-label="Sil"
                  onClick={() => handleDeleteImage(img.id)}
                />
              </Box>
            ))}
          </Flex>
        )}
        {/* Yeni fotoğraf seçimi */}
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setSelectedImages(files);
            setImagePreviews(files.map((file) => URL.createObjectURL(file)));
          }}
        />
        {imagePreviews.length > 0 && (
          <Flex gap={2} wrap="wrap">
            {imagePreviews.map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                maxW={24}
                borderRadius={8}
              />
            ))}
          </Flex>
        )}
        <Button type="submit" colorScheme="teal" width="full">
          Güncelle
        </Button>
      </VStack>
    </Box>
  );
};

export default UpdatePostForm;
