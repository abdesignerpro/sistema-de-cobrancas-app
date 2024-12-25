FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar arquivos do projeto
COPY . .

# Criar arquivo de ambiente com a URL do backend
RUN echo "VITE_API_URL=https://sistema-de-cobrancas-cobrancas-server.yzgqzv.easypanel.host" > .env

# Build da aplicação
RUN npm run build

# Instalar servidor http simples
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Iniciar servidor
CMD ["serve", "-s", "dist", "-l", "3000"]
