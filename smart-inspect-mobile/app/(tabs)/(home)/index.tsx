import { ColorTypes, useColor } from '@/context/ColorContext';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { IProject, IUser } from '@/utils/types';
import InputField from '@/components/InputField';
import { useRouter } from 'expo-router';
import { useRequests } from '@/context/RequestsContext';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
    const color = useColor();
    const styles = getStyles(color.getColors());
    const router = useRouter();
    const auth = useAuth();
    const { projects, users } = useRequests();
    const [user, setUser] = useState<IUser>();
    const [assignedProjects, setAssignedProjects] = useState<IProject[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<IProject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        const controller = new AbortController();
        fetchProjectInfo(controller);
        fetchProfileInfo(controller);
        return () => {
            controller.abort();
        }
    }, []);


    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredItems = assignedProjects.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) || item.building.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProjects(filteredItems);
    }

    function goToProject(project: IProject) {
        router.push({ pathname: '[projectId]' as never, params: { projectId: project.id } });
    }

    const fetchProjectInfo = useCallback(async (abort: AbortController) => {
        const result = await projects.viewAssigned(abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch project info');
            return;
        }
        setAssignedProjects(result);
        setFilteredProjects(result);
        console.log('Assigned project info fetched successfully');
    }, []);

    const fetchProfileInfo = useCallback(async (abort?: AbortController) => {
        const result = await users.view(auth.id as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch user info');
            return;
        }
        setUser(result);
        console.log('User info fetched successfully');
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchProjectInfo(controller);
        fetchProfileInfo(controller);
        return () => {
            controller.abort();
        }
    }, []);

    return (
        <View style={styles.background}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                { /* Page Content */}
                <View style={styles.topView}>
                    { /* Projects List */}
                    <Text style={styles.header}>Welcome, {user?.firstName} {user?.lastName}</Text>
                    <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 10, marginBottom: 20 }}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Assigned Projects</Text>
                            <Text style={styles.cardValue}>{assignedProjects.length}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Filtered Projects</Text>
                            <Text style={styles.cardValue}>{filteredProjects.length}</Text>
                        </View>
                    </View>
                    {filteredProjects?.length > 0 ?
                        <>
                            <InputField
                                variant="secondary"
                                onChangeText={searchText => handleSearch(searchText)}
                                placeholder="Search for project..."
                                autoCapitalize="words"
                                style={styles.input}
                            />
                            <View style={styles.container}>
                                {filteredProjects.length > 0 && filteredProjects?.map((project, index) => (
                                    <TouchableOpacity key={index} style={{ ...styles.entryItem, borderBottomWidth: filteredProjects.length === index + 1 ? 0 : 0.25 }} onPress={() => goToProject(project)}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>{project.name}</Text>
                                            <Text style={styles.entryText}>{project.building.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                        :
                        <Text style={styles.nothingFound}>No Assigned Projects...</Text>
                    }
                </View>
            </ScrollView>
        </View>
    );
}

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
        background: {
            backgroundColor: color.backgroundColor,
            width: '100%',
            height: '100%',
        },
        topView: {
            display: 'flex',
            width: '85%',
            alignSelf: 'center',
        },
        container: {
            marginTop: 10,
            marginBottom: 20,
            backgroundColor: color.foregroundColor,
            borderWidth: 0.5,
            borderColor: color.borderColor,
            borderRadius: 10,
            width: '100%'
        },
        header: {
            fontSize: 24,
            width: '100%',
            marginTop: 30,
            height: 50,
            fontFamily: 'Poppins-Light',
            alignSelf: 'flex-start',
            marginLeft: 5,
            color: color.textColor,
        },
        nothingFound: {
            marginTop: 50,
            height: 50,
            textAlign: 'center',
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
            fontSize: 18,
            width: '100%'
        },
        entryItem: {
            borderBottomColor: color.borderColor,
            flexDirection: 'row',
        },
        entryContainer: {
            width: '100%',
            height: '100%',
            padding: 20,
            borderColor: color.borderColor,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
        },
        entryText: {
            color: color.textColor,
            fontFamily: 'Poppins',
            fontSize: 16,
            maxWidth: '50%'
        },
        input: {
            marginBottom: 10,
            width: '100%'
        },
        card: {
            backgroundColor: color.foregroundColor,
            borderWidth: 0.5,
            borderColor: color.borderColor,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            width: 140,
            height: 120,
        },
        cardTitle: {
            fontSize: 16,
            width: '100%',
            paddingLeft: 5,
            paddingRight: 5,
            marginBottom: -15,
            height: 55,
            textAlign: 'center',
            color: color.textColor,
            fontFamily: 'Poppins-SemiBold',
        },
        cardValue: {
            fontSize: 32,
            height: 40,
            color: color.textColor,
            fontFamily: 'Poppins-ExtraLight',
        }
    });
}