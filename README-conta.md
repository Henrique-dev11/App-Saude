# Cadastro, sessão e perfil

Antes desta implementação, cadastro e login apenas mudavam de tela; o perfil usava
estado React local. Não existia provedor de autenticação, banco de usuários ou
persistência de sessão para reutilizar. O fluxo agora usa o servidor Node já
existente, integrado ao Expo por `metro.config.js`.

## Executar

Na pasta `app`, com Node.js 22.13 ou superior:

```sh
npm install
npm run web
```

`npm start` também inicia o app para Android/iOS. Reinicie o Expo se ele já estava
aberto antes das mudanças no middleware. O Expo Go contém os módulos utilizados.
Se usar um development build próprio, gere um novo build após adicionar
`expo-secure-store` e as permissões do `expo-image-picker`.

Nenhuma conta externa, chave de API ou serviço de identidade precisa ser
configurado para desenvolver localmente.

## Fluxo e interface

- O cadastro exige nome, e-mail, senha e confirmação, idade, tipo sanguíneo, peso
  em kg e altura em cm. Os oito tipos sanguíneos reutilizam a mesma lista da tela
  de sangue. Os campos numéricos aceitam ponto ou vírgula para decimais.
- O cadastro inicia uma sessão e abre diretamente o perfil. O login valida a
  senha no servidor e abre a Home. Rotas internas só existem quando há uma
  sessão autenticada; logout remove esse conjunto de rotas.
- O perfil exibe foto circular, nome, e-mail, informações pessoais e físicas.
  “Editar perfil” abre o formulário e “Salvar alterações” persiste os dados sem
  novo cadastro. Cancelar descarta somente a edição não salva.
- A galeria permite adicionar, substituir e remover a foto. São aceitos JPEG,
  PNG e WebP com até 2 MB. A imagem é salva no banco, não como um caminho
  temporário do dispositivo, e atualiza também o avatar do cabeçalho.
- “Alterar senha” fica separada das informações pessoais, exige a senha atual e
  a confirmação da nova senha. Senhas têm de 8 a 128 caracteres, com letras e
  números. A troca revoga as outras sessões e renova a sessão atual.
- E-mails são normalizados e têm restrição única no banco, inclusive nas edições.
  Validações de idade (1–130), peso (0,1–500 kg) e altura (30–300 cm) rodam tanto
  no cliente quanto no servidor.

## Persistência e segurança

O banco SQLite é criado automaticamente em `server/.data/usuarios.sqlite` e está
excluído do Git. Contas, fotos e sessões permanecem disponíveis após reiniciar o
servidor ou o aplicativo. Esse diretório precisa ser preservado; apagá-lo apaga as
contas. Para escolher outro arquivo, defina `AUTH_DB_PATH` no ambiente do servidor.

Senhas não são guardadas em texto puro: o servidor usa `scrypt` assíncrono, salt
aleatório de 16 bytes e parâmetros N=32768, r=8, p=3. A comparação usa tempo
constante. Respostas públicas nunca incluem senhas ou hashes. Tokens de sessão
são aleatórios e somente seu SHA-256 é persistido no banco. Sessões duram 30 dias,
são verificadas ao abrir o app e podem ser revogadas por logout ou troca de senha.

No navegador, a sessão fica em cookie HttpOnly, SameSite=Lax e persistente;
nenhum token é escrito no localStorage. No celular, o token é mantido pelo
`expo-secure-store` com proteção nativa e acesso restrito ao dispositivo. A senha
não é armazenada pelo app. Uma falha no armazenamento seguro não é apresentada
como login persistente bem-sucedido.

Cada operação de perfil usa o usuário da sessão, nunca um ID enviado no
formulário. Consultas SQL usam parâmetros. Alterações concorrentes são detectadas
por uma versão do perfil: o usuário deve recarregar quando outra sessão já tiver
alterado os dados. Falhas de conexão/validação não apagam o perfil anterior nem
limpam o formulário de edição. Uma resposta antiga de atualização de sessão não
pode substituir um perfil recém-salvo ou reabrir uma conta depois do logout.

O servidor aceita JSON, valida a assinatura dos formatos de imagem, limita o corpo
da requisição a 3 MB e limita tentativas de cadastro/login/senha a 30 por IP em
15 minutos. Origens web externas são recusadas por padrão. Respostas de conta
usam `Cache-Control: no-store`.

## Publicação e dependências externas

Em produção, é necessário publicar o servidor Node, usar HTTPS e manter o banco
em um volume persistente. Um export estático do Expo não executa o backend.
No ambiente de build do app, defina apenas o endereço público:

```env
EXPO_PUBLIC_API_URL=https://seu-servidor
```

Sem essa variável, a web usa a própria origem e o celular em desenvolvimento usa
o host/porta do Expo. A configuração existente `EXPO_PUBLIC_FRUIT_API_URL` também
pode fornecer a origem do mesmo servidor quando não houver `EXPO_PUBLIC_API_URL`.

No ambiente do servidor publicado:

```env
AUTH_DB_PATH=/caminho/privado/persistente/usuarios.sqlite
AUTH_COOKIE_SECURE=true
```

Prefira servir app e API na mesma origem. Se forem origens diferentes do mesmo
site, configure `AUTH_ALLOWED_ORIGINS` com a lista exata de origens web permitidas,
separadas por vírgulas. Cookies entre sites diferentes não são habilitados por este
fluxo. Não coloque segredos em variáveis `EXPO_PUBLIC_`.

A restauração da sessão exige conexão com o servidor. Sem conexão, o app informa
uma falha real e permite tentar novamente, preservando a credencial protegida.
Não há perfis simulados ou confirmação de salvamento sem resposta bem-sucedida.

## Validação

`npm test` inclui cadastro, normalização e duplicação de e-mails, restauração de
sessão, persistência após fechar/reabrir o SQLite, edição completa, foto,
conflitos de versão, senhas incorretas, troca/rotação de senha, logout, isolamento
entre contas, cookies, CORS, cliente nativo e falhas de rede/armazenamento seguro.
Os testes usam bancos temporários, sem criar contas no banco de desenvolvimento.

Também foi validado no Firefox o fluxo de cadastro → perfil, atualização completa,
galeria, substituição/remoção de foto, falha de conexão ao salvar sem perder a
edição, recarregamento do app, login com e-mail/senha atualizados, logout,
duplicação de e-mail e isolamento entre duas contas. As exportações Expo web e
Android verificam a compatibilidade dos módulos usados.

## Arquivos desta implementação

- `.gitignore`
- `App.js`
- `README-conta.md`
- `app.json`
- `metro.config.js`
- `package-lock.json`
- `package.json`
- `server/auth.cjs`
- `server/auth.test.cjs`
- `server/clienteAuth.test.cjs`
- `server/index.cjs`
- `server/usuarios.cjs`
- `server/usuarios.test.cjs`
- `src/components/Botao.js`
- `src/components/BotaoPerfil.js`
- `src/components/BotaoTipo.js`
- `src/components/CamposUsuario.js`
- `src/components/InputCampo.js`
- `src/components/SeletorTipoSanguineo.js`
- `src/contexts/Autenticacao.js`
- `src/data/tiposSanguineos.js`
- `src/data/tiposSanguineos.json`
- `src/screens/Cadastro/index.js`
- `src/screens/Login/index.js`
- `src/screens/Perfil/index.js`
- `src/screens/Perfil/style.js`
- `src/services/autenticacao.js`
- `src/services/validarUsuario.js`
