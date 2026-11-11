FROM node:20-alpine
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
COPY package.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["node","backend/server.js"]
