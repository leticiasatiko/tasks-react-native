import { Alert, Platform } from 'react-native';

const server = Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

function showError(err: any) {
    if (err.response && err.response.data) {
        Alert.alert('Erro', `Erro: ${err.response.data}`);
    } else {
        Alert.alert('Erro', `Erro: ${err}`);
    }
}

function showSuccess(msg: string) {
    Alert.alert('Sucesso', msg);
}

export { server, showError, showSuccess };