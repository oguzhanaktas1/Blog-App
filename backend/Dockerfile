    FROM node:20

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    # prisma generate burada çalıştırılır
    COPY prisma ./prisma
    COPY . .
    
    RUN npx prisma generate
    
    CMD ["npm", "run", "dev"]
    