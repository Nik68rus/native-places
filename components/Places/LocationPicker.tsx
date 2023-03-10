import { Alert, Image, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import OutlinedButton from '../ui/OutlinedButton';
import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
} from 'expo-location';
import { useEffect, useState } from 'react';
import { ICoords, RootStackParamList } from '../../types';
import { getAddress, getMapPreview } from '../../util/location';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddScreenRouteProp = RouteProp<RootStackParamList, 'AddPlace'>;

interface Props {
  onPickLocation: (location: ICoords, address: string) => void;
}

const LocationPicker = ({ onPickLocation }: Props) => {
  const [pickedLocation, setPickedLocation] = useState<ICoords>();
  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddScreenRouteProp>();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (route.params && route.params.pickedLocation && isFocused) {
      setPickedLocation({
        lat: route.params.pickedLocation.latitude,
        lng: route.params.pickedLocation.longitude,
      });
    }
  }, [route.params, isFocused]);

  const verifyPermissions = async () => {
    if (
      locationPermissionInformation.status === PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert('Not allowed!', 'You need to grant permission to the app!');
      return false;
    }

    return true;
  };

  const getLocationHandler = async () => {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const location = await getCurrentPositionAsync();
    setPickedLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  };

  const pickOnMapHandler = () => {
    navigation.navigate('Map');
  };

  useEffect(() => {
    const handleLocation = async () => {
      if (pickedLocation) {
        const address = await getAddress(pickedLocation);
        onPickLocation(pickedLocation, address.formatted);
      }
    };

    handleLocation();
  }, [pickedLocation, onPickLocation]);

  return (
    <View>
      <View style={styles.mapPreview}>
        {pickedLocation ? (
          <Image
            style={styles.image}
            source={{ uri: getMapPreview(pickedLocation) }}
          />
        ) : (
          <Text>No location picked yet!</Text>
        )}
      </View>
      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Locate user
        </OutlinedButton>
        <OutlinedButton icon="map" onPress={pickOnMapHandler}>
          Pick on map
        </OutlinedButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapPreview: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default LocationPicker;
