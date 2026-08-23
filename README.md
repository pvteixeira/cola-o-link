# VideoFetch

**VideoFetch** é uma aplicação web full-stack moderna, modular e segura projetada para análise de metadados e download controlado de vídeos públicos de plataformas compatíveis.

A aplicação foi construída com foco em **segurança**, **arquitetura limpa**, **baixo custo operacional** e estrita **conformidade legal e ética** (não contorna DRM, não acessa conteúdo privado, não quebra paywalls nem autenticações).

---

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & APIs**: Next.js API Routes, TypeScript, Zod.
- **Filas & Processamento**: Sistema híbrido com BullMQ + Redis (Produção/Docker) e fallback automático para Fila em Memória assíncrona (Desenvolvimento local zero-config).
- **Mídia**: Integração segura com `yt-dlp` e `ffmpeg` via subprocessos isolados (`shell: false`).
- **Infraestrutura**: Docker multi-stage & Docker Compose.
- **Testes**: Vitest.

---

## 🏛️ Arquitetura do Sistema

```
/
├── app/                      # Rotas e páginas (App Router)
│   ├── api/
│   │   ├── analyze/          # POST /api/analyze (Metadados e formatos)
│   │   └── download/         # POST /api/download, GET /:id, GET /:id/file
│   ├── layout.tsx            # Layout raiz com tema escuro e SEO
│   └── page.tsx              # UI principal (Hero, Cards, Status, Modais)
├── components/               # Componentes React desacoplados e reutilizáveis
│   ├── Header.tsx            # Navegação e identidade visual
│   ├── Hero.tsx              # Input de busca, colar e badges
│   ├── VideoCard.tsx         # Card de resultado com seleção de resolução
│   ├── DownloadProgress.tsx  # Acompanhamento de fila e progresso em tempo real
│   ├── HowItWorks.tsx        # Seção explicativa em 3 etapas
│   ├── PlatformStatus.tsx    # Tabela de compatibilidade e restrições
│   └── TermsModal.tsx        # Modal de diretrizes éticas e legais
├── providers/                # Arquitetura modular de provedores de vídeo
│   ├── base.provider.ts      # Interface e classe abstrata VideoProvider
│   ├── registry.ts           # Registro central de providers
│   ├── youtube/              # Provider YouTube
│   ├── vimeo/                # Provider Vimeo
│   ├── tiktok/               # Provider TikTok
│   ├── reddit/               # Provider Reddit
│   ├── instagram/            # Provider Instagram (Restrições sinalizadas)
│   └── x/                    # Provider X/Twitter (Restrições sinalizadas)
├── queues/                   # Sistema de filas desacoplado
│   ├── queue.interface.ts    # Interface comum de enfileiramento
│   ├── bullmq.queue.ts       # Implementação Redis / BullMQ
│   ├── memory.queue.ts       # Implementação em memória para desenvolvimento
│   └── queue.factory.ts      # Factory com seleção automática
├── workers/                  # Workers assíncronos
│   ├── download.worker.ts    # Processamento e download de mídias
│   └── cleanup.worker.ts     # Limpeza periódica de arquivos temporários
├── services/                 # Regras de negócio
│   ├── analyze.service.ts    # Orquestração de análise
│   ├── download.service.ts   # Orquestração de jobs de download
│   └── storage.service.ts    # Gestão de storage temporário e TTL
├── lib/
│   ├── security/             # Prevenção de SSRF, DNS check, Rate Limiter e Sanitização
│   ├── process/              # Subprocess seguro (sem command injection)
│   └── errors/               # Hierarquia de erros amigáveis
├── types/                    # Tipagem TypeScript estrita
└── config/                   # Configurações centrais
```

---

## 🔒 Diretrizes de Segurança e Ética

1. **Proteção Anti-SSRF em Nível de DNS**: Toda URL submetida passa por validação de allowlist de domínios e resolução de DNS assíncrona (`dns.lookup`), bloqueando sumariamente qualquer resolução para IPs privados (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `::1`).
2. **Execução Segura de Subprocessos**: Utiliza `execFile` e `spawn` com array de argumentos explícito (`shell: false`), tornando impossível ataques de Command Injection via URL ou parâmetros.
3. **Proteção contra Path Traversal**: Todos os caminhos de arquivos temporários são validados com `path.resolve` e gerados com nomes únicos aleatórios (`UUID`), impedindo vazamento de diretórios (`../`).
4. **Rate Limiting**: Janela deslizante de 30 requisições por minuto por IP.
5. **Limpeza Automática (TTL de 15 minutos)**: Nenhum vídeo é armazenado permanentemente. Um worker contínuo apaga arquivos temporários expirados.
6. **Respeito a DRM e Conteúdo Privado**: A plataforma recusa expressamente tentativas de download de mídias com criptografia DRM (Widevine/FairPlay), vídeos privados que exijam login ou conteúdos de membros pagos.

---

## 📋 Pré-requisitos

- **Node.js**: versão 18.x, 20.x ou superior.
- **NPM**: versão 9.x ou superior.
- *(Opcional)* **Docker e Docker Compose** (para execução em containers).
- *(Opcional)* **yt-dlp** e **ffmpeg** (já inclusos no container Docker; para execução local completa, podem ser instalados no sistema operacional).

---

## ⚙️ Configuração e Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

### Variáveis Disponíveis

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `3000` | Porta onde o servidor Next.js será executado |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL pública da aplicação |
| `REDIS_URL` | `""` (vazio) | URL de conexão Redis. Se vazia, usa fila em memória automaticamente |
| `QUEUE_CONCURRENCY` | `2` | Número máximo de downloads simultâneos |
| `TEMP_STORAGE_DIR` | `/tmp/videofetch-downloads` | Diretório no disco para os arquivos temporários |
| `YT_DLP_PATH` | `yt-dlp` | Caminho do executável do yt-dlp |
| `FFMPEG_PATH` | `ffmpeg` | Caminho do executável do ffmpeg |

---

## 💻 Execução Local

### 1. Instalação das dependências:
```bash
npm install
```

### 2. Execução dos testes automatizados:
```bash
npm test
```

### 3. Execução em modo de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🐳 Execução com Docker

Para subir a aplicação completa com Redis, `yt-dlp` e `ffmpeg` configurados automaticamente:

```bash
docker compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

Para parar a execução:
```bash
docker compose down
```

---

## 🔌 Endpoints da API REST

### 1. Analisar Vídeo
Obtém os metadados públicos, duração, thumbnail e formatos disponíveis.

- **Método**: `POST /api/analyze`
- **Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "platform": "youtube",
  "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "duration": 213,
  "durationFormatted": "03:33",
  "author": "Rick Astley",
  "formats": [
    {
      "id": "137+140",
      "format": "mp4",
      "quality": "1080p",
      "label": "1080p (MP4)",
      "filesizeFormatted": "45.2 MB",
      "ext": "mp4",
      "hasVideo": true,
      "hasAudio": true
    },
    {
      "id": "140",
      "format": "mp3",
      "quality": "audio_only",
      "label": "Áudio MP3 (320kbps)",
      "filesizeFormatted": "5.1 MB",
      "ext": "mp3",
      "hasVideo": false,
      "hasAudio": true,
      "isAudioOnly": true
    }
  ]
}
```

---

### 2. Solicitar Download
Enfileira uma tarefa de download assíncrona.

- **Método**: `POST /api/download`
- **Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp4",
  "quality": "1080p",
  "formatId": "137+140"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "jobId": "a81d4f2e-5c6b-4e89-b7b1-912f38d93c12"
}
```

---

### 3. Consultar Status do Job
Retorna o progresso em tempo real do processamento.

- **Método**: `GET /api/download/:jobId`
- **Response (200 OK)**:
```json
{
  "jobId": "a81d4f2e-5c6b-4e89-b7b1-912f38d93c12",
  "status": "processing",
  "progress": 65,
  "message": "Baixando... 65%"
}
```

**Estados possíveis**:
- `queued`: Na fila de processamento.
- `analyzing`: Analisando fluxo de mídia.
- `processing`: Baixando/mesclando arquivos.
- `completed`: Arquivo finalizado com `downloadUrl` disponível.
- `failed`: Falha durante a operação.
- `unavailable`: Conteúdo inacessível ou com restrições legais.

---

### 4. Obter Arquivo Processado
Faz o download com cabeçalhos HTTP adequados (`Content-Disposition: attachment`).

- **Método**: `GET /api/download/:jobId/file`

---

## 🛠️ Como Adicionar um Novo Provider

A arquitetura foi desenvolvida para que novas plataformas possam ser adicionadas em minutos sem modificar os controllers ou a UI.

### Passo 1: Criar a classe do Provider em `providers/meu-provider/`

Crie o arquivo `providers/dailymotion/dailymotion.provider.ts`:

```typescript
import { BaseProvider, ProgressCallback } from '../base.provider';
import { VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';
import { extractYtDlpMetadata, downloadWithYtDlp } from '../ytdlp-runner';

export class DailymotionProvider extends BaseProvider {
  readonly id: PlatformId = 'dailymotion' as PlatformId;
  readonly name = 'Dailymotion';
  readonly supportedDomains = ['dailymotion.com', 'www.dailymotion.com', 'dai.ly'];

  async getMetadata(url: string): Promise<VideoMetadata> {
    return extractYtDlpMetadata(url, this.id);
  }

  async download(
    url: string,
    options: DownloadOptions,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult> {
    const meta = await this.getMetadata(url);
    return downloadWithYtDlp(url, options, meta.title, onProgress);
  }
}
```

### Passo 2: Adicionar o domínio na allowlist em `config/app.config.ts`

```typescript
allowedHostnames: [
  // ...
  'dailymotion.com',
  'www.dailymotion.com',
  'dai.ly',
]
```

### Passo 3: Registrar no `providers/registry.ts`

```typescript
import { DailymotionProvider } from './dailymotion/dailymotion.provider';

// Dentro do método registerDefaultProviders():
this.register(new DailymotionProvider());
```

---

## 🩺 Troubleshooting

1. **Erro de SSRF ao testar links locais**:
   - O VideoFetch intencionalmente bloqueia requisições para `localhost`, `127.0.0.1` ou faixas privadas para proteger sua infraestrutura. Utilize URLs públicas reais.
2. **Download sem progresso no ambiente Windows sem yt-dlp**:
   - O sistema possui um gerador de mídia resiliente para desenvolvimento que simula o fluxo completo. Para downloads reais locais sem Docker, instale o `yt-dlp` (`pip install yt-dlp`) e `ffmpeg` e certifique-se de que estejam no seu PATH, ou simplesmente utilize `docker compose up`.
3. **Redis não configurado**:
   - Não é necessário ter o Redis instalado para testar localmente. Quando `REDIS_URL` não for definido, o VideoFetch ativa automaticamente o gerenciador de fila assíncrono em memória.
