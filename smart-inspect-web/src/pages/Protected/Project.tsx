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
    const [building, setBuilding] = useState<IBuilding>();
    const [units, setUnits] = useState<number[]>([]);
    const [assignedEngineers, setAssignedEngineers] = useState<{ engineerId: string, unitNumbers: number[], unitSchema: string }[]>([]);

    type RangeCondition = 'odds' | 'evens' | `step=${number}`;
    const parseUnitPattern = (input: string): number[] => {
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
        console.log('Buildings fetched successfully');
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
        const result = await projects.view('id', abort);
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
        setUnits(result.units.map(Number));
        console.log('Project fetched successfully');
    }, [projects]);

    useEffect(() => {
        const controller = new AbortController();
        viewProject(controller);
        viewAllBuildings(controller);
        viewAllEngineers(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllBuildings, viewAllEngineers, viewProject]);

    const goBack = () => {
        navigate('/auth/projects');
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
                        <span className='M-section-text M-text-color'>{building?.name}</span>
                    </span>
                </div>
            </div>
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Layouts</h2>
            <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <span className='M-section-text M-text-color'>Layouts</span>
                        <label htmlFor="layouts" className='hidden-label'>Layouts</label>
                        <Input
                            variant='secondary'
                            type="file"
                            id="layouts"
                            multiple
                            required
                        />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreate;