# Medieval Kingdoms – Jogo de Estratégia Web

Este repositório contém um protótipo de jogo de estratégia em que o jogador
assume o papel de príncipe de uma grande nação da Idade Média. O objetivo é
preparar‑se para o trono, tomar decisões diplomáticas, militares e
econômicas e, finalmente, governar como rei. O jogo é concebido para
dispositivos móveis (mobile‑first) e também se adapta perfeitamente ao
desktop. Não utilizamos frameworks – todo o código é escrito em HTML, CSS
e JavaScript puro.

## Como executar

1. Faça download deste repositório ou clone‑o com:

   ```bash
   git clone <url‑do‑repositório>
   ```

2. Navegue até a pasta `game` e abra o arquivo `index.html` em um navegador
   moderno. O jogo roda totalmente no cliente e não requer servidor
   backend.

   ```bash
   cd game
   # abrir index.html no navegador de sua preferência
   ```

3. Para acessar a área administrativa, utilize o link **Admin** no rodapé
   da página principal ou abra `admin.html`. O usuário e senha padrão são
   `admin` / `admin123`. Estes valores são salvos no `localStorage` e
   podem ser alterados posteriormente.

## Estrutura do projeto

```
game/
├── admin.html          # Página de administração para gerenciar DLCs
├── admin.js            # Lógica de login e instalação de expansões
├── assets/             # Pastas para imagens e ícones
├── content/
│   ├── baseEvents.json # Eventos principais do jogo
│   ├── manifest.json   # Manifesto de DLCs disponíveis
│   └── dlc/
│       └── trade_expansion.json # Exemplo de expansão
├── index.html          # Página principal do jogo
├── script.js           # Lógica do jogo e carregamento de conteúdo
└── style.css           # Estilos globais e componentes
```

### Conteúdo modular (DLC/Expansões)

O diretório `content` armazena eventos em arquivos JSON. O arquivo
`manifest.json` descreve as expansões disponíveis. Cada DLC é um arquivo
JSON com sua própria lista de eventos. A área administrativa permite
instalar ou remover expansões; a lista de expansões instaladas é
persistida em `localStorage`.

### Admin

A tela de administração foi criada para um modo local inicial, sem
servidor. Ela fornece um login simples e interface para instalar novas
DLCs a partir de arquivos JSON. No futuro, a estrutura está preparada
para integrar um backend via API (por exemplo, para autenticação
complexa ou armazenamento de dados). Todos os estados são salvos em
`localStorage` para fins demonstrativos.

## Deploy no GitHub Pages

Se desejar publicar o jogo no GitHub Pages:

1. Crie um repositório no GitHub e envie os arquivos da pasta `game/`.
2. No repositório do GitHub, acesse **Settings → Pages** e selecione a
   branch principal como fonte, apontando para a raiz (`/`).
3. Aguarde a publicação e acesse a URL fornecida pelo GitHub Pages.

## Observações

* O projeto segue o princípio **mobile‑first**: o layout e a
  usabilidade foram pensados para telas pequenas e se adaptam a
  resoluções maiores.
* O design utiliza gradientes elegantes, tipografia consistente e
  micro‑interações suaves nos botões.
* O código está organizado de forma que novas funcionalidades ou
  expansões possam ser adicionadas sem alterar a base do jogo.
* Para fins de demonstração, as decisões e consequências são simples.
  Sinta‑se à vontade para ampliar os eventos no arquivo JSON e criar
  novas DLCs.
