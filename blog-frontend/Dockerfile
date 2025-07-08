# ✅ Node 20 ile Vite sorunu çözülür
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
