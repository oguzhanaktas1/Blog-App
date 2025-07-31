/* eslint-disable react-hooks/rules-of-hooks */
 

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
  Image,
  IconButton,
  Grid,
  CloseButton,
  useColorModeValue,
  Text,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons"; // DeleteIcon import edildi
import { useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import type { Post } from "../services/post";
import { FaRobot, FaCloudUploadAlt } from "react-icons/fa";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const shadow = useColorModeValue("xl", "dark-lg");

  const isModalMode = useMemo(() => typeof onClose === 'function', [onClose]);

  const addFiles = useCallback((filesToAdd: File[]) => {
    const newFiles = filesToAdd.filter(file => file.type.startsWith('image/'));
    if (newFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...newFiles]);
      newFiles.forEach((file) => {
        setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  }, [addFiles]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

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
          setIsUploadingImages(true);
          const formData = new FormData();
          selectedImages.forEach((file) => formData.append("images", file));
          await axios.post(`/posts/${postId}/upload-image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          setIsUploadingImages(false);
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

        if (onClose) {
          onClose();
        } else {
          navigate("/", { replace: true });
          window.location.reload();
        }
      } catch (error) {
        console.error("Post creation failed:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUploadingImages(false);
      }
    },
    [title, content, selectedImages, onClose, toast, navigate]
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
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate content. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box
      maxW={isModalMode ? "full" : { base: "90%", md: "xl", lg: "2xl" }}
      mx={isModalMode ? "0" : "auto"}
      py={isModalMode ? { base: 6, md: 8 } : { base: 8, md: 12 }}
      px={isModalMode ? { base: 4, md: 6 } : { base: 6, md: 10 }}
      borderWidth={isModalMode ? "0px" : "1px"}
      borderRadius={isModalMode ? "none" : "lg"}
      boxShadow={isModalMode ? "none" : shadow}
      bg={isModalMode ? "transparent" : bgColor}
      borderColor={isModalMode ? "transparent" : borderColor}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="xl" color="teal.500">
          Create New Post
        </Heading>
        {onClose && (
          <IconButton
            icon={<CloseButton size="lg" />}
            aria-label="Close form"
            onClick={onClose}
            variant="ghost"
            colorScheme="gray"
            size="lg"
            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
          />
        )}
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="title" fontSize="lg" fontWeight="semibold">
              Title
            </FormLabel>
            <Input
              id="title"
              placeholder="Enter a compelling title for your post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="lg"
              focusBorderColor="teal.400"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="content" fontSize="lg" fontWeight="semibold">
              Content
            </FormLabel>
            <Textarea
              id="content"
              placeholder="Share your thoughts, stories, or insights here..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              size="lg"
              focusBorderColor="teal.400"
              resize="vertical"
            />
          </FormControl>

          {!showAIPrompt ? (
            <Button
              onClick={() => setShowAIPrompt(true)}
              bg="purple.500" // Mor arka plan
              color="white" // Beyaz metin rengi
              width="full"
              leftIcon={<FaRobot />}
              size="lg"
              mt={2}
              _hover={{ bg: "purple.600" }} // Hover rengi
            >
              Generate Content with AI
            </Button>
          ) : (
            <Flex w="full" gap={3} direction="column">
              <Input
                placeholder="Describe what you want AI to write (e.g., 'A short blog post about benefits of mindful meditation')"
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                size="lg"
                focusBorderColor="purple.400"
              />
              <Flex gap={2} align="center" justify="flex-end">
                <Button
                  onClick={handleAIGenerate}
                  colorScheme="purple"
                  isDisabled={!aiPrompt.trim() || isGenerating}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                  size="lg"
                  flexGrow={1}
                >
                  Generate
                </Button>

                <IconButton
                  onClick={() => { setShowAIPrompt(false); setAIPrompt(""); }}
                  bg="red.500"
                  color="white"
                  variant="ghost"
                  colorScheme="red"
                  icon={<DeleteIcon fill="red.500" />}
                  aria-label="Cancel AI Generation"
                  size="lg"
                  _hover={{ bg: "red.600" }} // Hover rengi
                />
              </Flex>
            </Flex>
          )}

          <FormControl>
            <FormLabel htmlFor="image-upload" fontSize="lg" fontWeight="semibold">
              Add Images (Optional)
            </FormLabel>
            <Box
              border="2px dashed"
              borderColor={isDragOver ? "teal.400" : "gray.300"}
              borderRadius="lg"
              p={6}
              textAlign="center"
              cursor="pointer"
              transition="all 0.2s ease-in-out"
              _hover={{ borderColor: "teal.400", bg: useColorModeValue("gray.50", "gray.600") }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              position="relative"
            >
              {isUploadingImages ? (
                <Flex direction="column" align="center">
                  <Spinner size="xl" color="teal.500" thickness="4px" speed="0.8s" mb={4} />
                  <Text fontWeight="medium" color="teal.500">Uploading images...</Text>
                </Flex>
              ) : (
                <VStack spacing={3}>
                  <Icon as={FaCloudUploadAlt} w={12} h={12} color="teal.400" />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600" _dark={{ color: "gray.300" }}>
                    Drag & Drop your images here, or <Text as="span" color="teal.500" fontWeight="bold">click to browse</Text>
                  </Text>
                  <Text fontSize="sm" color="gray.500">Max file size: 5MB per image</Text>
                </VStack>
              )}
              <Input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                ref={fileInputRef}
                display="none"
              />
            </Box>

            {imagePreviews.length > 0 && (
              <Box mt={6} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={useColorModeValue("gray.50", "gray.800")}>
                <Text fontSize="md" fontWeight="bold" mb={3} color="gray.600" _dark={{ color: "gray.200" }}>
                  Selected Images:
                </Text>
                <Grid
                  templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
                  gap={4}
                >
                  {imagePreviews.map((src, idx) => (
                    <Box key={idx} position="relative" w="100%" pb="100%" overflow="hidden" borderRadius="md" boxShadow="sm">
                      <Image
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        objectFit="cover"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                      />
                      <CloseButton
                        position="absolute"
                        top="2"
                        right="2"
                        size="sm"
                        bg="blackAlpha.600"
                        color="white"
                        borderRadius="full"
                        _hover={{ bg: "blackAlpha.800" }}
                        onClick={() => handleRemoveImage(idx)}
                      />
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            width="full"
            mt={4}
            isLoading={isGenerating || isUploadingImages}
            loadingText={isUploadingImages ? "Uploading..." : "Publishing..."}
            isDisabled={isGenerating || isUploadingImages}
          >
            Publish Your Post
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default NewPostForm;