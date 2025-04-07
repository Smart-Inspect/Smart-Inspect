import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { IBuilding } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Buildings() {
    const navigate = useNavigate();
    const { buildings } = useRequests();
    const [buildingsList, setBuildingsList] = useState<IBuilding[]>([]);
    const [filteredBuildings, setFilteredBuildings] = useState<IBuilding[]>(buildingsList);
    const [nameSearchQuery, setNameSearchQuery] = useState('');
    const [addressSearchQuery, setAddressSearchQuery] = useState('');
    const [deleteBuildingPopupVisible, setDeleteBuildingPopupVisible] = useState(false);
    const [buildingToDelete, setBuildingToDelete] = useState<IBuilding | null>(null);

    const handleSearch = (catagory: 'name' | 'address', query: string) => {
        switch (catagory) {
            case 'name':
                setNameSearchQuery(query);
                break;
            case 'address':
                setAddressSearchQuery(query);
                break;
            default:
                return;
        }
        const filteredItems = buildingsList.filter(item => {
            switch (catagory) {
                case 'name':
                    return item.name.toLowerCase().includes(query.toLowerCase());
                case 'address':
                    return item.address.toLowerCase().includes(query.toLowerCase());
                default:
                    return false;
            }
        });
        setFilteredBuildings(filteredItems);
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
        setFilteredBuildings(result);
        console.log('Users fetched successfully');
    }, [buildings]);

    const deleteBuilding = async (building: IBuilding | null) => {
        if (!building) {
            return;
        }
        setDeleteBuildingPopupVisible(false);
        if (!await buildings.delete(building.id)) {
            console.log('Failed to delete building');
            return;
        }
        console.log('Building deleted successfully');
    }

    useEffect(() => {
        const controller = new AbortController();
        viewAllBuildings(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllBuildings]);

    return (
        <div className='M-container'>
            {/* Delete Building Popup */}
            <Popup
                visible={deleteBuildingPopupVisible}
                onRequestClose={() => { setDeleteBuildingPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete building "${buildingToDelete?.name}"?`}</span>
                    <br /><span className="M-text-danger">NOTE: This will also delete:</span>
                    <br /><span className="M-text-danger">- All units associated with this building</span>
                    <br /><span className="M-text-danger">- All inspections associated with those units</span>
                    <br /><span className="M-text-danger">- All projects associated with this building</span>
                    <br /><span className="M-text-danger">- All inspections associated with those projects</span>
                    <br /><span className="M-text-danger">- All layouts associated with those projects</span>
                    <br /><span className="M-text-danger">- All photos associated with those projects</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteBuilding(buildingToDelete) }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteBuildingPopupVisible(false); }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>Buildings List</h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 40, flexWrap: 'wrap', marginTop: 20, marginBottom: 60 }}>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Total Buildings</span>
                    <span className='M-card-value M-text-color'>{buildingsList.length}</span>
                </div>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Filtered Buildings</span>
                    <span className='M-card-value M-text-color'>{filteredBuildings.length}</span>
                </div>
            </div>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Building Name</th>
                        <th className='M-table-th M-section-header M-text-color'>Building Address</th>
                        <th className='M-table-th M-section-header M-text-color'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
                        <td className='M-table-td M-section-header M-text-color'>
                            <label htmlFor="name" className='hidden-label'>Building Name</label>
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
                            <label htmlFor="address" className='hidden-label'>Building Address</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="address"
                                value={addressSearchQuery}
                                onChange={(e) => { handleSearch('address', e.target.value) }}
                                placeholder="Sort by address..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <Button variant="warning" type="button" onClick={() => { navigate('/auth/buildings/create') }} style={{ width: 160 }}>Add Building</Button>
                        </td>
                    </tr>
                    {filteredBuildings.map((building, index) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{building.name}</td>
                            <td className='M-table-td M-section-text M-text-color'>{building.address}</td>
                            <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/buildings/${building.id}`) }} style={{ width: 80 }}>View</Button>
                                <Button variant="danger" type="button" onClick={() => { setBuildingToDelete(building); setDeleteBuildingPopupVisible(true); }} style={{ width: 100 }}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Buildings;