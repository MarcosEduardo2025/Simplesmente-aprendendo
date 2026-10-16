# Simplesmente-aprendendo

Neste repositório você vai encontrar projetos do meu portfólio e acompanhar minha evolução como desenvolvedor.

## Finanças Jr

Aplicação de finanças pessoais com frontend React/Vite e API Laravel, organizados em pastas independentes.

### Executar com Docker

1. Inicie o Docker Desktop.
2. Crie o arquivo local de configuração e defina uma senha exclusiva para o banco:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e substitua `POSTGRES_PASSWORD` por uma senha forte. Esse arquivo é local e não deve ser enviado ao GitHub.
3. Na raiz do projeto, execute:

```sh
docker compose up --build
```

Abra o frontend em [http://localhost:5173](http://localhost:5173). A API fica em [http://localhost:8000](http://localhost:8000), e o PostgreSQL fica disponível no host pela porta `5433` (porta `5432` dentro da rede Docker).

O Vite encaminha `/api` para o contêiner Laravel. O banco e os diretórios de dependências usam volumes Docker persistentes.

Para parar os serviços, pressione `Ctrl+C` ou execute `docker compose down`. Os dados do PostgreSQL são preservados no volume.

Para apagar os registros do banco em execução e recriar as tabelas vazias, execute `docker compose exec backend php artisan migrate:fresh --force`. Esse comando remove todos os dados do banco.

### Estrutura

- `frontend/`: React, Vite e interface da aplicação.
- `backend/`: API Laravel, autenticação Sanctum e migrations.
- `docker-compose.yml`: frontend, backend e PostgreSQL.
