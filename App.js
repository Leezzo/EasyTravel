import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import SplashScreen from 'react-native-splash-screen'

import HomeScreen from './screens/Home';
import TextTranslator from './screens/TextTranslator';
import VoiceTranslator from "./screens/VoiceTranslator";
import ImageTranslator from "./screens/ImageTranslator";
import CameraTranslator from "./screens/CameraTranslator"

const MainNavigator = createStackNavigator({
    Home:  HomeScreen,
    TextTranslator: TextTranslator,
    VoiceTranslator: VoiceTranslator,
    ImageTranslator: ImageTranslator,
    CameraTranslator: CameraTranslator,
  }, {headerLayoutPreset: 'center'});


const AppContainer = createAppContainer(MainNavigator);

export default class App extends Component {
    componentDidMount() {
        setTimeout(() => {
            SplashScreen.hide();
        }, 1000);
    }

    render() {
    return <AppContainer />;
  }
}

