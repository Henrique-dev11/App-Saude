import { StyleSheet } from 'react-native';
import { colors, layout, spacing } from '../../theme';

export default StyleSheet.create({
  // Grade de 3 colunas: cada card tem 31% de largura (ver UserCard.js) e o
  // 'space-between' reparte o espaço que sobra entre eles. Quando a linha
  // enche (3 cards), os próximos quebram para a linha de baixo.
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.maxGridWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    rowGap: spacing.md, // espaço vertical entre as linhas de cards
  },

  fundo: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
