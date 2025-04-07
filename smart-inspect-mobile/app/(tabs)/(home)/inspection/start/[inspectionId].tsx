import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ColorTypes, useColor } from '@/context/ColorContext';
import Button from '@/components/Button';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as FileSystem from "expo-file-system";
import { useRequests } from '@/context/RequestsContext';
import { IImage, IMetric, IMetricsSchema, IProject, IUnit } from '@/utils/types';
import Popup from '@/components/Popup';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import MiIcon from 'react-native-vector-icons/MaterialIcons';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import * as ImagePicker from 'expo-image-picker';
import InputField from '@/components/InputField';
import { useAuth } from '@/context/AuthContext';

export default function StartInspectionScreen() {
    const color = useColor();
    const styles = getStyles(color.getColors());
    const { inspectionId } = useLocalSearchParams();
    const { inspections, projects } = useRequests();
    const auth = useAuth();
    const [unit, setUnit] = useState<IUnit>();
    const [inspectionDate, setInspectionDate] = useState<Date>();
    const [project, setProject] = useState<IProject>();
    const [selectedLayout, setSelectedLayout] = useState<IImage>();
    const [displayedLayoutUri, setDisplayedLayoutUri] = useState<string | null>(null);
    const [layouts, setLayouts] = useState<IImage[]>([]);
    const [metricsList, setMetricsList] = useState<IMetric[]>([]);
    const [metricsSchemaList, setMetricsSchemaList] = useState<IMetricsSchema[]>([]);
    const [currentMetricSchema, setCurrentMetricSchema] = useState<IMetricsSchema>();
    const [status, setStatus] = useState<'completed' | 'started' | 'not-started'>('started');
    const [notes, setNotes] = useState<string>();
    const [layoutLoaded, setLayoutLoaded] = useState(false);
    const [layoutsLoaded, setLayoutsLoaded] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<IImage>();
    const [selectedPhotoCaption, setSelectedPhotoCaption] = useState<string>();
    const [selectedPhotoCaptionFieldEmpty, setSelectedPhotoCaptionFieldEmpty] = useState<boolean>();
    const [inLayoutSelectMode, setInLayoutSelectMode] = useState(false);
    const [inPhotoUploadMode, setInPhotoUploadMode] = useState(false);
    const [inMetricSelectMode, setInMetricSelectMode] = useState(false);
    const [completeInspectionPopupVisible, setCompleteInspectionPopupVisible] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const navigation = useNavigation();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = ["25%", '50%', "79%"];

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
            setInspectionDate(new Date(parseInt(result.inspectionDate)));
        }
        setProject(result.project);
        setStatus(result.status);
        setMetricsList(result.metrics);
        setMetricsSchemaList(result.project.metricsSchema);
        setNotes(result.notes);
        if (result.layout) {
            const layout = (await downloadLayouts([result.layout as IImage], 'inspection', abort) as IImage[])[0] as IImage;
            setSelectedLayout(layout);
        }
        setLayoutLoaded(true);
        console.log('Inspections info fetched successfully');
    }, []);

    const downloadLayouts = async (layouts: IImage[], type: 'project' | 'inspection', abort?: AbortController) => {
        let updatedLayouts: IImage[] | undefined = undefined;
        updatedLayouts = [...layouts]; // Copy layouts to modify them
        for (let i = 0; i < layouts.length; i++) {
            const imgResult = type === 'project' ? await projects.downloadLayout((project as IProject).id, layouts[i].id as string, abort) : await inspections.downloadLayout(inspectionId as string, abort);
            if (imgResult === 'abort') {
                return;
            }
            if (imgResult === 'fail') {
                console.log('Failed to fetch layouts');
                return;
            }
            if (!FileSystem.documentDirectory) {
                console.error('FileSystem.documentDirectory is null');
                return;
            }

            const fileUri = FileSystem.documentDirectory + (inspectionDate ? inspectionDate.getTime() : 'unknown') + '-' + layouts[i].name;

            await new Promise<void>((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = async () => {
                    try {
                        if (!FileSystem.documentDirectory) {
                            throw new Error('FileSystem.documentDirectory is null');
                        }
                        await FileSystem.writeAsStringAsync(fileUri, (fr.result as string).split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
                        (updatedLayouts as IImage[])[i].url = fileUri;
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                fr.onerror = reject;
                fr.readAsDataURL(imgResult);
            });
        }
        console.log('Layout(s) loaded successfully');
        if (type === 'project') {
            setLayoutsLoaded(true);
        } else {
            setDisplayedLayoutUri(updatedLayouts[0].url);
        }
        return updatedLayouts;
    }

    const editInspection = async (editedLayoutId: string | undefined, editedMetrics: IMetric[] | undefined, editedNotes: string | undefined, editedStatus: 'completed' | 'started' | 'not-started' | undefined, abort?: AbortController) => {
        if (!inspectionId) {
            return;
        }
        const result = await inspections.edit(inspectionId as string, inspectionDate as Date, editedLayoutId ?? undefined, editedMetrics, editedNotes, editedStatus ?? undefined, abort);
        if (!result) {
            console.log('Failed to edit inspection');
            Alert.alert('Error', 'Failed to edit inspection.');
            return false;
        }
        console.log('Inspection edited successfully');
        if (editedLayoutId) {
            setSelectedLayout(layouts.find(layout => layout.id === editedLayoutId));
        }
        if (editedMetrics) {
            setMetricsList(editedMetrics as IMetric[]);
        }
        if (editedNotes) {
            setNotes(editedNotes);
        }
        if (editedStatus) {
            setStatus(editedStatus);
            if (editedStatus === 'completed') {
                Alert.alert('Success', 'Inspection completed successfully.');
                navigation.reset({ index: 0, routes: [{ name: 'index' as never }] });
            }
        }
        return true;
    };

    const updateLayouts = async (url: string, layoutId: string) => {
        setDisplayedLayoutUri(url);
        setInLayoutSelectMode(false);
        await editInspection(layoutId, undefined, undefined, undefined);
    }

    const updateMetric = async (name: string, value: string) => {
        const updatedMetricsList = [...metricsList];
        updatedMetricsList[metricsSchemaList.indexOf(currentMetricSchema as IMetricsSchema)] = { name, value };
        setInMetricSelectMode(false);
        await editInspection(undefined, updatedMetricsList, undefined, undefined);
    }

    const uploadPhoto = async () => {
        if (selectedPhoto && selectedPhotoCaption) {
            setUploadingPhoto(true);
            console.log('Uploading photo');
            const formData = new FormData();
            formData.append('files', {
                uri: selectedPhoto.url,
                name: selectedPhoto.name,
                type: selectedPhoto.type,
            } as any);
            formData.append('uploadCount', '1');
            const timestamps = Array.from([selectedPhoto]).map(() => selectedPhoto.timestamp.toISOString());
            formData.append('timestamps', JSON.stringify(timestamps));
            const captions = Array.from([selectedPhotoCaption]).map(() => selectedPhotoCaption);
            formData.append('captions', JSON.stringify(captions));

            const uploadResult = await inspections.uploadPhoto(inspectionId as string, formData);
            if (!uploadResult) {
                console.log('Failed to upload photo');
                Alert.alert('Error', 'Failed to upload photo.');
            } else {
                console.log('Photo uploaded successfully');
                Alert.alert('Success', 'Photo uploaded successfully.');
            }

            setSelectedPhoto(undefined);
            setSelectedPhotoCaption(undefined);
            setSelectedPhotoCaptionFieldEmpty(false);
            setInPhotoUploadMode(false);
            setUploadingPhoto(false);
        } else {
            setSelectedPhotoCaptionFieldEmpty(true);
        }
    }

    const openLayoutSelect = async () => {
        setInLayoutSelectMode(true);
        if (!layoutsLoaded && project?.layouts) {
            setLayouts(await downloadLayouts(project?.layouts, 'project') as IImage[]);
        }
    }

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera access is needed to take photos.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            const fileExtension = result.assets[0].uri.split('.').pop();
            setSelectedPhoto({
                id: undefined,
                uploader: undefined,
                caption: undefined,
                uploadedAt: undefined,
                name: `PHOTO-${auth.id}-${inspectionId}.${fileExtension}`,
                url: result.assets[0].uri,
                type: fileExtension === 'jpg' ? 'image/jpeg' : fileExtension === 'png' ? 'image/png' : 'image/jpeg',
                timestamp: new Date()
            });
            setSelectedPhotoCaption('');
            setSelectedPhotoCaptionFieldEmpty(false);
            setInPhotoUploadMode(true);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchInspectionInfo(controller);
        return () => {
            controller.abort();
        }
    }, []);

    return (
        <View style={styles.background}>
            <GestureHandlerRootView>
                { /* Layout Select Popup */}
                <Popup animationType="none" transparent={true} visible={inLayoutSelectMode} style={{ width: '85%', height: '70%' }} onRequestClose={() => setInLayoutSelectMode(false)}>
                    <View style={{ width: '100%', height: '100%' }}>
                        <TouchableOpacity onPress={() => setInLayoutSelectMode(false)} style={{ position: 'absolute', top: 5, right: 5, zIndex: 1, width: 30, height: 30 }}>
                            <FaIcon name="close" size={30} style={{ alignSelf: 'center' }} color={color.getColors().buttonSecondary} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 28, fontFamily: 'Poppins', textAlign: 'left', marginBottom: 20, color: color.getColors().textColor }}>Select Layout</Text>
                        <ScrollView>
                            {(!layouts || layouts?.length === 0) && <Text style={{ fontSize: 18, color: color.getColors().textColor }}>{layoutsLoaded ? "No layouts uploaded" : "Loading..."}</Text>}
                            <View style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 20 }}>
                                {layouts?.map(({ url }, index) => (
                                    <TouchableOpacity key={index} style={{ marginBottom: 20, padding: 10, borderColor: color.getColors().borderColor, borderWidth: 0.5 }} onPress={() => {
                                        updateLayouts(url, layouts[index].id as string);
                                    }}>
                                        <Text style={styles.layoutText}>Layout {index + 1}</Text>
                                        <Image source={{ uri: url }} style={{ width: 280, height: 280, resizeMode: 'contain', alignSelf: 'center' }} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </Popup>
                {/* Photo Upload Popup */}
                <Popup animationType="none" transparent={true} visible={inPhotoUploadMode} style={{ width: '85%', height: '64%' }} onRequestClose={() => setInPhotoUploadMode(false)}>
                    <View style={{ width: '100%', height: '100%' }}>
                        <TouchableOpacity onPress={() => setInPhotoUploadMode(false)} style={{ position: 'absolute', top: 5, right: 5, zIndex: 1, width: 30, height: 30 }}>
                            <FaIcon name="close" size={30} style={{ alignSelf: 'center' }} color={color.getColors().buttonSecondary} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 28, fontFamily: 'Poppins', textAlign: 'left', marginBottom: 20, color: color.getColors().textColor }}>Upload Photo</Text>
                        <View style={{ marginBottom: 20, display: 'flex' }}>
                            <Image source={{ uri: selectedPhoto?.url }} style={{ width: 300, height: 300, resizeMode: 'contain', alignSelf: 'center' }} />
                        </View>
                        <InputField
                            variant="secondary"
                            onChangeText={selectedPhotoCaption => setSelectedPhotoCaption(selectedPhotoCaption)}
                            placeholder="Enter caption for photo..."
                            autoCapitalize="sentences"
                            value={selectedPhotoCaption}
                            style={styles.input}
                        />
                        <Text style={styles.requiredField}>{selectedPhotoCaptionFieldEmpty ? 'Please enter a caption for the photo' : ''}</Text>
                        <Button variant="secondary" text="Upload Photo" disabled={uploadingPhoto} style={{ marginTop: 20, width: 150, alignSelf: 'center' }} onPress={uploadPhoto} />
                    </View>
                </Popup>
                {/* Metric Select Popup */}
                <Popup animationType="none" transparent={true} visible={inMetricSelectMode} style={{ width: '85%', height: '50%' }} onRequestClose={() => setInMetricSelectMode(false)}>
                    <View style={{ width: '100%', height: '100%' }}>
                        <TouchableOpacity onPress={() => setInMetricSelectMode(false)} style={{ position: 'absolute', top: 5, right: 5, zIndex: 1, width: 30, height: 30 }}>
                            <FaIcon name="close" size={30} style={{ alignSelf: 'center' }} color={color.getColors().buttonSecondary} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 28, fontFamily: 'Poppins', textAlign: 'left', marginBottom: 20, color: color.getColors().textColor }}>{currentMetricSchema?.name}</Text>
                        <ScrollView>
                            {currentMetricSchema?.values?.map((option, index) => (
                                <View key={index} style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                    <TouchableOpacity style={styles.dropDownContainer} onPress={() => {
                                        updateMetric(currentMetricSchema?.name as string, option as string);
                                    }}>
                                        <View style={styles.entryTextContainer}>
                                            <Text style={styles.entryText}>{typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option}</Text>
                                        </View>
                                        <MiIcon name={metricsList[metricsSchemaList.indexOf(currentMetricSchema as IMetricsSchema)]?.value === option ? 'radio-button-on' : 'radio-button-off'} size={25} color={color.getColors().iconColor} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </Popup>
                {/* Complete Inspection Popup */}
                <Popup animationType="none" transparent={true} visible={completeInspectionPopupVisible} onRequestClose={() => setCompleteInspectionPopupVisible(false)}>
                    <View style={{ width: 300 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Poppins', color: color.getColors().textColor }}>Are you sure you want to complete this inspection?</Text>
                        <Text style={{ fontSize: 18, fontFamily: 'Poppins', color: color.getColors().textDanger, marginTop: 5 }}>NOTE: This cannot be reversed.</Text>
                        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                            <Button variant="secondary" text="Yes" onPress={() => { editInspection(undefined, undefined, undefined, 'completed'); setCompleteInspectionPopupVisible(false); }} style={{ width: 75 }} />
                            <Button variant="secondary" text="No" onPress={() => setCompleteInspectionPopupVisible(false)} style={{ width: 75 }} />
                        </View>
                    </View>
                </Popup>
                {/* Main Part of the Screen */}
                <View style={styles.topBar}>
                    <View style={{ display: 'flex', flexDirection: 'column', marginHorizontal: 20 }}>
                        <Text style={styles.header}>{project?.name}</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 5 }}>
                            <Text style={styles.description}>Unit: {unit?.number}</Text>
                            <Text style={styles.description}>Date: {inspectionDate ? inspectionDate.toLocaleString() : 'Invalid Date'}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginTop: 15, marginBottom: 15 }}>
                            <Button variant="secondary" text="Select Layout" style={{ width: 150 }} onPress={openLayoutSelect} />
                            <Button variant="secondary" text="Upload Image" style={{ width: 150 }} onPress={openCamera} />
                        </View>
                    </View>
                </View>
                <View style={styles.topView}>
                    {
                        displayedLayoutUri ?
                            <ReactNativeZoomableView
                                maxZoom={8}
                                minZoom={0.5}
                                zoomStep={0.5}
                                initialZoom={1}
                                bindToBorders={true}
                            >
                                <Image
                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                    source={{ uri: displayedLayoutUri }}
                                />
                            </ReactNativeZoomableView>
                            :
                            <Text style={styles.nothingFound}>{layoutLoaded ? 'Please Select a Layout for this Inspection' : 'Loading...'}</Text>
                    }
                </View>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    style={{ padding: 0, backgroundColor: color.getColors().foregroundColor }}
                    backgroundStyle={{ backgroundColor: color.getColors().foregroundColor }}
                    handleIndicatorStyle={{ backgroundColor: color.getColors().borderColor }}
                >
                    <BottomSheetScrollView style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                        <Text style={styles.metricsHeader}>Metrics</Text>
                        <View style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
                            {metricsSchemaList.map((metric, index) => (
                                <View key={index} style={styles.entryItem}>
                                    <View style={styles.entryContainer}>
                                        <Text style={styles.entryText}>{metric.name}</Text>
                                        <TouchableOpacity style={styles.dropDown} onPress={() => {
                                            setInMetricSelectMode(true);
                                            setCurrentMetricSchema(metric);
                                        }}>
                                            <Text style={styles.dropDownText}>{metricsList[index]?.value ? typeof metricsList[index].value === 'string' ? metricsList[index].value.charAt(0).toUpperCase() + metricsList[index].value.slice(1) : metricsList[index].value : 'Select...'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={{ marginTop: 40 }}>
                            <Text style={styles.notesHeader}>Final Notes</Text>
                            <InputField
                                variant="secondary"
                                onChangeText={notes => setNotes(notes)}
                                onEndEditing={(e) => editInspection(undefined, undefined, e.nativeEvent.text, undefined)}
                                placeholder="Enter final notes for inspection..."
                                autoCapitalize="sentences"
                                value={notes}
                                style={styles.input}
                            />
                        </View>
                        <Button
                            variant="danger"
                            text="Complete Inspection"
                            onPress={() => setCompleteInspectionPopupVisible(true)}
                            style={{ marginTop: 30, width: 200, alignSelf: 'center' }}
                        />
                    </BottomSheetScrollView>
                </BottomSheet>
            </GestureHandlerRootView>
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
            width: '100%',
            height: '70%',
            alignSelf: 'center',
        },
        topBar: {
            backgroundColor: color.foregroundColor,
        },
        container: {
            flex: 1,
            backgroundColor: color.backgroundColor,
        },
        header: {
            marginTop: 10,
            fontSize: 24,
            fontFamily: 'Poppins-Medium',
            alignSelf: 'flex-start',
            color: color.textColor,
        },
        metricsHeader: {
            fontSize: 20,
            fontFamily: 'Poppins-Medium',
            alignSelf: 'center',
            color: color.textColor,
        },
        description: {
            fontSize: 16,
            color: color.textColor,
            fontFamily: 'Poppins-Light'
        },
        layoutText: {
            fontSize: 18,
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
            marginBottom: 5
        },
        nothingFound: {
            marginTop: 80,
            textAlign: 'center',
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
            fontSize: 20,
            width: '100%'
        },
        entryItem: {
            borderBottomColor: color.borderColor,
            flexDirection: 'row'
        },
        entryContainer: {
            width: '100%',
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        entryTextContainer: {
            flexDirection: 'row',
            gap: 10,
        },
        entryText: {
            color: color.textColor,
            fontFamily: 'Poppins',
            fontSize: 18
        },
        requiredField: {
            color: color.textDanger,
            marginTop: 0,
            fontFamily: 'Poppins-Light'
        },
        bottomSheetContainer: {
            flex: 1,
            backgroundColor: color.foregroundColor,
        },
        bottomSheetContentContainer: {
            flex: 1,
            padding: 36,
            alignItems: 'center',
        },
        input: {
            marginBottom: 0,
            minWidth: 200
        },
        dropDown: {
            backgroundColor: color.foregroundColor,
            borderWidth: 0.5,
            borderColor: color.borderColor,
            borderRadius: 10,
            width: '50%',
            justifyContent: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5
        },
        dropDownText: {
            textAlign: 'right',
            color: color.textColor,
            fontFamily: 'Poppins-Light',
            fontSize: 16,
        },
        dropDownContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: 12,
        },
        notesHeader: {
            fontSize: 20,
            fontFamily: 'Poppins-Medium',
            alignSelf: 'center',
            color: color.textColor,
        }
    });
}