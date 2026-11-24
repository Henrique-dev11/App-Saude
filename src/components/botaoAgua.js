import React from "react";
import { Pressable, Image, Text } from "react-native";
import styles from "./estilosBotaoAgua";

const botaoAgua = ({ image, quantidade, onPress }) => {

    return (
        <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
            onPress={onPress}
        >
            <Image source={image}
                style={styles.image}
            />

            <Text style={styles.texto}>+{quantidade} ml</Text>
        </Pressable>
    )
}

export default botaoAgua;
