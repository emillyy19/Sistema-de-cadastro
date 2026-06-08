# Estágio 1: Build da aplicação React
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de definição de pacotes
COPY package*.json ./

# Instala dependências utilizando legacy-peer-deps para evitar conflitos com React 19
RUN npm install --legacy-peer-deps

# Copia todo o código fonte
COPY . .

# Compila o projeto com o Vite
RUN npm run build

# Estágio 2: Servidor Web Nginx de Produção
FROM nginx:1.25-alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos compilados do React para o diretório público do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Adiciona uma configuração simples para dar suporte ao roteamento de SPA do React (se necessário no futuro)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```
