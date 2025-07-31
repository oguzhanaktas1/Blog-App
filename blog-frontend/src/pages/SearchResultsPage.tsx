 
// src/pages/SearchResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Image,
  Tag,
  Flex,
  Spacer,
  useColorModeValue,
  Grid,
  GridItem,
  Button, // Link bileşenini import ediyoruz (eğer dış link veya stil için kullanacaksanız)
} from '@chakra-ui/react';

// Backend'den gelecek verinin yapısı (SearchController.ts'deki ile aynı olmalı)
// Burada tekrar tanımlıyoruz çünkü doğrudan backend dosyasından import edemiyoruz.
interface SearchPostResult {
  id: number;
  title: string;
  createdAt: string; // Backend'den JSON olarak geldiğinde string olur
  // content: string; // Artık burada content'e ihtiyacımız yok
  author?: {
    id: number;
    name?: string | null;
    username?: string | null;
    email: string;
    profilePhoto?: string | null;
  };
}

// PostContentBox bileşeninin beklediği veri yapısı
// (PostContentBoxPost'a artık content geçirmeyeceğiz, bu arayüzü PostContentBox'tan bağımsız olarak düşünebiliriz.)
interface DisplayPostResult {
  id: number;
  title: string;
  createdAt: string;
  author?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    profilePhoto?: string | null;
  };
  authorId?: number;
}

const SearchResultsPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<DisplayPostResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const query = searchParams.get('q');

  // Chakra UI teması için renkler
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('teal.600', 'teal.300');
  const authorColor = useColorModeValue('gray.600', 'gray.400');
  const buttonScheme = useColorModeValue('teal', 'teal');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        // Backend'den content almamıza gerek kalmadığı için,
        // SearchController'daki select kısmından content'i çıkarabilirsiniz.
        const response = await axios.get<SearchPostResult[]>(`${BACKEND_URL}/api/posts/search?q=${encodeURIComponent(query)}`);

        const formattedResults: DisplayPostResult[] = response.data.map(post => ({
          id: post.id,
          title: post.title,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          author: {
            id: post.author?.id,
            username: post.author?.username,
            profilePhoto: post.author?.profilePhoto,
            name: post.author?.name,
            email: post.author?.email,
          },
          authorId: post.author?.id,
        }));

        setSearchResults(formattedResults);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, location.search]);

  return (
    <Box p={8} bg={bgColor} minH="100vh" minW="100vw">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color={titleColor}>
        Search Results for "{query}"
      </Heading>

      <Grid
        templateColumns={{ base: '1fr', md: '1fr 2fr 1fr', lg: '1fr 3fr 1fr' }}
        gap={6}
      >
        {/* Sol Sütun (Boş bırakılabilir veya ek içerik eklenebilir) */}
        <GridItem>
          <Box p={4} borderRadius="md" bg={cardBg} boxShadow="sm" minH="200px">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
              Popular Tags
            </Text>
            {/* Örnek etiketler */}
            <VStack align="start" spacing={2}>
              <Tag size="md" colorScheme="purple" variant="solid">#React</Tag>
              <Tag size="md" colorScheme="blue" variant="solid">#TypeScript</Tag>
              <Tag size="md" colorScheme="green" variant="solid">#WebDev</Tag>
            </VStack>
          </Box>
        </GridItem>

        {/* Orta Sütun (Arama Sonuçları Listesi) */}
        <GridItem>
          {loading && (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text ml={4} fontSize="lg" color={textColor}>Loading search results...</Text>
            </Flex>
          )}

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!loading && !error && searchResults.length === 0 && (
            <Alert status="info" mb={4}>
              <AlertIcon />
              No posts found matching "{query}".
            </Alert>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <VStack spacing={6} align="stretch">
              {searchResults.map((post) => (
                <Box
                  key={post.id}
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="md"
                  bg={cardBg}
                  _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease-in-out"
                >
                  <VStack align="start" spacing={3}>
                    <HStack width="100%">
                      {/* Başlık linki */}
                      <Heading
                        as={RouterLink}
                        to={`/posts/${post.id}`}
                        size="md"
                        color={titleColor}
                        _hover={{ textDecoration: 'underline', color: 'teal.500' }}
                        flexGrow={1} // Başlığın mümkün olduğunca yer kaplamasını sağla
                      >
                        {post.title}
                      </Heading>
                      <Spacer /> {/* Başlığı ve butonu ayırır */}
                      {/* Posta Git Butonu */}
                      <Button
                        as={RouterLink}
                        to={`/posts/${post.id}`}
                        colorScheme={buttonScheme}
                        size="sm"
                        variant="outline"
                      >
                        Go to Post
                      </Button>
                    </HStack>
                    
                    {/* Yazar Bilgisi ve Tarih */}
                    <HStack fontSize="sm" color={authorColor} width="100%">
                      {post.author?.profilePhoto ? (
                        <Image
                          borderRadius="full"
                          boxSize="24px"
                          src={`${import.meta.env.VITE_API_BASE_URL}${post.author.profilePhoto}`}
                          alt={post.author.username || 'Author'}
                        />
                      ) : null}
                      <Text>by {post.author?.name || post.author?.username || 'Unknown Author'}</Text>
                      {post.author?.username && (
                        <Tag size="sm" variant="subtle" colorScheme="blue">
                          @{post.author.username}
                        </Tag>
                      )}
                      <Spacer /> {/* Tarihi sağa yaslar */}
                      <Text>{post.createdAt}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </GridItem>

        {/* Sağ Sütun (Boş bırakılabilir veya ek içerik eklenebilir) */}
        <GridItem>
          <Box p={4} borderRadius="md" bg={cardBg} boxShadow="sm" minH="200px">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
              Advertisements
            </Text>
            {/* Örnek reklam görseli */}
            <Image src="https://via.placeholder.com/250x400/805ad5/ffffff?text=Your+Ad+Here" alt="Advertisement" borderRadius="md" />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default SearchResultsPage;