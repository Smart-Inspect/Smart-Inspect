import InputField from '@/components/InputField';
import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DashboardScreen() {

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
        <View style={styles.container}>
            <InputField
                variant="secondary"
                onChangeText={handleSearch}
                placeholder="Search projects..."
                keyboardType="default"
                autoCapitalize="sentences"
                style={{ marginTop: 10, marginHorizontal: 10, marginBottom: 10 }}
            />

            <Text style={styles.title}>Assigned Projects</Text>
            <Text style={styles.descripton}>Please select applicable project</Text>

            <MapView style={styles.map} />

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
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //paddingTop: 50,
        backgroundColor: '#fff',
    },
    title: {
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
    },
    map: {
        width: '100%',
        height: '40%'
    }
});
