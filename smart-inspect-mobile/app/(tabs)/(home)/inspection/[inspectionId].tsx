import Button from '@/components/Button';
import { ColorTypes, useColor } from '@/context/ColorContext';
import { useRequests } from '@/context/RequestsContext';
import { IProject, IUnit } from '@/utils/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, RefreshControl } from 'react-native';

export default function InspectionScreen() {
    const color = useColor();
    const styles = getStyles(color.getColors());
    const router = useRouter();
    const { inspectionId } = useLocalSearchParams();
    const { inspections } = useRequests();
    const [unit, setUnit] = useState<IUnit>();
    const [inspectionDate, setInspectionDate] = useState<string>('Needs Inspection');
    const [project, setProject] = useState<IProject>();
    const [status, setStatus] = useState<'completed' | 'started' | 'not-started'>();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        const controller = new AbortController();
        fetchInspectionInfo(controller);
        return () => {
            controller.abort();
        }
    }, []);

    const fetchInspectionInfo = useCallback(async (abort?: AbortController) => {
        if (!inspectionId) {
            return;
        }
        const result = await inspections.view(inspectionId as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch inspection info');
            return;
        }
        setUnit(result.unit);
        if (result.inspectionDate) {
            setInspectionDate(new Date(parseInt(result.inspectionDate)).toLocaleString());
        }
        setProject(result.project);
        setStatus(result.status);
        console.log('Inspections info fetched successfully');
    }, []);

    const goToStartInspection = async () => {
        if (status === 'completed') {
            console.log('Inspection is already completed. THIS SHOULD NEVER RUN');
            return;
        }
        if (status === 'not-started' && !await inspections.edit(inspectionId as string, new Date(), undefined, undefined, undefined, 'started')) {
            console.log('Failed to update inspection status');
            return;
        }
        setStatus('started');
        router.push({ pathname: 'inspection/start/[inspectionId]' as never, params: { inspectionId } });
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchInspectionInfo(controller);
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
                    { /* Inspection Info */}
                    <Text style={styles.header}>Inspection Info</Text>
                    <View style={styles.container}>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Unit Number</Text>
                                <Text style={styles.entryText}>{unit?.number}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Inspect Date</Text>
                                <Text style={styles.entryText}>{inspectionDate}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Project</Text>
                                <Text style={styles.entryText}>{project?.name}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Status</Text>
                                <Text style={styles.entryText}>{status === 'not-started' ? "Not Started" : status === 'started' ? "Started" : "Completed"}</Text>
                            </View>
                        </View>
                    </View>
                    { /* Inspection Actions */}
                    {status === 'not-started' || status === 'started' ?
                        <Button
                            variant='warning'
                            text={status === 'not-started' ? 'Start Inspection' : "Resume Inspection"}
                            onPress={goToStartInspection}
                            style={{ marginTop: 50, width: '75%', minWidth: 200, height: 50, justifyContent: 'center', alignSelf: 'center' }}
                        />
                        :
                        <Text style={styles.nothingFound}>Inspection Completed</Text>
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
    });
}