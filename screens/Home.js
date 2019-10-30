import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import RNLocation from 'react-native-location';
import axios from 'axios';
import {WEATHER_API_KEY} from '../config';

const weatherOptions = {
  Rain: {
    img: require('./images/weather/rainy.png'),
  },
  Clear: {
    img: require('./images/weather/sunny.png'),
  },
  Clouds: {
    img: require('./images/weather/cloudy.png'),
  },
  Snow: {
    img: require('./images/weather/snowy.png'),
  },
};

export class LogoTitle extends Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Easy Travel</Text>
      </View>
    );
  }
}

export default class App extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: <LogoTitle />,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      condition: '',
      country: '',
      tem: '',
      name: '',
      loading: true,
    };
  }

  componentDidMount() {
    RNLocation.configure({
      distanceFilter: 5.0,
    })
      .then(() =>
        RNLocation.requestPermission({
          android: {
            detail: 'fine',
            rationale: {
              title: '위치 권한 설정',
              message: '위치 권한을 허용하시겠습니까?',
              buttonNegative: '거부',
              buttonPositive: '허용',
            },
          },
        }),
      )
      .then(granted => {
        if (granted) {
          this._getLocation();
        }
      });
  }

  _getWeather = async (latitude, longitude) => {
    try {
      this.locationSubcribe();
      const {
        data: {
          main: {temp},
          sys: {country},
          weather,
        },
      } = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${WEATHER_API_KEY}&units=metric`,
      );

      this.setState({
        loading: false,
        country: country,
        temp,
        name: weatherOptions[weather[0].main].img,
      });
    } catch (e) {
      console.log('getWeather err: ', e);
    }
  };

  _getLocation = () => {
    try {
      this.locationSubcribe = RNLocation.subscribeToLocationUpdates(
        locations => {
          console.log(
            'lat, long: ',
            locations[0].latitude,
            locations[0].longitude,
          );
          this._getWeather(locations[0].latitude, locations[0].longitude);
        },
      );
    } catch (e) {
      console.log('getLocation err: ', e);
    }
  };

  render() {
    const {temp, name, country, loading} = this.state;
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.weather} onPress={this._getLocation}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <Image source={name} />
              <Text style={{fontSize: 18}}>{temp} ℃</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.txt}
          onPress={() => this.props.navigation.navigate('TextTranslator')}>
          <Text style={{color: 'gray', fontSize: 25}}>
            번역할 단어를 입력해주세요.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => this.props.navigation.navigate('CameraTranslator')}>
          <Image style={styles.icon} source={require('./images/camera.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.imageBtn}
          onPress={() => this.props.navigation.navigate('ImageTranslator')}>
          <Image style={styles.icon} source={require('./images/gallery.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={() => this.props.navigation.navigate('VoiceTranslator')}>
          <Image style={styles.icon} source={require('./images/mic.png')} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weather: {
    flex: 0.7,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  txt: {
    flex: 4,
    borderColor: 'gray',
    borderTopWidth: 0.7,
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: '#ff6347',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageBtn: {
    flex: 1,
    backgroundColor: '#ffdead',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  voiceBtn: {
    flex: 1,
    backgroundColor: '#87cefa',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
