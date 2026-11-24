import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import UserCard from '../../components/UserCard';
import IconeMapa from '../../components/IconeMapa';
import styles from './style';


export default function Home({ navigation }) {
  return (
    <ScrollView style={styles.fundo} contentContainerStyle={styles.container}>
      <UserCard nome='Mapa de UBS' cargo='' icone={<IconeMapa tipo="mapa" size={52} />} onPress={() => navigation.navigate('UnidadesSaude')}/>
      <UserCard nome='Sangue' cargo='' imagem={require('../../../assets/sangue.png')} onPress={() => navigation.navigate('Sangue')}/>
      <UserCard nome='Água' cargo='' imagem={require('../../../assets/agua.png')} onPress={() => navigation.navigate('Agua')}/>
      <UserCard nome='Rémedio' cargo='' imagem={require('../../../assets/remedio.png')} onPress={() => navigation.navigate('Remedio')}/>
      <UserCard nome='Alergias' cargo='' imagem={require('../../../assets/alergia.png')} onPress={() => navigation.navigate('Alergias')}/>
      <UserCard nome='Glícemia' cargo='' imagem={require('../../../assets/glicemia.png')} onPress={() => navigation.navigate('Glicemia')}/>
      <UserCard nome='Pressão' cargo='' imagem={require('../../../assets/pressao.png')} onPress={() => navigation.navigate('Pressao')}/>
      <UserCard nome='IMC' cargo='' imagem={require('../../../assets/imc.png')} onPress={() => navigation.navigate('Imc')}/>
      <UserCard nome='Vacinas' cargo='' imagem={require('../../../assets/vacina.png')} onPress={() => navigation.navigate('Vacinas')}/>
      <UserCard nome='Meditação' cargo='' imagem={require('../../../assets/meditacao.png')} onPress={() => navigation.navigate('Meditacao')}/>
      <UserCard nome='Fruta' cargo='' imagem={require('../../../assets/fruta.png')} onPress={() => navigation.navigate('Fruta')}/>
      <UserCard nome='Dica' cargo='' imagem={require('../../../assets/dica.png')} onPress={() => navigation.navigate('Dica')}/>
      <UserCard nome='Emergência' cargo='' imagem={require('../../../assets/emergencia.png')} onPress={() => navigation.navigate('Emergencia')}/>
    </ScrollView>
  );
}
