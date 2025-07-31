/* eslint-disable react-hooks/exhaustive-deps */
 
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import type { Post } from "../services/post";

interface NewPostFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const NewPostForm = ({ onClose }: NewPostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); // navigate'i kullanmaya devam edeceğiz

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post<Post>(
          "/posts",
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const postId = res.data.id;

        if (selectedImages.length > 0) {
          const formData = new FormData();
          selectedImages.forEach((file) => formData.append("images", file));
          await axios.post(`/posts/${postId}/upload-image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
        }

        toast({
          title: "Post created.",
          description: "Your post was successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTitle("");
        setContent("");
        setSelectedImages([]);
        setImagePreviews([]);

        // Modal'ı kapat
        if (onClose) onClose();

        // Sayfayı yenile veya Home'a git (tercihinize bağlı)
        // Eğer modal kapanıp arkaplandaki Home sayfasının güncel veriyi çekmesini istiyorsanız,
        // Home'da fetchPostsThunk'ı modal kapandıktan sonra tetikleyebilirsiniz.
        // Ancak doğrudan sayfa yenilemek daha basit bir çözüm olabilir.
        // Sayfayı tamamen yeniler

        // Eğer Home'a yönlendirmek ve state'i Redux üzerinden güncellemek isterseniz:
        navigate("/", { replace: true });
        window.location.reload(); 
        // navigate("/", { replace: true }); // Geçerli history girdisini değiştirir.


      } catch (error) { // Hata yakalama bloğuna error parametresi ekleyelim
        console.error("Post creation failed:", error); // Hata detaylarını görmek için
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.", // Daha açıklayıcı mesaj
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [title, content, selectedImages, onClose, toast] // navigate artık doğrudan çağrılmıyor
  );

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post<{ content: string }>(
        "/api/ai/generate",
        { prompt: aiPrompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent(res.data.content);
      toast({
        title: "AI content generated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowAIPrompt(false);
      setAIPrompt("");
    } catch (error) { // Hata yakalama bloğuna error parametresi ekleyelim
      console.error("AI generation failed:", error); // Hata detaylarını görmek için
      toast({
        title: "AI Error",
        description: "Failed to generate content. Please try again.", // Daha açıklayıcı mesaj
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py={10}>
      <Heading mb={6}>Create New Post</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <Textarea
              placeholder="Write your post content..."
              rows={6}
              value={content}
              className="whitespace-pre-wrap w-full p-4 border rounded"
              onChange={(e) => setContent(e.target.value)}
            />
          </FormControl>

          {/* AI ile içerik oluşturma butonu ve input alanı */}
          {!showAIPrompt ? (
            <Button
              onClick={() => setShowAIPrompt(true)}
              colorScheme="purple"
              variant="outline"
              width="full"
            >
              Create your content with AI
            </Button>
          ) : (
            <Flex w="full" gap={2} direction="column">
              <Input
                placeholder="Enter a prompt for AI to generate content..."
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
              />
              <Button
                onClick={handleAIGenerate}
                colorScheme="purple"
                isDisabled={!aiPrompt.trim() || isGenerating}
                isLoading={isGenerating}
                loadingText="Generating content..."
              >
                Generate
              </Button>
            </Flex>
          )}

          {/* Fotoğraf yükleme alanı */}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSelectedImages(files);
              setImagePreviews(files.map((file) => URL.createObjectURL(file)));
            }}
            mb={4}
          />
          {imagePreviews.length > 0 && (
            <Box mb={4} display="flex" gap={2} flexWrap="wrap">
              {imagePreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  style={{ maxWidth: 120, borderRadius: 8 }}
                />
              ))}
            </Box>
          )}
          <Button type="submit" colorScheme="teal" width="full">
            Publish
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default NewPostForm;