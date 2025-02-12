import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';
import { IoIosArrowBack } from 'react-icons/io';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { IUnit } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Building() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { buildings, units } = useRequests();
    const [inEditMode, setInEditMode] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [addresses, setAddresses] = useState<{ address: string, changedAt: Date }[]>([]);
    const [editAddresses, setEditAddresses] = useState<{ address: string, changedAt: Date }[]>(addresses);
    const [buildingCreated, setBuildingCreated] = useState('');
    const [buildingModified, setBuildingModified] = useState('');
    const [unitsList, setUnitsList] = useState<IUnit[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<IUnit[]>(unitsList);
    const [numberSearchQuery, setNumberSearchQuery] = useState('');
    const [inspectionsSearchQuery, setInspectionsSearchQuery] = useState('');
    const [deleteBuildingPopupVisible, setDeleteBuildingPopupVisible] = useState(false);
    const [deleteUnitPopupVisible, setDeleteUnitPopupVisible] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<IUnit>();

    const handleSearch = (catagory: 'number' | 'inspections', query: string) => {
        switch (catagory) {
            case 'number':
                setNumberSearchQuery(query);
                break;
            case 'inspections':
                setInspectionsSearchQuery(query);
                break;
            default:
                return;
        }
        const filteredItems = unitsList.filter(item => {
            switch (catagory) {
                case 'number':
                    return item.number.toLowerCase().includes(query.toLowerCase());
                case 'inspections':
                    return item.inspections.map(inspections => inspections.inspectionDate.toDateString()).join(' ').toLowerCase().includes(query.toLowerCase());
                default:
                    return false;
            }
        });
        setFilteredUnits(filteredItems);
    }

    const deleteBuilding = async () => {
        if (!id) {
            return;
        }
        setDeleteBuildingPopupVisible(false);
        if (!await buildings.delete(id)) {
            console.log('Failed to delete building');
            return;
        }
        console.log('Building deleted successfully');
        goBack();
    }

    const deleteUnit = async () => {
        if (!id) {
            return;
        }
        if (!unitToDelete) {
            return;
        }
        setDeleteUnitPopupVisible(false);
        if (!await units.delete(unitToDelete.id)) {
            console.log('Failed to delete unit');
            return;
        }
        console.log('Unit deleted successfully');
    }

    const openEditMode = () => {
        setEditAddresses(addresses);
        setInEditMode(true);
    }

    const removeEditAddress = (index: number) => {
        const newAddresses = [] as { address: string, changedAt: Date }[];
        editAddresses.forEach((address, i) => {
            if (i !== index) {
                newAddresses.push(address);
            }
        });
        setEditAddresses(newAddresses);
    }

    const fetchBuildingInfo = useCallback(async (abort?: AbortController) => {
        if (!id) {
            return;
        }
        const result = await buildings.view(id, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch building info');
            return;
        }
        setName(result.name);
        setAddress(result.address);
        setAddresses(result.addresses);
        setUnitsList(result.units);
        setFilteredUnits(result.units);
        console.log(result);
        setBuildingCreated(new Date(parseInt(result.createdAt)).toLocaleString());
        setBuildingModified(new Date(parseInt(result.updatedAt)).toLocaleString());
        console.log('Building info fetched successfully');
    }, [buildings, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            return;
        }
        setInEditMode(false);
        let addressWithoutDate = undefined;
        if (addresses.length !== editAddresses.length) {
            addressWithoutDate = editAddresses.map(({ address }) => address);
            console.log('Address history changed', addressWithoutDate);
        }
        if (!await buildings.edit(id, name, address, addressWithoutDate)) {
            console.log('Failed to update building info');
            return;
        }
        console.log('Building info updated successfully');
        fetchBuildingInfo();
    }

    const cancel = () => {
        setInEditMode(false);
        fetchBuildingInfo();
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchBuildingInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchBuildingInfo]);

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div className='M-container'>
            {/* Delete Building Popup */}
            <Popup
                visible={deleteBuildingPopupVisible}
                onRequestClose={() => { setDeleteBuildingPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete building "${name}"?`}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteBuilding() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteBuildingPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Delete Unit Popup */}
            <Popup
                visible={deleteUnitPopupVisible}
                onRequestClose={() => { setDeleteUnitPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete Unit ${unitToDelete?.number}?`}</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteUnit() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteUnitPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>{`Building: ${name}`}</h1>
            {/* Building Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
            {
                inEditMode ?
                    <form onSubmit={handleSubmit}>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color'>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Building Name</span>
                                    <label htmlFor="name" className='hidden-label'>Building Name</label>
                                    <Input
                                        variant='secondary'
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value) }}
                                        placeholder="Building Name"
                                        required
                                    />
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Building Address</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div className='M-input-container'>
                                            <label htmlFor="address" className='hidden-label'>Building Address</label>
                                            <Input
                                                variant='secondary'
                                                type="text"
                                                id="address"
                                                value={address}
                                                onChange={(e) => { setAddress(e.target.value) }}
                                                placeholder="Building Address"
                                                required
                                            />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Address History</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {editAddresses.slice(1).length === 0 && <span className='M-section-text M-text-danger'>No addresses history</span>}
                                        {editAddresses.slice(1).map(({ address, changedAt }, index) => (
                                            <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className='M-section-text M-text-color'>{address}</span>
                                                    <span className='M-section-text M-text-warning'><b>Changed on: </b>{`${new Date(changedAt).toDateString()}`}</span>
                                                </div>
                                                <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto' }}>
                                                    <Button variant="danger" type="button" onClick={() => { removeEditAddress(index + 1) }}>Remove</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building Created</span>
                                    <span className='M-section-text M-text-color'>{buildingCreated}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building Modified</span>
                                    <span className='M-section-text M-text-color'>{buildingModified}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="submit">Submit</Button>
                            <Button variant="danger" type="button" onClick={cancel}>Cancel</Button>
                        </div>
                    </form>
                    :
                    <>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color'>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Building Name</span>
                                    <span className='M-section-text M-text-color'>{name}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Building Address</span>
                                    <span className='M-section-text M-text-color'>{address}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Address History</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {addresses.slice(1).length === 0 && <span className='M-section-text M-text-danger'>No addresses history</span>}
                                        {addresses.slice(1).map(({ address, changedAt }, index) => (
                                            <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className='M-section-text M-text-color'>{address}</span>
                                                    <span className='M-section-text M-text-warning'><b>Changed on: </b>{`${new Date(changedAt).toDateString()}`}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building Created</span>
                                    <span className='M-section-text M-text-color'>{buildingCreated}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building Modified</span>
                                    <span className='M-section-text M-text-color'>{buildingModified}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={openEditMode}>Edit Building</Button>
                            <Button variant="danger" type="button" onClick={() => { setDeleteBuildingPopupVisible(true); }}>Delete Building</Button>
                        </div>
                    </>
            }
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspected Units</h2>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Number</th>
                        <th className='M-table-th M-section-header M-text-color'>Completed Inspections</th>
                        <th className='M-table-th M-section-header M-text-color'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 300 }}>
                            <label htmlFor="number" className='hidden-label'>Unit Number</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="number"
                                value={numberSearchQuery}
                                onChange={(e) => { handleSearch('number', e.target.value) }}
                                placeholder="Sort by number..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 300 }}>
                            <label htmlFor="inspections" className='hidden-label'>Completed Inspections</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="inspections"
                                value={inspectionsSearchQuery}
                                onChange={(e) => { handleSearch('inspections', e.target.value) }}
                                placeholder="Sort by inpection..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        </td>
                    </tr>
                    {filteredUnits.map((unit, _) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{unit.number}</td>
                            <td className='M-table-td M-section-text M-text-color' style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>{unit.inspections.filter(inspection => inspection.status === 'completed').length > 0 ? unit.inspections.map(inspection => (
                                <div key={inspection.inspectionDate.toString()} style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                                    <span style={{ alignSelf: 'center' }}>{inspection.inspectionDate.toDateString()}</span>
                                    <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/inspections/${inspection.id}`) }} style={{ width: 80 }}>View</Button>
                                </div>
                            )) : <div style={{ marginTop: 15 }}>No completed inspections</div>}</td>
                            <td className='M-table-td'>
                                <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/units/${unit.id}`) }} style={{ width: 80, marginRight: 10, marginTop: 5, marginBottom: 5 }}>View</Button>
                                <Button variant="danger" type="button" onClick={() => { setUnitToDelete(unit); setDeleteUnitPopupVisible(true); }} style={{ width: 100 }}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Building;