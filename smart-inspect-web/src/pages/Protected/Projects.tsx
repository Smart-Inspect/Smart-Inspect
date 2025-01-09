import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { IProject } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Projects() {
    const navigate = useNavigate();
    const { projects } = useRequests();
    const [projectsList, setProjectsList] = useState<IProject[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<IProject[]>(projectsList);
    const [nameSearchQuery, setNameSearchQuery] = useState('');
    const [buildingSearchQuery, setBuildingSearchQuery] = useState('');
    const [deleteProjectPopupVisible, setDeleteProjectPopupVisible] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);

    const handleSearch = (catagory: 'name' | 'building', query: string) => {
        switch (catagory) {
            case 'name':
                setNameSearchQuery(query);
                break;
            case 'building':
                setBuildingSearchQuery(query);
                break;
            default:
                return;
        }
        const filteredItems = projectsList.filter(item => {
            switch (catagory) {
                case 'name':
                    return item.name.toLowerCase().includes(query.toLowerCase());
                case 'building':
                    return item.building.name.toLowerCase().includes(query.toLowerCase());
                default:
                    return false;
            }
        });
        setFilteredProjects(filteredItems);
    }

    const deleteProject = async (project: IProject | null) => {
        if (!project) {
            return;
        }
        setDeleteProjectPopupVisible(false);
        if (!await projects.delete(project.id)) {
            console.log('Failed to delete project');
            return;
        }
        console.log('Project deleted successfully');
    }

    const viewAllProjects = useCallback(async (abort: AbortController) => {
        const result = await projects.viewAll(abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch projects');
            return;
        }
        setProjectsList(result);
        setFilteredProjects(result);
        console.log('Projects fetched successfully');
    }, [projects]);

    useEffect(() => {
        const controller = new AbortController();
        viewAllProjects(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllProjects]);

    return (
        <div className='M-container'>
            {/* Delete Building Popup */}
            <Popup
                visible={deleteProjectPopupVisible}
                onRequestClose={() => { setDeleteProjectPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete project "${projectToDelete?.name}"?`}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteProject(projectToDelete) }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteProjectPopupVisible(false); }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>Projects List</h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 40, flexWrap: 'wrap', marginTop: 20, marginBottom: 60 }}>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Total Projects</span>
                    <span className='M-card-value M-text-color'>{projectsList.length}</span>
                </div>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Filtered Projects</span>
                    <span className='M-card-value M-text-color'>{filteredProjects.length}</span>
                </div>
            </div>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Project Name</th>
                        <th className='M-table-th M-section-header M-text-color'>Building</th>
                        <th className='M-table-th M-section-header M-text-color'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
                        <td className='M-table-td M-section-header M-text-color'>
                            <label htmlFor="name" className='hidden-label'>Project Name</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="name"
                                value={nameSearchQuery}
                                onChange={(e) => { handleSearch('name', e.target.value) }}
                                placeholder="Sort by name..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td M-section-header M-text-color'>
                            <label htmlFor="building" className='hidden-label'>Building</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="building"
                                value={buildingSearchQuery}
                                onChange={(e) => { handleSearch('building', e.target.value) }}
                                placeholder="Sort by building..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <Button variant="warning" type="button" onClick={() => { navigate('/auth/projects/create') }} style={{ width: 160 }}>Add Project</Button>
                        </td>
                    </tr>
                    {filteredProjects.map((project, index) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{project.name}</td>
                            <td className='M-table-td M-section-text M-text-color'>{project.building.name}</td>
                            <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/projects/${project.id}`) }} style={{ width: 80 }}>View</Button>
                                <Button variant="danger" type="button" onClick={() => { setProjectToDelete(project); setDeleteProjectPopupVisible(true); }} style={{ width: 100 }}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Projects;