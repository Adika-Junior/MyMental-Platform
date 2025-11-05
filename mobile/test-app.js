import { registerRootComponent } from 'expo';
import { View, Text } from 'react-native';

function TestApp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0891b2' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>MyMental Loading...</Text>
    </View>
  );
}

registerRootComponent(TestApp);
