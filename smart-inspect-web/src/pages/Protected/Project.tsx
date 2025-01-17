import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import Input from '../../components/Input/Input';
import { useRequests } from '../../context/RequestsContext';
import { IBuilding, IInspection, IUnit, IUser } from '../../utils/types';

function Project() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { buildings, users, projects } = useRequests();
    const [buildingsList, setBuildingsList] = useState<IBuilding[]>([]);
    const [engineerList, setEngineerList] = useState<IUser[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState<IBuilding>();
    const [assignedEngineers, setAssignedEngineers] = useState<{ engineerId: string, unitNumbers: number[], unitSchema: string }[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [duplicateUnitsFound, setDuplicateUnitsFound] = useState(false);
    const [duplicateEngineersFound, setDuplicateEngineersFound] = useState(false);

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

    const viewProject = useCallback(async (abort: AbortController) => {
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

        const aEs = result.engineers.map((engineer: IUser) => ({ engineerId: engineer.id, unitNumbers: [], unitSchema: '' }));
        for (let i = 0; i < aEs.length; i++) {
            const engineer = aEs[i];
            const inspections = result.inspections.filter((inspection: IInspection) => inspection.engineer === engineer.engineerId);
            const units = result.units.filter((unit: IUnit) => inspections.map((inspection: IInspection) => inspection.unit).includes(unit.id));
            engineer.unitNumbers = units.map((unit: IUnit) => unit.number);
            engineer.unitSchema = engineer.unitNumbers.join(', ');
        }
        setAssignedEngineers(aEs);
        console.log('Project fetched successfully');
    }, [id, projects]);

    useEffect(() => {
        const controller = new AbortController();
        viewAllBuildings(controller);
        viewAllEngineers(controller);
        viewProject(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllBuildings, viewAllEngineers, viewProject]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className='M-container'>
            {/* Title */}
            <h1 className='M-title'>Project: {name}</h1>
            {/* Project Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
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
            </div>
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Layouts</h2>
            <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <label htmlFor="layouts" className='hidden-label'>Layouts</label>
                        <span id='layouts' className='M-section-text M-text-color'>Layouts</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>

                        </div>
                    </span>
                </div>
            </div>
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Units and Engineers</h2>
            <div className='M-section M-border-color' style={{ marginBottom: 25 }}>
                <div className='M-section-entry' style={{ marginBottom: 15, marginTop: 25, paddingLeft: '3%', paddingRight: '3%' }}>
                    <span className='M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>Units that have been assigned:<br style={{ marginTop: 10 }} />{assignedEngineers.map((assignedEngineer, _) => (
                        <span className='M-text-color'>{engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0].firstName} {engineerList.filter(engineer => engineer.id === assignedEngineer.engineerId)[0].lastName}: {assignedEngineer.unitNumbers.join(', ')}</span>
                    ))}<br style={{ marginTop: 10 }} />Total Units: {assignedEngineers.reduce((acc, curr) => acc + curr.unitNumbers.length, 0)}</span>
                </div>
            </div>
        </div>
    );
};

export default Project;