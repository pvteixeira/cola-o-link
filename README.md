# 🎬 COLA O LINK

<p align="center">
  <img src="./public/banner.png" alt="COLA O LINK Banner" width="100%" style="border-radius: 12px; margin-bottom: 16px;" />
</p>

<p align="center">
  <strong>Cole o link. Baixe sem estresse.</strong><br>
  <em>Plataforma web open-source de alta performance para processamento, conversão e download de mídias públicas. Sem pop-ups, sem vírus e pronta para self-hosting.</em>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="MIT License" /></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" /></a>
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FFmpeg-Ready-007808?style=for-the-badge&logo=ffmpeg" alt="FFmpeg" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</p>

---

## 💡 Por que este projeto existe?

A maioria dos sites de download de vídeos na internet hoje é uma experiência frustrante: dezenas de pop-ups invasivos, anúncios com botões falsos de "Download", redirecionamentos suspeitos e risco de malware.

O **COLA O LINK** foi criado com um propósito claro: **oferecer uma alternativa 100% limpa, rápida, moderna e de código aberto**. Uma ferramenta feita de desenvolvedor para a comunidade, onde você pode usar diretamente ou rodar na sua própria máquina/servidor com total privacidade.

---

## ✨ Recursos & Diferenciais

- 🚀 **Interface Ultrarrápida & Moderna:** Desenvolvida em Next.js 14 (App Router) e Tailwind CSS com tema escuro imersivo.
- 🎧 **Áudio e Vídeo 100% Sincronizados:** Integração inteligente com **FFmpeg** para mesclagem de fluxos HD de vídeo e áudio em formato puro `.mp4`.
- 🎵 **Conversão Direta para MP3:** Extração de faixas sonoras em alta fidelidade (`.mp3` até 320 kbps).
- 🔄 **Fila Híbrida Inteligente:** Roda localmente sem dependências externas (usando MemoryQueue assíncrona) ou em escala com **Redis + BullMQ**.
- 🧹 **Retenção Zero de Dados:** Arquivos temporários são automaticamente limpos após o download (TTL configurável).
- 🐳 **1-Click Self-Hosting:** Suporte nativo a Docker e Docker Compose com todas as dependências pré-instaladas (FFmpeg e yt-dlp).

---

## 🛡️ Segurança e Privacidade em Primeiro Lugar

1. **Tokens HMAC-SHA256:** Links de download protegidos por assinaturas criptográficas temporárias para evitar enumeração de arquivos (IDOR).
2. **Proteção Anti-SSRF em Nível de DNS:** Bloqueio rigoroso contra requisições a IPs de rede interna (`localhost`, `127.0.0.1`, `10.x`, `192.168.x`, `169.254.169.254`).
3. **Execução Segura de Subprocessos:** Binários executados com argumentos explícitos e `shell: false`, prevenindo Command Injection.
4. **Respeito a DRM e Conteúdos Protegidos:** O sistema não contorna DRM (Widevine, FairPlay), não quebra paywalls e não acessa mídias restritas.

---

## 🧰 Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Route Handlers & Server Actions, Zod, Web Crypto API |
| **Mídia & Transcoding** | FFmpeg + yt-dlp |
| **Filas & Workers** | BullMQ + Redis / Fila em Memória Assíncrona |
| **Infraestrutura** | Docker (Multi-stage build), Docker Compose |
| **Testes** | Vitest (Suíte automatizada cobrindo Providers, Fila e Segurança) |

---

## 🏗️ Estrutura do Projeto

```text
├── app/                              # Rotas, API Handlers e Layouts do Next.js
│   ├── api/
│   │   ├── analyze/                  # POST: Extração de metadados e formatos
│   │   └── download/                 # POST/GET: Fila e streaming do arquivo
├── components/                       # Componentes de UI (Hero, VideoCard, Progress, etc.)
├── config/                           # Configurações globais centralizadas
├── lib/
│   ├── errors/                       # Classes de erro tipadas
│   ├── process/                      # Execução segura de subprocessos
│   └── security/                     # Rate limit, SSRF check, HMAC e sanitização
├── providers/                        # Módulos desacoplados de plataformas de mídia
│   ├── instagram/
│   ├── reddit/
│   ├── tiktok/
│   ├── vimeo/
│   ├── x/
│   ├── youtube/
│   ├── registry.ts                   # Registro dinâmico de provedores
│   └── ytdlp-runner.ts               # Runner do yt-dlp + FFmpeg
├── queues/                           # Abstração de filas (Memory & BullMQ)
├── services/                         # Lógica de negócio (Analyze, Download, Storage)
├── tests/                            # Testes automatizados com Vitest
└── workers/                          # Workers assíncronos de download e limpeza
```

---

## 🚀 Como Executar

### Opção 1: Via Docker Compose (Recomendado)

A forma mais simples de rodar tudo pronto com FFmpeg, yt-dlp e Redis configurados:

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/baixavideo.git
cd baixavideo

# 2. Subir a aplicação
docker compose up -d --build
```

Acesse **[http://localhost:3000](http://localhost:3000)** no seu navegador.

---

### Opção 2: Localmente com Node.js

```bash
# 1. Instalar dependências
npm install

# 2. Rodar a suíte de testes
npm test

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

> **Nota:** Para downloads locais sem Docker, certifique-se de ter o `ffmpeg` e o `yt-dlp` acessíveis no PATH do seu sistema ou na pasta `bin/`.

---

## 🧪 Testes Automatizados

Para executar os testes de segurança, providers e filas:

```bash
npm test
```

---

## 🤝 Como Contribuir

Contribuições são super bem-vindas! Quer adicionar suporte a uma nova plataforma ou melhorar o desempenho?
Confira o nosso [Guia de Contribuição (CONTRIBUTING.md)](./CONTRIBUTING.md) para ver como começar.

---

## ⚖️ Aviso Legal & Isenção de Responsabilidade

Este software é um utilitário desenvolvido para fins educacionais, de pesquisa e backup pessoal de mídias de domínio público ou explicitamente autorizadas pelos seus criadores. Os desenvolvedores deste projeto não hospedam nem possuem direitos sobre os conteúdos baixados pelos usuários finais e não incentivam a violação de direitos autorais ou dos termos de serviço das respectivas plataformas.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
