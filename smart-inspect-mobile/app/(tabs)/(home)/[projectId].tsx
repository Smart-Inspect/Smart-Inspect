import InputField from '@/components/InputField';
import { ColorTypes, useColor } from '@/context/ColorContext';
import { useRequests } from '@/context/RequestsContext';
import { IBuilding, IInspection } from '@/utils/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';

export default function ProjectScreen() {
    const color = useColor();
    const styles = getStyles(color.getColors());
    const router = useRouter();
    const { projectId } = useLocalSearchParams();
    const { inspections, projects } = useRequests();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState<IBuilding>();
    const [assignedInspections, setAssignedInspections] = useState<IInspection[]>([]);
    const [filteredInspections, setFilteredInspections] = useState<IInspection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        const controller = new AbortController();
        viewProject(controller);
        viewAssignedInspections(controller);
        return () => {
            controller.abort();
        }
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredItems = assignedInspections.filter(item =>
            item.unit.number.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredInspections(filteredItems);
    }

    const viewProject = useCallback(async (abort: AbortController) => {
        if (!projectId) {
            return;
        }
        const result = await projects.view(projectId as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch project info');
            return;
        }
        setName(result.name);
        setDescription(result.description);
        setBuilding(result.building);
        console.log('Project info fetched successfully');
    }, []);

    const viewAssignedInspections = useCallback(async (abort?: AbortController) => {
        if (!projectId) {
            return;
        }
        const result = await inspections.viewAssigned(projectId as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch inspection info');
            return;
        }
        setAssignedInspections(result);
        setFilteredInspections(result);
        console.log('Assigned inspections info fetched successfully');
    }, []);

    const goToInspection = (inspection: IInspection) => {
        router.push({ pathname: 'inspection/[inspectionId]' as never, params: { inspectionId: inspection.id } });
    }

    useEffect(() => {
        const controller = new AbortController();
        viewProject(controller);
        viewAssignedInspections(controller);
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
                    { /* Project Info */}
                    <Text style={styles.header}>Project Info</Text>
                    <View style={styles.container}>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Name</Text>
                                <Text style={styles.entryText}>{name}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Description</Text>
                                <Text style={styles.entryText}>{description}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Building</Text>
                                <Text style={styles.entryText}>{building?.name}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Address</Text>
                                <Text style={styles.entryText}>{building?.address}</Text>
                            </View>
                        </View>
                    </View>
                    { /* Assigned Inspections */}
                    {assignedInspections?.length > 0 ?
                        <>
                            <Text style={{ ...styles.header, marginBottom: 10 }}>Assigned Inspections</Text>
                            <InputField
                                variant="secondary"
                                onChangeText={searchText => handleSearch(searchText)}
                                placeholder="Search by unit number..."
                                autoCapitalize="words"
                                style={styles.input}
                            />
                            <View style={styles.container}>
                                {assignedInspections.length > 0 && filteredInspections?.map((inspection, index) => (
                                    <TouchableOpacity key={index} style={{ ...styles.entryItem, borderBottomWidth: filteredInspections?.length === index + 1 ? 0 : 0.25 }} onPress={() => { goToInspection(inspection) }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Unit {inspection.unit?.number}</Text>
                                            <Text style={styles.entryText}>{inspection.inspectionDate ? inspection.inspectionDate.toLocaleString().split('T')[0] : "Needs Inspection"}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                        :
                        <Text style={styles.nothingFound}>No Inspections Assigned...</Text>
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
            fontSize: 16,
            fontFamily: 'Poppins-Light',
            alignSelf: 'flex-start',
            marginTop: 20,
            marginLeft: 5,
            color: color.textColor,
        },
        description: {
            marginTop: 10,
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
            marginLeft: 5,
            width: '95%'
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
            maxWidth: '70%'
        },
        input: {
            marginBottom: 10,
            width: '100%'
        },
    });
}