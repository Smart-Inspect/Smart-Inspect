import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import Input from '../../components/Input/Input';
import { useRequests } from '../../context/RequestsContext';
import { IBuilding, IUser } from '../../utils/types';

function ProjectCreate() {
    const navigate = useNavigate();
    const { buildings, users, projects } = useRequests();
    const [buildingsList, setBuildingsList] = useState<IBuilding[]>([]);
    const [engineerList, setEngineerList] = useState<IUser[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState('');
    const [assignedEngineers, setAssignedEngineers] = useState<{ engineerId: string, unitNumbers: number[], unitSchema: string }[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [duplicateUnitsFound, setDuplicateUnitsFound] = useState(false);
    const [duplicateEngineersFound, setDuplicateEngineersFound] = useState(false);
    const [metrics, setMetrics] = useState<{ name: string, fieldType: string, values: (string | number)[], valueSchema: string }[]>([]);
    const [duplicateMetricsFound, setDuplicateMetricsFound] = useState(false);

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

    const updateEngineerData = (index: number, data: { engineerId: string, unitNumbers: number[], unitSchema: string }) => {
        setAssignedEngineers(prev => {
            const newEngineers = [...prev];
            newEngineers[index] = data;
            return newEngineers;
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

        const result = await projects.create(name, description, building, assignedEngineers.map(assignedEngineer => ({ engineerId: assignedEngineer.engineerId, unitNumbers: assignedEngineer.unitNumbers.map(String) })), metrics.map(metric => ({ name: metric.name, fieldType: metric.fieldType, values: metric.values })));
        if (!result) {
            console.log('Failed to create project');
            return;
        }
        console.log('Project created successfully');

        if (selectedFiles) {
            console.log('Uploading layouts');
            const formData = new FormData();
            Array.from(selectedFiles).forEach(file => formData.append('files', file));
            formData.append('uploadCount', selectedFiles.length.toString());
            const timestamps = Array.from(selectedFiles).map(() => new Date().toISOString());
            formData.append('timestamps', JSON.stringify(timestamps));
            setIsUploading(true);

            const uploadResult = await projects.uploadLayouts(result.id, formData);
            if (!uploadResult) {
                console.log('Failed to upload layouts');
            } else {
                console.log('Layouts uploaded successfully');
            }
        }
        goBack();
    };

    const viewAllBuildings = useCallback(async (abort: AbortController) => {
        const result = await buildings.viewAll(abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch buildings');
            return;
        }
        setBuildingsList(result);
        setBuilding(result[0].id);
        console.log('Users fetched successfully');
    }, [buildings]);

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

    useEffect(() => {
        const controller = new AbortController();
        viewAllBuildings(controller);
        viewAllEngineers(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllBuildings, viewAllEngineers]);

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
            {/* Title */}
            <h1 className='M-title'>Creating New Project</h1>
            {/* Project Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
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
                            <span className='M-section-text M-text-color'>Building</span>
                            <label htmlFor="building" className='hidden-label'>Building</label>
                            <select name="building" id="building" className="M-dropdown" required onChange={(e) => { setBuilding(e.target.value) }}>
                                {buildingsList.map((building) => {
                                    return (
                                        <option value={building.id} key={building.id} className="M-section-text M-text-color">{building.name}, {building.address}</option>
                                    );
                                })}
                            </select>
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
                            <Input
                                variant='secondary'
                                type="file"
                                id="layouts"
                                onChange={(e) => { setSelectedFiles(e.target.files) }}
                                multiple
                                accept="image/*"
                            />
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
                            <span className={duplicateUnitsFound || duplicateEngineersFound ? 'M-text-warning' : 'M-text-color'}>{engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0].firstName} {engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0].lastName}: {assignedEngineer.unitNumbers.join(', ')}</span>
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
                                        <option value='text' key={`metric-${index}`} className="M-section-text M-text-color" selected={metric.fieldType === 'text'}>Text</option>
                                        <option value='number' key={`metric-${index}`} className="M-section-text M-text-color" selected={metric.fieldType === 'number'}>Number</option>
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
                    <Button variant="danger" type="button" onClick={goBack}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default ProjectCreate;