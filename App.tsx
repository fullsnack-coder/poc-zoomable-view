import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {StatusBar, View, useWindowDimensions} from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

// const defaultImageURI =
//   'https://images.pexels.com/photos/18175115/pexels-photo-18175115/free-photo-of-ojos.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

const secondImageURI =
  'https://e0.pxfuel.com/wallpapers/705/509/desktop-wallpaper-city-pop-aesthetic-skyline.jpg';

function App(): React.JSX.Element {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const {width, height} = useWindowDimensions();

  const savedFocalX = useSharedValue(0);
  const savedFocalY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = clamp(event.scale * savedScale.value, 1, 3);
      focalX.value = event.focalX;
      focalY.value = event.focalY;

      savedFocalX.value = focalX.value;
      savedFocalY.value = focalY.value;
    })
    .onEnd(() => {
      savedScale.value = clamp(scale.value, 1, 3);
    });

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate(event => {
      focalX.value = savedFocalX.value + -event.translationX / scale.value;
      focalY.value = savedFocalY.value + -event.translationY / scale.value;
    })
    .onEnd(() => {
      focalX.value = clamp(focalX.value, 0, width);
      focalY.value = clamp(focalY.value, 0, height);
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
        {translateX: withSpring(focalX.value, {duration: 400})},
        {translateY: withSpring(focalY.value, {duration: 400})},
        {translateX: withSpring(-width / 2, {duration: 400})},
        {translateY: withSpring(-height / 2, {duration: 400})},
        // scale smoothly
        {scale: withSpring(scale.value, {duration: 400})},
        {translateX: withSpring(-focalX.value, {duration: 400})},
        {translateY: withSpring(-focalY.value, {duration: 400})},
        {translateX: withSpring(width / 2, {duration: 400})},
        {translateY: withSpring(height / 2, {duration: 400})},
      ],
    };
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: '#080808'}}>
          <GestureDetector
            gesture={Gesture.Race(pinchGesture, panGesture, tapGesture)}>
            <Animated.View
              style={[
                {
                  flex: 1,
                  backgroundColor: '#080808',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                animatedStyle,
              ]}>
              <Animated.Image
                style={[{width, height, objectFit: 'cover'}]}
                source={{uri: secondImageURI}}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </>
  );
}

export default App;
