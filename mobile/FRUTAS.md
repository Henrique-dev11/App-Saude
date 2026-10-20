# Frutas e dados do perfil

A tela Fruta consulta a API indicada em `../docs/api/api.txt`:
`https://www.fruityvice.com/api/fruit/all`.
Os valores nutricionais são fornecidos pela Fruityvice por 100 g.
A busca aceita nomes em português ou inglês, com ou sem acentos.

## Executar

Na pasta `mobile`, execute `npm start` para usar no celular ou `npm run web`
para usar no navegador. Reinicie o Expo depois de alterar `metro.config.js`.
No celular, a consulta é direta. No desenvolvimento web, o Metro atende
`/api/fruits` usando `server/fruitsMiddleware.cjs`, pois a Fruityvice não envia
cabeçalhos CORS para o navegador. Não é necessário iniciar outro servidor.

Ao hospedar um build web estático, configure `/api/fruits` no servidor usando
o mesmo middleware ou defina `EXPO_PUBLIC_FRUIT_API_URL` antes do build para
um endpoint HTTPS que permita o domínio do app. O proxy só encaminha GET
para a lista pública de frutas, sem enviar os dados do perfil.

## Perfil compartilhado

O cadastro exige peso em kg (aceita vírgula decimal), idade inteira de 0 a 130
anos e um dos oito tipos sanguíneos. Esses campos também podem ser alterados
em Meu perfil. O AuthContext mantém os dados de cada conta durante a execução:
Sangue usa e atualiza o tipo sanguíneo; Água e IMC recebem o peso cadastrado
e atualizam o perfil ao calcular com um novo peso. Água preserva o peso ao
reiniciar o consumo. A idade fica disponível em `user.age`.

O login continua sendo uma demonstração em memória. Os cadastros e dados são
apagados ao encerrar/recarregar o app; ainda não existe backend ou persistência.
