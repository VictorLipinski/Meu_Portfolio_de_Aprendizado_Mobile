# NOOMI 🎵

NOOMI é um aplicativo mobile de descoberta musical desenvolvido com React Native, Expo e TypeScript.

O projeto foi criado com o objetivo de oferecer uma experiência inspirada em plataformas de streaming musical, permitindo explorar artistas, álbuns e músicas por meio de uma interface moderna, intuitiva e responsiva.

## Funcionalidades

### 🎶 Descoberta Musical
- Listagem de álbuns
- Detalhes completos dos álbuns
- Perfil dos artistas
- Informações musicais obtidas através da API TheAudioDB

### ❤️ Favoritos
- Favoritar álbuns
- Favoritar músicas
- Remover itens dos favoritos
- Persistência local com AsyncStorage

### 📂 Playlists
- Criar playlists personalizadas
- Editar nome das playlists
- Excluir playlists
- Adicionar músicas às playlists
- Remover músicas das playlists
- Busca de músicas para adicionar às playlists

### ▶️ Player de Música
- Mini Player persistente
- Tela completa de reprodução (Now Playing)
- Controles de play, pause, próxima e anterior
- Barra de progresso simulada
- Informações do álbum e artista

### 🔔 Lembretes Musicais
- Sistema de notificações locais
- Lembretes para ouvir músicas e álbuns
- Persistência das preferências do usuário

## Tecnologias Utilizadas

- React Native
- Expo
- Expo Router
- TypeScript
- AsyncStorage
- Expo Notifications
- React Navigation
- TheAudioDB API

## Estrutura do Projeto

O projeto segue uma arquitetura baseada em componentes reutilizáveis, hooks personalizados e navegação por rotas utilizando Expo Router.

Principais módulos:

- Home
- Álbuns
- Artistas
- Favoritos
- Playlists
- Perfil
- Player
- Notificações

## Como Executar

### Instalar dependências

```bash
npm install