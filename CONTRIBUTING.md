# 🤝 Guia de Contribuição — COLA O LINK

Ficamos muito felizes pelo seu interesse em contribuir com o **COLA O LINK**! Este é um projeto de código aberto criado pela comunidade e para a comunidade, com o objetivo de oferecer uma ferramenta limpa, rápida, sem pop-ups invasivos e segura para download e conversão de mídias públicas.

---

## 🌟 Princípios do Projeto

- **Sem anúncios intrusivos ou armadilhas:** A interface deve permanecer limpa, rápida e acessível.
- **Privacidade & Retenção Zero:** Nenhum arquivo ou dado do usuário deve ser mantido além do tempo estritamente necessário (TTL efêmero).
- **Segurança em primeiro lugar:** Proteções contra SSRF, Command Injection e IDOR são inegociáveis.
- **Modularidade:** Provedores de mídia devem ser isolados em módulos independentes.

---

## 🛠️ Como Configurar o Ambiente de Desenvolvimento

### 1. Pré-requisitos
- **Node.js**: v18+ ou v20+
- **NPM**
- **FFmpeg** e **yt-dlp** instalados no sistema (opcional caso use Docker)
- **Docker & Docker Compose** (opcional, recomendado para simular produção)

### 2. Passo a Passo

```bash
# 1. Faça o fork do repositório no GitHub e clone localmente
git clone https://github.com/SEU-USUARIO/baixavideo.git
cd baixavideo

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local

# 4. Execute a suíte de testes unitários
npm test

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧩 Como Adicionar ou Atualizar um Provedor de Mídia

Todos os provedores de mídia ficam localizados no diretório `providers/`. Para adicionar um novo provedor (ex: `exemplo`):

1. Crie uma pasta `providers/exemplo/` com o arquivo `exemplo.provider.ts`.
2. Implemente a classe estendendo `BaseProvider` (`providers/base.provider.ts`):
   ```typescript
   import { BaseProvider } from '../base.provider';
   import { VideoMetadata, DownloadOptions, DownloadResult } from '../../types/video';

   export class ExemploProvider extends BaseProvider {
     readonly id = 'exemplo';
     readonly name = 'Exemplo';
     readonly domains = ['exemplo.com', 'www.exemplo.com'];

     async analyze(url: string): Promise<VideoMetadata> {
       // Extração de metadados (título, thumbnail, formatos)
     }

     async download(options: DownloadOptions): Promise<DownloadResult> {
       // Execução do download seguro com yt-dlp/ffmpeg
     }
   }
   ```
3. Registre o novo provedor no `providers/registry.ts`.
4. Adicione testes correspondentes em `tests/providers.test.ts`.

---

## 🧪 Testes e Qualidade de Código

Antes de enviar um Pull Request, certifique-se de que todos os testes estão passando:

```bash
# Executar todos os testes com Vitest
npm test

# Verificar linter e tipos TypeScript
npm run lint
```

---

## 📬 Como Enviar um Pull Request (PR)

1. Crie uma branch para a sua feature/correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
2. Faça commits com mensagens claras e descritivas (seguindo a convenção [Conventional Commits](https://www.conventionalcommits.org/)):
   - `feat: adiciona suporte à plataforma X`
   - `fix: corrige extração de áudio no YouTube`
   - `docs: atualiza instruções de Docker no README`
3. Envie a branch para o seu repositório remoto:
   ```bash
   git push origin feature/minha-melhoria
   ```
4. Abra um **Pull Request** no GitHub detalhando o que foi feito e os testes realizados.

Muito obrigado por ajudar a tornar a internet um lugar mais aberto e acessível! 🚀
