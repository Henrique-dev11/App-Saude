# Mapa de UBS e geolocalização

Na Home, abra **Mapa de UBS**. O catálogo contém 10 unidades de São Paulo (SP), cidade escolhida a partir do exemplo da atividade. As coordenadas e os identificadores dos estabelecimentos foram pesquisados nos resultados públicos do Google Maps em **11/11/2026**. Cada registro guarda o link da página de origem em `src/data/ubs.json`.

## Executar

Na pasta `app`, execute `npm install` e depois `npm start` para abrir no Expo Go, ou `npm run web` para o navegador. Reinicie o Expo após instalar as novas dependências nativas. O middleware da API e as telas anteriores continuam no mesmo projeto.

## Uso

- **Mapa**: exibe as 10 UBS com marcadores. Toque em um marcador para ver nome, endereço, latitude e longitude. A unidade selecionada aparece em vermelho. O controle de mapa enquadra todas as unidades.
- **Lista de UBS**: mostra os 10 registros com suas coordenadas. A busca ignora acentos e combina nome, bairro e endereço.
- **Minha localização**: solicita acesso somente quando o usuário toca no botão. A posição real aparece em azul, com um círculo de precisão. A lista passa a ordenar as unidades deste catálogo pela distância em linha reta, em quilômetros. O app não afirma que essas são todas as UBS próximas no município.
- **Permissão negada, GPS desativado ou falta de sinal**: o mapa e o catálogo continuam disponíveis e é possível tentar novamente. A posição do usuário não é inventada, salva no perfil nem enviada à API do app.
- **Copiar coordenadas**: copia latitude e longitude com ponto decimal. **Conferir ponto** abre apenas essas coordenadas no Google Maps, como pede a atividade. **Google Maps** inclui também o Place ID, que identifica o estabelecimento. **Traçar rota** abre o Google Maps para escolher a origem e o meio de transporte.
- **Busca por coordenadas**: digite, por exemplo, `-23.5569536, -46.6419358` e toque na seta do campo. Um marcador roxo permite explorar o ponto. Ele pode ser arrastado e as coordenadas são atualizadas. Os marcadores das UBS permanecem fixos.
- **Busca de endereço**: se a busca não encontrar uma UBS do catálogo, Android/iOS permitem localizar um endereço com `Location.geocodeAsync`. Na web, a opção abre a pesquisa de endereço no Google Maps, pois o Expo não oferece geocodificação web. Não há dependência de um geocodificador público sem configuração.
- **Botão ?**: explica latitude, longitude, limites dos valores e a ordem das coordenadas.

## Coordenadas da atividade

| UBS | Latitude | Longitude | Google Maps |
| --- | ---: | ---: | --- |
| UBS Humaitá | -23.5569536 | -46.6419358 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5569536%2C+-46.6419358&query_place_id=ChIJUfKM3LFZzpQRROfSomuc2c0) |
| UBS Cambuci | -23.5697415 | -46.6234015 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5697415%2C+-46.6234015&query_place_id=ChIJ713glHFZzpQRoVjrgb_6Gog) |
| UBS Nossa Senhora do Brasil | -23.5626683 | -46.6492757 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5626683%2C+-46.6492757&query_place_id=ChIJ7dV3LLhZzpQR0F5E-ZMBsRc) |
| UBS Boracea | -23.5255155 | -46.6515209 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5255155%2C+-46.6515209&query_place_id=ChIJiVwnVg1YzpQRGsgC_saZ0tQ) |
| UBS Santa Cecília | -23.5319780 | -46.6523509 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5319780%2C+-46.6523509&query_place_id=ChIJ_3FSwRRYzpQRZeVNwIE0N68) |
| UBS República | -23.5472619 | -46.6365065 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5472619%2C+-46.6365065&query_place_id=ChIJNZTp8zFZzpQRVPmutDlcUxc) |
| UBS Sé | -23.5510351 | -46.6282371 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5510351%2C+-46.6282371&query_place_id=ChIJNaCbtQZZzpQRX8csph7yD3E) |
| UBS Vila Mariana | -23.5956046 | -46.6432741 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5956046%2C+-46.6432741&query_place_id=ChIJY9-jZwBbzpQRXlv25A-y1Q4) |
| UBS Vila Romana | -23.5289660 | -46.6953006 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5289660%2C+-46.6953006&query_place_id=ChIJK6vOY3b4zpQRE0OoKcPINGI) |
| UBS Brás | -23.5435304 | -46.6147047 | [Conferir](https://www.google.com/maps/search/?api=1&query=-23.5435304%2C+-46.6147047&query_place_id=ChIJv0DAzd9YzpQR6d--BrUoguc) |

Os nomes, endereços e coordenadas seguem os resultados do Google Maps consultados, que podem diferir de cadastros antigos. Os links de fonte completos estão no JSON. Não se utiliza a coordenada ilustrativa da UBS São Judas como se ela fosse uma unidade confirmada.

## Conceitos dos slides aplicados

O material de referência ensina `expo-location`, `requestForegroundPermissionsAsync`, `getCurrentPositionAsync`, `geocodeAsync`, `MapView`, `Marker`, `coordinate`, `title`, `description`, `pinColor`, `identifier`, `onPress`, `draggable` e controle de região/zoom com latitude, longitude e deltas. A implementação mantém esses conceitos em componentes separados por plataforma.

Latitude vai de -90 a 90 e longitude de -180 a 180. Em São Paulo, a latitude negativa indica o hemisfério sul e a longitude negativa indica oeste de Greenwich. Não se deve inverter os valores.

## Mapas e publicação

- **Android/iOS**: `react-native-maps`, com Google Maps no Android e Apple Maps no iOS. O Expo Go já inclui o suporte nativo. As ações externas abrem Google Maps em ambas as plataformas.
- **Web**: Leaflet com ruas e atribuição do OpenStreetMap, incluindo todos os marcadores, zoom, deslocamento e seleção. Não importa `react-native-maps` no bundle web.
- O mapa de ruas e os serviços externos precisam de internet. O catálogo local e suas coordenadas permanecem disponíveis sem conexão. A web trata falhas no carregamento do mapa e oferece nova tentativa.
- A localização no navegador exige HTTPS ou localhost. Um acesso pelo IP da rede em HTTP pode bloquear a geolocalização.
- Para um **APK próprio**, habilite Maps SDK for Android no Google Cloud, crie uma chave restrita ao pacote e SHA-1 do aplicativo e defina `GOOGLE_MAPS_ANDROID_API_KEY` no ambiente do build. `app.config.js` injeta a chave no plugin nativo. Não se deve escrever `process.env...` como texto em `app.json`. Depois, gere um novo build. A chave não é necessária para os links do Google Maps, para o mapa web ou para usar Expo Go.
- Somente a permissão de localização em uso é solicitada. Não há rastreamento em segundo plano.

## Referências técnicas

- [Expo SDK 57: Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Expo SDK 57: react-native-maps](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/)
- [Google Maps URLs: coordenadas, Place IDs e rotas](https://developers.google.com/maps/documentation/urls/get-started)
- [Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html)

## Verificação

`npm test` inclui os testes anteriores e os novos casos de geolocalização: permissão negada, GPS desativado, falha de sinal, contexto seguro da web, geocodificação, validação de coordenadas, busca sem acentos, distâncias e links de estabelecimentos/rotas. Os testes de localização usam respostas controladas e não consultam a posição real de ninguém.
