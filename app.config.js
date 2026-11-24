const { expo } = require('./app.json');

module.exports = () => {
    const plugins = [
        ...expo.plugins,
        'expo-asset',
        ['expo-audio', {
            microphonePermission: false,
            recordAudioAndroid: false,
            enableBackgroundPlayback: false,
        }],
    ];
    // Expo Go já fornece o mapa. Um APK próprio precisa da chave restrita do
    // projeto Google Cloud, definida no ambiente de build (não no código JS).
    if (process.env.GOOGLE_MAPS_ANDROID_API_KEY) {
        plugins.push(['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }]);
    }
    return { ...expo, plugins };
};
