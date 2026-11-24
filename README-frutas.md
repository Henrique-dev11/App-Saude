# Tela de frutas

Execute os comandos na pasta `app`, com Node.js 22.13 ou superior (Expo 57).

- `npm install`
- `npm run web`: inicia o Expo web com a API integrada.
- `npm start`: inicia o Expo para celular com a mesma API.
- `npx expo start`: também disponibiliza a API, por meio de `metro.config.js`.
- `npm run api`: inicia a API independente na porta 3001, ou na porta definida em `PORT`.
- `npm test`: executa os testes de integração e dos serviços.

Após alterar `metro.config.js`, reinicie a instância do Expo que já estava aberta.
Não é necessário iniciar um segundo processo na porta 3001 em desenvolvimento.

## Conexão

No navegador, o aplicativo consulta `/api/fruit/all` na mesma origem do Expo,
inclusive quando a porta muda. No celular, usa o host e a porta informados pelo
Expo. O middleware encaminha a consulta para o serviço Node existente, que acessa
Fruityvice e MyMemory. A Fruityvice não envia o cabeçalho CORS necessário para
consultas diretas de um navegador; por isso, as chamadas externas ficam no servidor.

Para um aplicativo publicado, configure uma API HTTPS acessível aos usuários:

```env
EXPO_PUBLIC_FRUIT_API_URL=https://seu-servidor/api/fruit/all
```

Um site exportado é estático: o middleware do Metro só existe durante o
`expo start`. Em produção, publique a API Node e configure essa URL no build,
ou encaminhe `/api/fruit/all` para o servidor Node na hospedagem do site.
A variável contém apenas o endereço público, nunca credenciais. Não são
necessárias chaves privadas para as APIs utilizadas.

## Busca e detalhes

A lista principal contém exclusivamente os nomes em português. A pesquisa é
imediata, ignora maiúsculas e acentos: `Maçã`, `maca` e `MACA` encontram Maçã e
Maçã verde. Sinônimos como Kiwi/Kiwifruit e Pitahaya/Dragonfruit aparecem uma vez.
Pesquisas vazias mostram todos os nomes; pesquisas sem resultados exibem um aviso.

Ao selecionar um nome, a tela mostra os valores nutricionais da resposta real da
Fruityvice: calorias, carboidratos, proteínas, gorduras e açúcares. Os valores são
referentes a 100 g, conforme a [documentação do provedor](https://www.fruityvice.com/).
Números são formatados em pt-BR, sem calcular ou estimar nutrientes. Campos
parciais, nulos ou ausentes são identificados como “Não informado pela API”.
O nome original e os demais campos permanecem internos.

## Tradução

O servidor traduz os nomes via [MyMemory](https://mymemory.translated.net/doc/spec.php),
com `langpair=en|pt-BR`, lotes de até 500 bytes UTF-8 e prazo total de 2,5 segundos.
As traduções válidas são guardadas por 24 horas por nome original. O glossário
`src/data/nomesFrutasPtBr.json` fornece nomes revisados quando o tradutor falha ou
repete um termo inglês, e padroniza sinônimos e variedades brasileiras. Esse
arquivo contém somente nomes, nunca números nutricionais.

Usar um nome já traduzido do glossário não gera mensagem de erro. Frutas novas
sem tradução são omitidas com aviso e podem ser traduzidas na próxima tentativa.
Uma falha na tradução não descarta os dados nutricionais carregados da Fruityvice.

## Falhas, cache e recuperação

A API mantém o catálogo real em memória por uma hora. Em falhas de conexão, pode
reutilizar a última resposta efetivamente obtida da Fruityvice, identificada como
cache offline. O cliente também mantém a última resposta real em memória durante
a sessão. Não há importação do catálogo nutricional embutido em `frutas.json` no
fluxo da aplicação. Esse arquivo permanece apenas como referência/fixture dos testes.

Sem uma consulta anterior bem-sucedida, uma falha de conexão exibe um erro e a
opção de tentar novamente. HTTP 500, timeouts, respostas HTML, JSON inválido e
problemas de configuração são tratados como falhas reais, sem substituir os dados
por um catálogo local. O cache em memória não persiste após reiniciar o processo.

O botão “Tentar novamente” envia `refresh=1`, ignora o cache positivo do catálogo
e repete traduções que falharam, sem esperar os prazos de cache. A tela indica o
carregamento e cancela requisições antigas ao sair ou iniciar outra tentativa.
Quando há uma falha, tenta novamente a cada 15 segundos, ao voltar ao aplicativo
e ao receber o evento `online` do navegador. Uma consulta bem-sucedida remove os
avisos e atualiza o catálogo e os detalhes selecionados.

Os cabeçalhos `X-Fruit-Source` (`api` ou `cache`), `X-Fruit-Translation`
(`api`, `cache` ou `fallback`) e `X-Fruit-Updated-At` permitem distinguir a origem
e a data da última consulta bem-sucedida. As respostas HTTP usam `Cache-Control:
no-store` para que o navegador não impeça uma nova consulta manual.

## Validação

Os testes cobrem URLs na web e no celular, outras portas e HTTPS, tradução e busca
por Maçã/Banana/Morango, dados reais preservados, campos nutricionais ausentes,
CORS, HTTP 500, timeouts, cancelamento, requisições simultâneas, nova tentativa e
transições online/offline. As falhas de rede são simuladas sem desligar a conexão
do computador.
