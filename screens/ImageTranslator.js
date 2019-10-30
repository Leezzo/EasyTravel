import React, {Component} from 'react';
import {
  ProviderTypes,
  TranslatorConfiguration,
  TranslatorFactory,
} from 'react-native-power-translator';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Picker,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Tts from 'react-native-tts';
import Languages from './languages/languages.json';
import ImagePicker from 'react-native-image-crop-picker';
import {GOOGLE_API_KEY} from '../config';

import {LogoTitle} from './Home';

export default class ImageTranslator extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: <LogoTitle />,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      languageFrom: '',
      languageTo: '',
      languageCode: 'ko',
      inputText: '',
      outputText: '',
    };
    Tts.getInitStatus().then(this.initTts);
  }

  componentDidMount() {
    this.selectImage.bind(this)();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevState.languageCode != this.state.languageCode ||
      prevState.inputText != this.state.inputText
    ) {
      Tts.getInitStatus().then(this.initTts);
      const translator = TranslatorFactory.createTranslator();
      translator.translate(this.state.inputText).then(translated => {
        this.setState({outputText: translated});
      });
    }
  }

  handleTts = () => {
    const translator = TranslatorFactory.createTranslator();
    translator.translate(this.state.inputText).then(translated => {
      Tts.getInitStatus().then(() => {
        Tts.speak(translated);
      });
      Tts.stop();
    });
  };

  initTts = () => {
    Tts.setDucking(true);
    if (this.state.languageCode === 'en') {
      Tts.setDefaultLanguage('en-IE');
    }
    if (this.state.languageCode === 'ko') {
      Tts.setDefaultLanguage('ko-KR');
    }
  };

  selectImage = () => {
    ImagePicker.openPicker({
      cropping: true,
      width: 300,
      height: 400,
      freeStyleCropEnabled: true,
      avoidEmptySpaceAroundImage: true,
      includeBase64: true,
      includeExif: true,
    })
      .then(image => {
        this.detectText(image.data);
      })
      .catch(e => console.log(e));
  };

  detectText = base64 => {
    fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              image: {content: base64},
              features: [{type: 'TEXT_DETECTION'}],
            },
          ],
        }),
      },
    )
      .then(response => {
        return response.json();
      })
      .then(jsonRes => {
        let text = jsonRes.responses[0].fullTextAnnotation.text;
        this.setState({inputText: text});
      })
      .catch(err => {
        console.log('Error', err);
      });
  };
  render() {
    TranslatorConfiguration.setConfig(
      ProviderTypes.Google,
      `${GOOGLE_API_KEY}`,
      this.state.languageCode,
    );
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <Picker
          selectedValue={this.state.languageTo}
          onValueChange={lang =>
            this.setState({languageTo: lang, languageCode: lang})
          }>
          {Object.keys(Languages).map(key => (
            <Picker.Item label={Languages[key]} value={key} />
          ))}
        </Picker>

        <View style={styles.input}>
          <TextInput
            placeholder="이미지를 선택하세요."
            onChangeText={inputText => this.setState({inputText})}
            value={this.state.inputText}
            multiline={true}
            style={{textAlign: 'center'}}
          />
        </View>

        <View style={styles.output}>
          <Text>{this.state.outputText}</Text>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.imageSelectorButton}
            onPress={this.selectImage}>
            <Text style={styles.imageSelectorButtonText}>
              {' '}
              이미지 선택하기{' '}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleTts}
            style={{marginLeft: 10, marginTop: 5}}>
            <Icon size={30} name="md-volume-high" style={styles.ImageStyle} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  input: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.7,
    borderBottomWidth: 0.7,
    borderColor: 'gray',
    borderRadius: 7,
    marginTop: 5,
  },
  output: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.7,
    borderBottomWidth: 0.7,
    borderColor: 'gray',
    borderRadius: 7,
    marginTop: 10,
  },
  ImageStyle: {
    marginTop: 25,
    marginRight: 25,
  },
  imageSelectorButton: {
    backgroundColor: '#7a42f4',
    padding: 10,
    margin: 10,
    marginTop: 20,
    borderRadius: 10,
    height: 50,
    width: 330,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  imageSelectorButtonText: {
    color: 'white',
    fontSize: 20,
  },
  btnContainer: {
    flex: 2,
    flexDirection: 'row',
    marginBottom: 70,
  },
});
