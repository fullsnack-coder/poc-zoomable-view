import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

// const defaultImageURI =
//   'https://images.pexels.com/photos/18175115/pexels-photo-18175115/free-photo-of-ojos.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

const secondImageURI =
  'https://images.pexels.com/photos/10859633/pexels-photo-10859633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

const {width, height} = Dimensions.get('window');

function App(): React.JSX.Element {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const savedFocalX = useSharedValue(0);
  const savedFocalY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const initialX = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = clamp(event.scale * savedScale.value, 1, 3);
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      savedFocalX.value = focalX.value;
      savedFocalY.value = focalY.value;
      savedScale.value = clamp(scale.value, 1, 3);
    });

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(event => {
      initialX.value = event.x;
      console.log(initialX.value);
    })
    .onUpdate(event => {
      focalX.value = savedFocalX.value + -event.translationX / scale.value;
      focalY.value = savedFocalY.value + -event.translationY / scale.value;
    })
    .onEnd(() => {
      focalX.value = clamp(focalX.value, 0, width * scale.value - width);
      focalY.value = clamp(focalY.value, 0, height * scale.value - height);

      savedFocalX.value = focalX.value;
      savedFocalY.value = focalY.value;
    });

  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(200)
    .onStart(event => {
      if (scale.value !== 1) {
        scale.value = 1;
        focalX.value = event.x;
        focalY.value = event.y;
        savedFocalX.value = focalX.value;
        savedFocalY.value = focalY.value;
        savedScale.value = 1;
      } else {
        scale.value = 3;
        focalX.value = event.x;
        focalY.value = event.y;
        savedFocalX.value = focalX.value;
        savedFocalY.value = focalY.value;
        savedScale.value = 3;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: withSpring(focalX.value, {duration: 250})},
        {translateY: withSpring(focalY.value, {duration: 250})},
        {translateX: withSpring(-width / 2, {duration: 250})},
        {translateY: withSpring(-height / 2, {duration: 250})},
        {scale: withSpring(scale.value, {duration: 250})},
        {translateX: withSpring(-focalX.value, {duration: 250})},
        {translateY: withSpring(-focalY.value, {duration: 250})},
        {translateX: withSpring(width / 2, {duration: 250})},
        {translateY: withSpring(height / 2, {duration: 250})},
      ],
    };
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{flex: 1, flexGrow: 1}}>
        <GestureHandlerRootView style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#080808',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <GestureDetector
              gesture={Gesture.Race(pinchGesture, panGesture, tapGesture)}>
              <Animated.Image
                style={[{width, height, objectFit: 'cover'}, animatedStyle]}
                source={{uri: secondImageURI}}
              />
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
