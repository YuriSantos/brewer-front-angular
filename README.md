# Brewer Web

Sistema de gerenciamento de cervejaria — frontend desenvolvido com **Angular 19** e **TypeScript**.

## Funcionalidades

- **Dashboard** — indicadores de vendas no ano/mês, ticket médio, valor em estoque e total de clientes
- **Cervejas** — cadastro, listagem com filtros, edição e exclusão
- **Estilos** — gerenciamento dos estilos de cerveja
- **Clientes** — cadastro com busca automática de endereço via CEP, listagem e edição
- **Vendas** — criação de orçamentos, emissão, cancelamento e listagem com filtros
- **Usuários** — cadastro, listagem e controle de permissões por grupo
- **Autenticação** — login com JWT, refresh token e controle de acesso por roles/guards

## Tecnologias

- Angular 19 (standalone components, signals, lazy loading)
- TypeScript 5.7
- RxJS 7.8
- SCSS
- Angular Router com guards de autenticação e autorização

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Angular CLI](https://angular.dev/tools/cli) >= 19
- Backend Brewer API rodando na porta 8080

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd brewer-web

# Instalar dependências
npm install
```

## Executando

```bash
# Desenvolvimento (http://localhost:4200)
npm start

# Build de produção
npm run build

# Testes unitários
npm test
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── core/                  # Guards, interceptors, models e services globais
│   │   ├── guards/            # auth.guard, role.guard
│   │   ├── interceptors/      # auth.interceptor (JWT)
│   │   ├── models/            # page.model, user.model
│   │   └── services/          # auth, notification, storage
│   ├── features/              # Módulos de funcionalidade
│   │   ├── auth/              # Tela de login
│   │   ├── cervejas/          # CRUD de cervejas
│   │   ├── clientes/          # CRUD de clientes
│   │   ├── dashboard/         # Dashboard com indicadores
│   │   ├── estilos/           # Gerenciamento de estilos
│   │   ├── usuarios/          # Gerenciamento de usuários
│   │   └── vendas/            # Gestão de vendas
│   ├── layouts/               # Layout principal (sidebar + content)
│   ├── app.config.ts          # Configuração da aplicação
│   └── app.routes.ts          # Rotas com lazy loading
├── environments/              # Configurações por ambiente
└── styles.scss                # Estilos globais
```

## API Backend

O frontend consome a API REST em `http://localhost:8080/api/v1`. Principais endpoints:

| Recurso    | Endpoints                                                                    |
|------------|------------------------------------------------------------------------------|
| Auth       | `POST /auth/login`, `/auth/refresh`, `/auth/me`                             |
| Dashboard  | `GET /dashboard`                                                             |
| Cervejas   | `GET/POST /cervejas`, `GET/PUT/DELETE /cervejas/:id`                         |
| Estilos    | `GET/POST /estilos`, `GET/PUT/DELETE /estilos/:id`                           |
| Clientes   | `GET/POST /clientes`, `GET/PUT/DELETE /clientes/:id`                         |
| Vendas     | `GET/POST /vendas`, `PUT /vendas/:id`, `POST /vendas/:id/emitir\|cancelar`  |
| Usuários   | `GET/POST /usuarios`, `GET/PUT /usuarios/:id`                                |
| CEP        | `GET /cep/:cep`                                                              |
| Estados    | `GET /estados`, `GET /estados/:id/cidades`                                   |
