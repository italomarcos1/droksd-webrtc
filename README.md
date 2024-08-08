<div style="display:flex; align-items:center; justify-content:center; text-align:center; width: 100%;">
  <h1 style="font-size: 40px;">Droksd</h1>
</div>
<div style="display:flex; align-items:center; justify-content:center; text-align:center; gap: 60px; width: 100%; margin: 0 auto;">
  <img src="/images/webrtc.png" style="height: 60px;" />
  <img src="/images/next.png" style="height: 60px;" />
  <img src="/images/tailwind.png" style="height: 60px;" />
  <img src="/images/express.png" style="height: 60px;" />
  <img src="/images/prisma.png" style="height: 60px;" />
  <img src="/images/docker.svg" style="height: 60px;" />
</div>

---
# *Droksd* - um clone do Meet com WebRTC

- Clique [aqui](https://droksd.vercel.app) para testar a aplicação.

O nome é uma variação de “*Discord*”.
- Discord (invertendo as letras) → Drocsid (sem o 'i') → Drocsd (trocando 'c' por 'k') → **Droksd**. “*Drok*” significa “*ocupado*” em *frísio ocidental*, o que faz sentido para um aplicativo de reuniões.


### Descrição

O aplicativo replica as funcionalidades-padrão do Google Meet, um aplicativo de vídeo-conferências/chamadas *online*. O aplicativo utiliza o protocolo **WebRTC** para estabelecer a chamada entre os usuários, de modo que os dados da chamada são transmitidos diretamente entre os clientes (P2P = *peer-to-peer*), sem passar pelo servidor. O servidor é utilizado para estabelecer a chamada entre os clientes, e comunicar para os membros da sala no momento que algum usuário entra na sala.

Além de transmitir vídeo e áudio, o WebRTC também é utilizado para transmitir mensagens (e imagens) pelo *chat*, e legendas (transcrição em tempo real) para os usuários da sala.

Clique [aqui](https://www.youtube.com/watch?v=uH_MLSoBP_A) (vídeo de 40seg) para ver a demo do aplicativo.

---
### Funcionalidades:

- Autenticação social (Google)
- Chamadas de vídeo
- Legendas automáticas (transcrição da fala dos usuários na chamada)
- Compartilhamento de tela
- Chat (mensagens e imagens)
- Múltiplas salas

---
### Back-end

O servidor foi construído utilizando com *Express*, utilizando a *lib* PeerJS para gerenciar as conexões entre os clientes. Para transmissão de dados em tempo real para o cliente, utilizei *Server-sent Events*, um meio nativo de enviar dados servidor-cliente, similar ao protocolo de *websocket*.

Para o banco de dados, utilizei PostgreSQL em um *container* do *Docker*, e Prisma para lidar com as *queries*.

O servidor está instalado em um instância EC2 da AWS e linkado à uma distribuição do *Cloudfront* para distribuição em *edge locations* e certificado SSL.

---

### Front-end

O cliente foi construído utilizando NextJS (um *framework* React) com TailwindCSS.

A aplicação está distribuída na Vercel.

---
### Execute a aplicação no seu dispositivo

##### Backend

É necessário ter Node e Docker instalados na sua máquina.

Após clonar a aplicação, entre na pasta `backend` e execute um dos comandos abaixo para instalar as bibliotecas necessárias.

```
npm install
yarn
```

Então, execute o seguinte comando para criar o *container* com o banco de dados:

```
docker compose up -d
```

Então, execute a aplicação com `npm run dev` (ou `yarn dev`). Na primeira execução, as tabelas da aplicação serão criadas no banco.

```
npm run dev
yarn dev
```

##### Frontend

Na pasta `frontend`, execute um dos comandos abaixo para instalar as bibliotecas da aplicação:

```
npm install
yarn
```

Então, execute a aplicação com `npm run dev` (ou `yarn dev`). Na primeira execução, as tabelas da aplicação serão criadas no banco.

```
npm run dev
yarn dev
```


---
### Ferramentas utilizadas

- Express
- PeerJS
- Prisma
- Docker
- NextJS
- TailwindCSS
