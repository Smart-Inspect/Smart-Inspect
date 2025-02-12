import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FaPlay, FaStop } from "react-icons/fa";
import Input from '../../components/Input/Input';
import { useRequests } from '../../context/RequestsContext';
import { IBuilding, IImage, IInspection, IMetricsSchema, IUnit, IUser } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Project() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { users, projects, inspections } = useRequests();
    const [inEditMode, setInEditMode] = useState(false);
    const [engineerList, setEngineerList] = useState<IUser[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState<IBuilding>();
    const [assignedEngineers, setAssignedEngineers] = useState<{ engineerId: string, unitNumbers: number[], unitSchema: string }[]>([]);
    const [layouts, setLayouts] = useState<IImage[]>([]);
    const [units, setUnits] = useState<IUnit[]>([]);
    const [inspectionsList, setInspectionsList] = useState<IInspection[]>([]);
    const [filteredInspectionsList, setFilteredInspectionsList] = useState<IInspection[]>([]);
    const [layoutsLoaded, setLayoutsLoaded] = useState(false);
    const [editLayouts, setEditLayouts] = useState<IImage[]>([]);
    const [status, setStatus] = useState<"started" | "completed" | "not-started">("not-started");
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [duplicateUnitsFound, setDuplicateUnitsFound] = useState(false);
    const [duplicateEngineersFound, setDuplicateEngineersFound] = useState(false);
    const [metrics, setMetrics] = useState<{ name: string, fieldType: string, values: (string | number)[], valueSchema: string }[]>([]);
    const [duplicateMetricsFound, setDuplicateMetricsFound] = useState(false);
    const [deleteProjectPopupVisible, setDeleteProjectPopupVisible] = useState(false);
    const [deleteInspectionPopupVisible, setDeleteInspectionPopupVisible] = useState(false);
    const [startProjectPopupVisible, setStartProjectPopupVisible] = useState(false);
    const [completeProjectPopupVisible, setCompleteProjectPopupVisible] = useState(false);
    const [dateSerachQuery, setDateSearchQuery] = useState('');
    const [unitSearchQuery, setUnitSearchQuery] = useState('');
    const [engineerSearchQuery, setEngineerSearchQuery] = useState('');
    const [statusSearchQuery, setStatusSearchQuery] = useState('');
    const [inspectionToDelete, setInspectionToDelete] = useState<IInspection>();

    const viewAllEngineers = useCallback(async (abort: AbortController) => {
        const result = await users.viewAll(abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch users');
            return;
        }
        setEngineerList((result as IUser[]).filter(user => user.permissionLevel === 'engineer'));
        console.log('Users fetched successfully');
    }, [users]);

    const viewProject = useCallback(async (abort?: AbortController) => {
        if (!id) {
            return;
        }
        const result = await projects.view(id, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch project');
            return;
        }
        setName(result.name);
        setDescription(result.description);
        setBuilding(result.building);
        setStatus(result.status);
        setUnits(result.units);
        setInspectionsList(result.inspections);
        setFilteredInspectionsList(result.inspections);
        const aEs = result.engineers.map((engineer: IUser) => ({ engineerId: engineer.id, unitNumbers: [], unitSchema: '' }));
        for (let i = 0; i < aEs.length; i++) {
            const engineer = aEs[i];
            const inspections = result.inspections.filter((inspection: IInspection) => inspection.engineer === engineer.engineerId);
            const units = result.units.filter((unit: IUnit) => inspections.map((inspection: IInspection) => inspection.unit).includes(unit.id));
            engineer.unitNumbers = units.map((unit: IUnit) => unit.number);
            engineer.unitSchema = engineer.unitNumbers.join(', ');
        }
        setAssignedEngineers(aEs);
        setMetrics(result.metricsSchema.map((metric: IMetricsSchema) => ({ name: metric.name, fieldType: metric.fieldType, values: metric.values, valueSchema: metric.values?.join(', ') })));
        if (result.layouts.length !== 0) {
            for (let i = 0; i < result.layouts.length; i++) {
                const imgResult = await projects.downloadLayout(id, result.layouts[i].id, abort);
                if (imgResult === 'abort') {
                    return;
                }
                if (imgResult === 'fail') {
                    console.log('Failed to fetch layouts');
                    return;
                }
                const imgURL = URL.createObjectURL(imgResult);
                result.layouts[i].url = imgURL;
            }
            setLayouts(result.layouts);
        }
        setLayoutsLoaded(true);
        console.log('Project fetched successfully');
    }, [id, projects]);

    const updateEngineerData = (index: number, data: { engineerId: string, unitNumbers: number[], unitSchema: string }) => {
        setAssignedEngineers(prev => {
            const newEngineers = [...prev];
            newEngineers[index] = data;
            return newEngineers;
        });
    }

    const changeStatus = async (newStatus: "started" | "completed" | "not-started") => {
        setStatus(newStatus);
        setStartProjectPopupVisible(false);
        setCompleteProjectPopupVisible(false);
        await editProject(newStatus, false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await editProject(status, true);
    };

    const editProject = async (projectStatus: "started" | "completed" | "not-started", shouldUploadLayouts: boolean) => {
        if (!id) {
            return;
        }
        if (duplicateUnitsFound) {
            console.log('Duplicate units found');
            return;
        }
        if (duplicateEngineersFound) {
            console.log('Duplicate engineers found');
            return;
        }
        if (duplicateMetricsFound) {
            console.log('Duplicate metrics found');
            return;
        }

        setInEditMode(false);

        const result = await projects.edit(id, name, description, projectStatus, assignedEngineers.map(assignedEngineer => ({ engineerId: assignedEngineer.engineerId, unitNumbers: assignedEngineer.unitNumbers.map(String) })), metrics.map(metric => ({ name: metric.name, fieldType: metric.fieldType, values: metric.values })));
        if (!result) {
            console.log('Failed to edit project');
            return;
        }
        console.log('Project edited successfully');

        if (shouldUploadLayouts) {
            if (layouts.length !== editLayouts.length) {
                const deletedLayouts = layouts.filter((layout) => !editLayouts.includes(layout));
                const layoutResult = await projects.deleteLayouts(id, deletedLayouts.map(({ id }) => id));
                if (!layoutResult) {
                    console.log('Failed to delete layouts');
                    return;
                }
                console.log('Layouts deleted', deletedLayouts);
            }

            if (selectedFiles) {
                console.log('Uploading layouts');
                const formData = new FormData();
                Array.from(selectedFiles).forEach(file => formData.append('files', file));
                formData.append('uploadCount', selectedFiles.length.toString());
                const timestamps = Array.from(selectedFiles).map(() => new Date().toISOString());
                formData.append('timestamps', JSON.stringify(timestamps));
                setIsUploading(true);

                const uploadResult = await projects.uploadLayouts(id, formData);
                if (!uploadResult) {
                    console.log('Failed to upload layouts');
                } else {
                    console.log('Layouts uploaded successfully');
                }
            }
        }

        viewProject();
    }

    const deleteProject = async () => {
        if (!id) {
            return;
        }
        setDeleteProjectPopupVisible(false);
        if (!await projects.delete(id)) {
            console.log('Failed to delete project');
            return;
        }
        console.log('Project deleted successfully');
        goBack();
    }

    const deleteInspection = async () => {
        if (!id) {
            return;
        }
        if (!inspectionToDelete) {
            return;
        }
        setDeleteInspectionPopupVisible(false);
        if (!await inspections.delete(inspectionToDelete.id)) {
            console.log('Failed to delete inspection');
            return;
        }
        console.log('Inspection deleted successfully');
    }

    const openEditMode = () => {
        setEditLayouts(layouts);
        setSelectedFiles(null);
        setInEditMode(true);
    }

    type RangeCondition = 'odds' | 'evens' | `step=${number}`;
    const parseNumberPattern = (input: string): number[] => {
        const regex = /(\d+)(?:-(\d+)(?::(odds|evens|step=\d+))?)?/g;
        const results: number[] = [];

        let match: RegExpExecArray | null;

        while ((match = regex.exec(input)) !== null) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : start;
            const condition = match[3] as RangeCondition | undefined;

            if (start === end) {
                results.push(start);
            } else {
                for (let i = start; i <= end; i++) {
                    if (condition === 'odds' && i % 2 === 0) continue;
                    if (condition === 'evens' && i % 2 !== 0) continue;
                    if (condition?.startsWith('step=')) {
                        const step = parseInt(condition.split('=')[1], 10);
                        if ((i - start) % step !== 0) continue;
                    }
                    results.push(i);
                }
            }
        }
        return results;
    }

    const parseStringPattern = (input: string): string[] => {
        return input.split(',').map(str => str.trim());
    }

    const addEngineer = () => {
        setAssignedEngineers([...assignedEngineers, { engineerId: engineerList[0].id, unitNumbers: [], unitSchema: '' }]);
    }

    const removeEngineer = (index: number) => {
        setAssignedEngineers(prev => {
            const newEngineers = [...prev];
            newEngineers.splice(index, 1);
            return newEngineers;
        });
    }

    const removeLayout = (index: number) => {
        const newLayouts = [] as IImage[];
        editLayouts.forEach((layout, i) => {
            if (i !== index) {
                newLayouts.push(layout);
            }
        });
        setEditLayouts(newLayouts);
    }

    const addMetric = () => {
        setMetrics([...(metrics), { name: "", fieldType: "text", values: [], valueSchema: "" }]);
    }

    const removeMetric = (index: number) => {
        setMetrics(prev => {
            const newMetrics = [...prev];
            newMetrics.splice(index, 1);
            return newMetrics;
        });
    }

    const updateMetricData = (index: number, data: { name: string, fieldType: string, values: (string | number)[], valueSchema: string }) => {
        setMetrics(prev => {
            const newMetrics = [...prev];
            newMetrics[index] = data;
            return newMetrics;
        })
    }

    const handleSearch = (catagory: 'unit' | 'date' | 'engineer' | 'status', query: string) => {
        switch (catagory) {
            case 'unit':
                setUnitSearchQuery(query);
                break;
            case 'date':
                setDateSearchQuery(query);
                break;
            case 'engineer':
                setEngineerSearchQuery(query);
                break;
            case 'status':
                setStatusSearchQuery(query);
                break;
            default:
                return;
        }
        const filteredItems = inspectionsList.filter(item => {
            switch (catagory) {
                case 'unit':
                    if (query === '') {
                        return true;
                    }
                    const matchingUnit = units.find(unit => unit.id === item.unit as unknown as string);
                    return matchingUnit ? matchingUnit.number.toString().toLowerCase().includes(query.toLowerCase()) : false;
                case 'date':
                    if (query === '') {
                        return true;
                    }
                    return item.inspectionDate === new Date(query);
                case 'engineer':
                    if (query === '') {
                        return true;
                    }
                    const matchingEngineer = engineerList.find(engineer => engineer.id === item.engineer as unknown as string);
                    return matchingEngineer ? `${matchingEngineer.firstName} ${matchingEngineer.lastName}`.toLowerCase().includes(query.toLowerCase()) : false;
                case 'status':
                    return item.status.toLowerCase() === query.toLowerCase();
                default:
                    return false;
            }
        });
        setFilteredInspectionsList(filteredItems);
    }

    useEffect(() => {
        const controller = new AbortController();
        viewAllEngineers(controller);
        viewProject(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllEngineers, viewProject]);

    useEffect(() => {
        const checkForDuplicateUnits = () => {
            let totalUnits: number[] = [];
            let duplicateUnitsFound = false;
            assignedEngineers.forEach(assignedEngineer => {
                if (assignedEngineer.unitNumbers.filter(unit => totalUnits.includes(unit)).length > 0) {
                    duplicateUnitsFound = true;
                    return true;
                }
                totalUnits = totalUnits.concat(assignedEngineer.unitNumbers);
            });
            return duplicateUnitsFound;
        }

        const checkForDuplicateEngineers = () => {
            let duplicateEngineersFound = false;
            let engineerIds: string[] = [];
            assignedEngineers.forEach(assignedEngineer => {
                if (engineerIds.includes(assignedEngineer.engineerId)) {
                    duplicateEngineersFound = true;
                    return true;
                }
                engineerIds.push(assignedEngineer.engineerId);
            });
            return duplicateEngineersFound;
        }

        const checkForDuplicateMetrics = () => {
            let duplicateMetricsFound = false;
            let metricNames: string[] = [];
            metrics.forEach(metric => {
                if (metricNames.includes(metric.name)) {
                    duplicateMetricsFound = true;
                    return true;
                }
                metricNames.push(metric.name);
            });
            return duplicateMetricsFound;
        }

        setDuplicateUnitsFound(checkForDuplicateUnits());
        setDuplicateEngineersFound(checkForDuplicateEngineers());
        setDuplicateMetricsFound(checkForDuplicateMetrics());
    }, [assignedEngineers, metrics]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className='M-container'>
            {/* Delete Project Popup */}
            <Popup
                visible={deleteProjectPopupVisible}
                onRequestClose={() => { setDeleteProjectPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete project "${name}"?`}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteProject() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteProjectPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Delete Inspection Popup */}
            <Popup
                visible={deleteInspectionPopupVisible}
                onRequestClose={() => { setDeleteInspectionPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete Inspection on Unit ${units.find(unit => unit.id === inspectionToDelete?.unit as unknown as string)?.number} by ${engineerList.find(engineer => engineer.id === inspectionToDelete?.engineer as unknown as string)?.firstName} ${engineerList.find(engineer => engineer.id === inspectionToDelete?.engineer as unknown as string)?.lastName}?`}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteInspection() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteInspectionPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Start Project Popup */}
            <Popup
                visible={startProjectPopupVisible}
                onRequestClose={() => { setStartProjectPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{"Are you sure you want to start this project? It will be accessible by assigned engineers."}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { changeStatus('started') }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setStartProjectPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Complete Project Popup */}
            <Popup
                visible={completeProjectPopupVisible}
                onRequestClose={() => { setCompleteProjectPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{"Are you sure you want to complete this project? It will be no longer be accessible by assigned engineers."}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { changeStatus('completed') }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setCompleteProjectPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>Project: {name}</h1>
            {/* Project Info */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                    <div className="M-section-button-content">
                        <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                        <span className='M-section-text M-text-color'>Back</span>
                    </div>
                </Button>
                {status === 'not-started' &&
                    <Button variant="warning" type="button" onClick={() => { setStartProjectPopupVisible(true); }} style={{ marginTop: 40, marginBottom: 15, width: 195 }}>
                        <div className="M-section-button-content">
                            <FaPlay className="M-icon" size={20} style={{ marginTop: 5 }} />
                            <span className='M-section-text M-text-color'>Start Project</span>
                        </div>
                    </Button>
                }
                {status === 'started' &&
                    <Button variant="warning" type="button" onClick={() => { setCompleteProjectPopupVisible(true); }} style={{ marginTop: 40, marginBottom: 15, width: 250 }}>
                        <div className="M-section-button-content">
                            <FaStop className="M-icon" size={20} style={{ marginTop: 5 }} />
                            <span className='M-section-text M-text-color'>Complete Project</span>
                        </div>
                    </Button>
                }
            </div>
            {
                inEditMode ?
                    <form onSubmit={handleSubmit} style={{ paddingBottom: 20 }}>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <p className='M-section-description M-text-color'>Please enter in the following information about the new project.</p>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Project Name</span>
                                    <label htmlFor="name" className='hidden-label'>Project Name</label>
                                    <Input
                                        variant='secondary'
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value) }}
                                        placeholder="Project Name"
                                        required
                                    />
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Project Description</span>
                                    <label htmlFor="description" className='hidden-label'>Project Description</label>
                                    <Input
                                        variant='secondary'
                                        type="text"
                                        id="description"
                                        value={description}
                                        onChange={(e) => { setDescription(e.target.value) }}
                                        placeholder="Project Description"
                                        required
                                    />
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Status</span>
                                    <span className='M-section-text M-text-color'>{status === "completed" ? "Completed" : status === "started" ? "Started" : "Not Started"}</span>
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Layouts</h2>
                        <p className='M-section-description M-text-color'>Please upload the different layouts for the project.</p>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Layouts</span>
                                    <label htmlFor="layouts" className='hidden-label'>Layouts</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                            {editLayouts.length === 0 && <span className='M-section-text M-text-danger'>{layoutsLoaded ? "No layouts uploaded" : "Loading..."}</span>}
                                            {editLayouts.map(({ url }, index) => (
                                                <div key={index} style={{ display: 'flex', flexDirection: 'row', gap: 50 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                            <img src={url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                        </a>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto' }}>
                                                        <Button variant="danger" type="button" onClick={() => { removeLayout(index) }}>Remove</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Input
                                            variant='secondary'
                                            type="file"
                                            id="layouts"
                                            onChange={(e) => { setSelectedFiles(e.target.files) }}
                                            multiple
                                            accept="image/*"
                                            style={{ marginLeft: 'auto', marginRight: 'auto' }}
                                        />
                                    </div>
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Units and Engineers</h2>
                        <p className='M-section-description M-text-color'>Please use the following regex system to assign engineers to units.</p>
                        <p className='M-section-description M-text-color'>"101, 102, 103" - Inspects units 101, 102, and 103.</p>
                        <p className='M-section-description M-text-color'>"101-200" - Inspects units 101 through 200.</p>
                        <p className='M-section-description M-text-color'>"101-200:odds" - Inspects odd units 101, 103, 105, etc. through 200.</p>
                        <p className='M-section-description M-text-color'>"101-200:evens" - Inspects even units 102, 104, 106, etc. through 200.</p>
                        <p className='M-section-description M-text-color'>"101-200:step=10" - Inspects units 101, 111, 121, etc. through 200.</p>
                        <div className='M-section M-border-color' style={{ marginBottom: 25 }}>
                            <div className='M-section-entry' style={{ marginBottom: 15, marginTop: 25, paddingLeft: '3%', paddingRight: '3%' }}>
                                <span className='M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>Units that have been assigned:<br style={{ marginTop: 10 }} />{assignedEngineers.map((assignedEngineer, _) => (
                                    <span className={duplicateUnitsFound || duplicateEngineersFound ? 'M-text-warning' : 'M-text-color'}>{engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0]?.firstName} {engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0]?.lastName}: {assignedEngineer.unitNumbers.join(', ')}</span>
                                ))}<br style={{ marginTop: 10 }} />Total Units: {assignedEngineers.reduce((acc, curr) => acc + curr.unitNumbers.length, 0)}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {duplicateUnitsFound ? <span className='M-section-text M-text-danger'>WARNING: Duplicate units found</span> : <></>}
                                    {duplicateEngineersFound ? <span className='M-section-text M-text-danger'>WARNING: Duplicate engineers found</span> : <></>}
                                </div>
                            </div>
                        </div>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span id='engineers' className='M-section-text M-text-color'>Engineers</span>
                                    <label htmlFor="engineers" className='hidden-label'>Engineers</label>
                                    <Button variant="secondary" type="button" onClick={() => addEngineer()}>Add Engineer</Button>
                                </span>
                            </div>
                            {assignedEngineers.map((assignedEngineer, index) => (
                                <div className='M-section-entry' key={index}>
                                    <span className='M-section-content'>
                                        <label htmlFor={`engineer-${index}`} className='hidden-label'>Engineer</label>
                                        <select name={`engineer-${index}`} id={`engineer-${index}`} className="M-dropdown" onChange={(e) => { updateEngineerData(index, { engineerId: e.target.value, unitNumbers: assignedEngineer.unitNumbers, unitSchema: assignedEngineer.unitSchema }) }} required>
                                            {engineerList.map((engineer) => {
                                                return (
                                                    <option value={engineer.id} key={engineer.id} className="M-section-text M-text-color" selected={engineer.id === assignedEngineer.engineerId}>{engineer.firstName} {engineer.lastName}, {engineer.email}</option>
                                                );
                                            })}
                                        </select>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: 25 }}>
                                            <Input
                                                variant='secondary'
                                                type="text"
                                                id="units"
                                                value={assignedEngineer.unitSchema}
                                                onChange={(e) => { updateEngineerData(index, { engineerId: assignedEngineer.engineerId, unitNumbers: parseNumberPattern(e.target.value), unitSchema: e.target.value }) }}
                                                placeholder="Ex: 101, 107-155:odds, 200-300:step=10"
                                            //required
                                            />
                                            <Button variant="danger" type="button" onClick={() => removeEngineer(index)}>Remove</Button>
                                        </div>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspection Metrics</h2>
                        <p className='M-section-description M-text-color'>Please input metrics you would like to measure for each inspection in this project.</p>
                        <div className='M-section M-border-color' style={{ marginBottom: 25 }}>
                            <div className='M-section-entry' style={{ marginBottom: 15, marginTop: 25, paddingLeft: '3%', paddingRight: '3%' }}>
                                <span className='M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>Metrics that have been added:<br style={{ marginTop: 10 }} />{metrics.map((metric, _) => (
                                    <span className={duplicateMetricsFound ? 'M-text-warning' : 'M-text-color'}>{metric.name} ({metric.fieldType}): {metric.values.join(', ')}</span>
                                ))}<br style={{ marginTop: 10 }} />Total Metrics: {metrics.length}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {duplicateMetricsFound ? <span className='M-section-text M-text-danger'>WARNING: Duplicate metrics found</span> : <></>}
                                </div>
                            </div>
                        </div>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span id='metrics' className='M-section-text M-text-color'>Metrics</span>
                                    <label htmlFor="metrics" className='hidden-label'>Metrics</label>
                                    <Button variant="secondary" type="button" onClick={() => addMetric()}>Add Metric</Button>
                                </span>
                            </div>
                            {metrics.map((metric, index) => (
                                <div className='M-section-entry' key={index}>
                                    <span className='M-section-content'>
                                        <label htmlFor={`metric-${index}`} className='hidden-label'>Metric</label>
                                        <Input
                                            variant='secondary'
                                            type="text"
                                            id={`metric-${index}`}
                                            value={metric.name}
                                            onChange={(e) => { updateMetricData(index, { name: e.target.value, fieldType: metric.fieldType, values: metric.values, valueSchema: metric.valueSchema }) }}
                                            placeholder="Add metric name here..."
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: 25 }}>
                                            <select name={`metric-${index}`} id={`metric-${index}`} className="M-dropdown" onChange={(e) => { updateMetricData(index, { name: metric.name, fieldType: e.target.value, values: metric.values, valueSchema: metric.valueSchema }) }} required>
                                                <option value='text' key={`metric-text-${index}`} className="M-section-text M-text-color" selected={metric.fieldType === 'text'}>Text</option>
                                                <option value='number' key={`metric-number-${index}`} className="M-section-text M-text-color" selected={metric.fieldType === 'number'}>Number</option>
                                            </select>
                                            <Input
                                                variant='secondary'
                                                type="text"
                                                id="units"
                                                value={metric.valueSchema}
                                                onChange={(e) => { updateMetricData(index, { name: metric.name, fieldType: metric.fieldType, values: metric.fieldType === 'text' ? parseStringPattern(e.target.value) : parseNumberPattern(e.target.value).map(String), valueSchema: e.target.value }) }}
                                                placeholder={metric.fieldType === 'text' ? "Ex: moldy, clean, rough" : "Ex: 1-10"}
                                            />
                                            <Button variant="danger" type="button" onClick={() => removeMetric(index)}>Remove</Button>
                                        </div>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
                            <Button variant="secondary" type="submit" disabled={isUploading}>Submit</Button>
                            <Button variant="danger" type="button" onClick={() => setInEditMode(false)}>Cancel</Button>
                        </div>
                    </form>
                    :
                    <>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Project Name</span>
                                    <span className='M-section-text M-text-color'>{name}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Project Description</span>
                                    <span className='M-section-text M-text-color'>{description}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building</span>
                                    <span className='M-section-text M-text-color'>{building?.name}, {building?.address}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Status</span>
                                    <span className='M-section-text M-text-color'>{status === "completed" ? "Completed" : status === "started" ? "Started" : "Not Started"}</span>
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Layouts</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <label htmlFor="layouts" className='hidden-label'>Layouts</label>
                                    <span id='layouts' className='M-section-text M-text-color'>Layouts</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {layouts.length === 0 && <span className='M-section-text M-text-danger'>{layoutsLoaded ? "No layouts uploaded" : "Loading..."}</span>}
                                        {layouts.map(({ url }, index) => (
                                            <div key={index} style={{ display: 'flex', flexDirection: 'row', gap: 1000 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                        <img src={url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Units and Engineers</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry' style={{ marginBottom: 15, marginTop: 25, paddingLeft: '3%', paddingRight: '3%' }}>
                                <span className='M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>Units that have been assigned:<br style={{ marginTop: 10 }} />{assignedEngineers.map((assignedEngineer, _) => (
                                    <span className='M-text-color'>{engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0]?.firstName} {engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0]?.lastName}: {assignedEngineer.unitNumbers.join(', ')}</span>
                                ))}<br style={{ marginTop: 10 }} />Total Units: {assignedEngineers.reduce((acc, curr) => acc + curr.unitNumbers.length, 0)}</span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspection Metrics</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 25 }}>
                            <div className='M-section-entry' style={{ marginBottom: 15, marginTop: 25, paddingLeft: '3%', paddingRight: '3%' }}>
                                <span className='M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>Metrics that have been added:<br style={{ marginTop: 10 }} />{metrics.map((metric, _) => (
                                    <span className={duplicateMetricsFound ? 'M-text-warning' : 'M-text-color'}>{metric.name} ({metric.fieldType}): {metric.values.join(', ')}</span>
                                ))}<br style={{ marginTop: 10 }} />Total Metrics: {metrics.length}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {duplicateMetricsFound ? <span className='M-section-text M-text-danger'>WARNING: Duplicate metrics found</span> : <></>}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={openEditMode}>Edit Project</Button>
                            <Button variant="danger" type="button" onClick={() => { setDeleteProjectPopupVisible(true); }}>Delete Project</Button>
                        </div>
                    </>
            }
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspection List</h2>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Unit</th>
                        <th className='M-table-th M-section-header M-text-color'>Date</th>
                        <th className='M-table-th M-section-header M-text-color'>Engineer</th>
                        <th className='M-table-th M-section-header M-text-color'>Status</th>
                        <th className='M-table-th M-section-header M-text-color'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="unit" className='hidden-label'>Unit</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="unit"
                                value={unitSearchQuery}
                                onChange={(e) => { handleSearch('unit', e.target.value) }}
                                placeholder="Sort by number..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="date" className='hidden-label'>Date</label>
                            <Input
                                variant='secondary'
                                type="date"
                                id="date"
                                value={dateSerachQuery}
                                onChange={(e) => { handleSearch('date', e.target.value) }}
                                placeholder="Sort by date..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="engineer" className='hidden-label'>Engineer</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="engineer"
                                value={engineerSearchQuery}
                                onChange={(e) => { handleSearch('engineer', e.target.value) }}
                                placeholder="Sort by engineer..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="status" className='hidden-label'>Status</label>
                            <select name="status" id="status" className="M-dropdown" required onChange={(e) => { handleSearch('status', e.target.value) }}>
                                <option value="" disabled className="M-section-text M-text-color">Sort by status...</option>
                                <option value="" className="M-section-text M-text-color" selected={statusSearchQuery === ''}>All</option>
                                <option value="completed" className="M-section-text M-text-color" selected={statusSearchQuery === 'completed'}>Completed</option>
                                <option value="not-started" className="M-section-text M-text-color" selected={statusSearchQuery === 'not-started'}>Not Started</option>
                            </select>
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        </td>
                    </tr>
                    {filteredInspectionsList.map((inspection, index) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{units.find(unit => unit.id === inspection.unit as unknown as string)?.number}</td>
                            <td className='M-table-td M-section-text M-text-color'>{inspection.inspectionDate ? inspection.inspectionDate.toISOString() : 'Not inspected'}</td>
                            <td className='M-table-td M-section-text M-text-color'>{engineerList.find(engineer => engineer.id === inspection.engineer as unknown as string)?.firstName} {engineerList.find(engineer => engineer.id === inspection.engineer as unknown as string)?.lastName}</td>
                            <td className='M-table-td M-section-text M-text-color'>{inspection.status === 'completed' ? 'Completed' : 'Not Started'}</td>
                            <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/inspections/${inspection.id}`) }} style={{ width: 80 }}>View</Button>
                                <Button variant="danger" type="button" onClick={() => { setInspectionToDelete(inspection); setDeleteInspectionPopupVisible(true); }} style={{ width: 100 }}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Project;