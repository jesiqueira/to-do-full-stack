FROM node:22-alpine AS development

WORKDIR /app

# 1️⃣ PRIMEIRO: Copia APENAS arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.eslint.json ./
COPY .sequelizerc ./
COPY jest.config.js ./
COPY eslint.config.mjs ./
COPY .prettierrc ./
COPY .editorconfig ./

# 2️⃣ Instala dependências (cache eficiente)
RUN npm install

# 3️⃣ DEPOIS: Copia APENAS código fonte e configurações
COPY src/ ./src/
COPY __tests__/ ./__tests__/
COPY .env.example ./

# 4️⃣ Cria pastas necessárias (já estão no src/ mas por segurança)
RUN mkdir -p src/database/migrations src/database/seeders src/database/models

EXPOSE 3000

CMD [ "npm", "run", "dev" ]

