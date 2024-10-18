import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de repli.
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez également enregistrer l'erreur dans un service de rapport d'erreurs
    console.log('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de repli
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Quelque chose s'est mal passé.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default ErrorBoundary;
