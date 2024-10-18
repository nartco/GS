import React from "react";
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Text
} from 'react-native';
import Modal from 'react-native-modal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'

class PhotoZoomer extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            modalVisible: false,
        };
    }

    openModal = () => {
        this.setState({ modalVisible: true });
    };
    
    closeModal = () => {
        this.setState({ modalVisible: false });
    };

    render() {
        const { modalVisible } = this.state;
        const { image, index, windowWidth, windowHeight, } = this.props;

        return (
            <View>
                <TouchableOpacity onPress={this.openModal} key={index}>
                    <Image
                        source={{ uri: image.url }}
                        style={{height: windowHeight,borderRadius: 22, width: windowWidth, justifyContent: "center", alignSelf:"center", }}
                        resizeMode={ 'contain'}
                    />
                </TouchableOpacity>
                <Modal
                  isVisible={modalVisible}
                  backdropOpacity={0.4}
                  animationIn={'fadeInUp'}
                  animationInTiming={600}
                  animationOut={'fadeOutDown'}
                  animationOutTiming={600}
                  useNativeDriver={true}
                  onRequestClose={this.closeModal}
                  transparent={true}
                  >

                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={this.closeModal}>
                        <Text style={styles.modalCloseButtonText}>Fermer</Text>
                        </TouchableOpacity>

                        <Image
                        source={{ uri: image.url  }}
                        style={styles.modalImage}
                        resizeMode="contain"
                        />
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1,
    },
    modalCloseButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    modalImage: {
      width: '100%',
      height: '100%',
    },
  });

export default PhotoZoomer;