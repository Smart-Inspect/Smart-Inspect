import InputField from '@/components/InputField';
import { ColorTypes, useColor } from '@/context/ColorContext';
import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
    const color = useColor();
    const styles = getStyles(color.getColors());

    const data = [
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
        { id: '3', name: 'Orange' },
        { id: '4', name: 'Mango' },
        { id: '5', name: 'Grapes' },
        { id: '6', name: 'Pineapple' },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    // Function to filter data based on search input
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredItems = data.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredData(filteredItems);
    };

    return (
        <View style={styles.background}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }}
            />
            <View style={styles.container}>
                { /* Search Bar */}
                <View style={{ position: 'absolute', top: 70, left: 10, right: 10 }}>
                    <InputField
                        variant="secondary"
                        onChangeText={handleSearch}
                        placeholder="Search projects..."
                        keyboardType="default"
                        autoCapitalize="sentences"
                    />
                </View>

                { /* Sliding Panel */}
                <GestureHandlerRootView style={styles.panelContainer}>
                    <PanGestureHandler>
                        <View style={[styles.panel, { height: '50%' }]}>
                            <View style={styles.panelHeader}>
                                <Text style={styles.panelTitle}>Information</Text>
                            </View>
                            <View style={styles.panelContent}>
                                <Text style={styles.panelText}>This is the panel content</Text>
                            </View>
                        </View>
                    </PanGestureHandler>
                </GestureHandlerRootView>
            </View>
        </View>
    )
}

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
        background: {
            backgroundColor: color.background,
            width: '100%',
            height: '100%'
        },
        container: {
            //flex: 1,
            paddingTop: 50,
            zIndex: 1
        },
        panel: {
            backgroundColor: color.foreground,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            width: '100%',
            transitionDelay: '0.5s',
            transitionProperty: 'ease',
            transitionDuration: '0.5s',
        },
        panelContainer: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            zIndex: 1
        },
        panelHeader: {
            padding: 15,
            backgroundColor: '#f2f2f2',
        },
        panelTitle: {
            fontSize: 18,
            fontFamily: 'Poppins-Medium',
            color: '#053331'
        },
        panelContent: {
            padding: 20,
        },
        panelText: {
            fontSize: 16,
            fontFamily: 'Poppins-Light',
            color: '#053331'
        },
        /*title: {
            fontSize: 28,
            fontFamily: 'Poppins-Medium',
            alignSelf: 'center',
            color: '#053331',
            minWidth: 250,
            minHeight: 40
        },
        descripton: {
            fontSize: 16,
            fontFamily: 'Poppins-Light',
            alignSelf: 'center',
            color: '#053331',
            minWidth: 255,
            minHeight: 25,
            marginBottom: 10
        },*/
        map: {
            width: '100%',
            height: '100%',
            position: 'absolute',
        }
    });
}


/*

<Text style={styles.title}>Assigned Projects</Text>
                <Text style={styles.descripton}>Please select applicable project</Text>

                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name='map-marker-outline' size={35} style={{ marginRight: 10 }} />
                                <Text style={{ padding: 10, color: '#053331', fontFamily: 'Poppins-Light', fontSize: 16 }}>
                                    {item.name}
                                </Text>
                            </View>
                        </View>
                    )}
                />

*/