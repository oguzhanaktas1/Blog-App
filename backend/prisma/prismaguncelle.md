Container'a Gir

docker exec -it full-stack-blog-backend-1 sh

Migration Oluştur
Şu komutu çalıştır:

npx prisma migrate dev --name add-like-model

Client'ı Güncelle (Gerekirse)

npx prisma generate