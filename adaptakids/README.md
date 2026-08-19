# AdaptaKids — Como rodar o projeto

Este projeto tem duas partes:

- **Frontend**: os arquivos `.html`, `styles.css`, `api.js`, `favorites.js` na raiz.
- **Backend**: a pasta `server/` (Node.js + Express + SQLite), responsável por
  contas de usuário, login, perfil, foto, histórico e geração das adaptações.

O servidor Node serve o frontend automaticamente — você **não abre os `.html`
direto no navegador**, e sim acessa `http://localhost:3000` depois de rodar o
servidor.

## 1. Pré-requisitos

- Node.js instalado (versão 18 ou superior). Verifique com:
  ```
  node -v
  ```

## 2. Instalação

Abra um terminal na pasta `server/` e rode:

```bash
cd server
npm install
```

Isso vai baixar as dependências: `express`, `better-sqlite3`,
`express-session`, `multer` e `dotenv`.

## 3. Configuração

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Abra o `.env` criado e, se quiser, troque `SESSION_SECRET` por qualquer
string aleatória.

### Sobre a API de IA (adaptação dos materiais)

Por padrão, `AI_API_KEY` fica em branco. Nesse caso, o sistema usa um **modo
local**: ele ainda processa o texto real enviado pelo usuário (não inventa
conteúdo), mas usando regras simples de simplificação, e deixa um aviso no
próprio resultado dizendo que está nesse modo.

Quando vocês tiverem uma chave de API (ex.: Gemini), edite o `.env`:

```
AI_PROVIDER=gemini
AI_API_KEY=sua-chave-aqui
AI_MODEL=gemini-1.5-flash
```

Não é preciso mudar nada no código — o sistema passa a usar a API real
automaticamente.

## 4. Rodando o servidor

Ainda dentro de `server/`:

```bash
npm start
```

Você verá no terminal algo como:

```
AdaptaKids rodando em http://localhost:3000
```

Abra esse endereço no navegador. O banco de dados SQLite é criado
automaticamente em `server/data/adaptakids.db` na primeira execução — não
precisa criar nada manualmente.

## 5. Testando o fluxo completo

1. Acesse `http://localhost:3000` → clique em "Criar minha conta".
2. Cadastre-se com um e-mail e senha (mínimo 6 caracteres).
3. Você será levado ao Dashboard já logado.
4. Vá em "Nova adaptação", cole um texto real, escolha disciplina e ano, e
   clique em "Adaptar material".
5. Confira o resultado em "Conteúdo Adaptado" e favorite.
6. Veja o item aparecer em "Histórico" e em "Favoritos".
7. Em "Perfil", teste editar nome/e-mail e trocar a foto (PNG).
8. Abra uma aba anônima e cadastre uma segunda conta para confirmar que os
   dados (histórico, favoritos, perfil) não se misturam entre usuários.

## 6. Estrutura de pastas

```
adaptakids/
├── index.html, login.html, cadastro.html, dashboard.html, ...  (frontend)
├── styles.css
├── api.js            → funções de comunicação com a API (fetch)
├── favorites.js       → lógica de favoritar/desfavoritar
└── server/
    ├── server.js       → ponto de entrada do backend
    ├── db.js           → conexão e schema do SQLite
    ├── routes/         → rotas da API (auth, perfil, adaptações)
    ├── services/       → hash de senha, integração com IA, referência BNCC
    ├── middleware/      → checagem de login
    ├── uploads/perfil/  → fotos de perfil enviadas pelos usuários
    └── data/            → banco de dados SQLite (criado automaticamente)
```

## 7. Observações importantes

- As senhas nunca são salvas em texto puro — são armazenadas com hash
  (scrypt, nativo do Node).
- A chave da API de IA fica apenas no backend (`server/.env`), nunca é
  exposta no frontend.
- Cada usuário só enxerga suas próprias adaptações, favoritos e dados de
  perfil — isso é garantido pelo backend, não pelo navegador.
- O arquivo `server/data/adaptakids.db` guarda todos os dados. Se quiser
  "zerar" o sistema para testar do início, basta apagar esse arquivo (e os
  arquivos `.db-shm`/`.db-wal` ao lado, se existirem) e reiniciar o servidor.
