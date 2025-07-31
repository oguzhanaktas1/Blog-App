import { Router } from 'express';
// Kontrolcüyü ve arayüzü import ediyoruz
import { searchPostsByTitle } from '../controllers/SearchController';
// SearchPostResult arayüzünü buradan da export edebiliriz,
// ya da sadece ihtiyacımız olan yerlerde (frontend gibi)
// doğrudan kontrolcüden import edebiliriz.
// Bu örnekte, SearchController.ts'den direkt import etmek daha temiz olur.

const router = Router();

// Route'u tanımlarken, iş mantığını içeren kontrolcü fonksiyonunu doğrudan kullanırız.
// Artık route handler'ın içinde karmaşık mantık yok.
router.get('/', searchPostsByTitle);

export default router;