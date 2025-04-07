import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';
import { IoIosArrowBack } from 'react-icons/io';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { IBuilding, IInspection } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Unit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { units, inspections } = useRequests();
    const [inEditMode, setInEditMode] = useState(false);
    const [number, setNumber] = useState('');
    const [building, setBuilding] = useState<IBuilding>();
    const [inspectionsList, setInspectionsList] = useState<IInspection[]>([]);
    const [filteredInspections, setFilteredInspections] = useState<IInspection[]>([]);
    const [deleteUnitPopupVisible, setDeleteUnitPopupVisible] = useState(false);
    const [dateSerachQuery, setDateSearchQuery] = useState('');
    const [engineerSearchQuery, setEngineerSearchQuery] = useState('');
    const [statusSearchQuery, setStatusSearchQuery] = useState('');
    const [deleteInspectionPopupVisible, setDeleteInspectionPopupVisible] = useState(false);
    const [inspectionToDelete, setInspectionToDelete] = useState<IInspection>();

    const deleteUnit = async () => {
        if (!id) {
            return;
        }
        setDeleteUnitPopupVisible(false);
        if (!await units.delete(id)) {
            console.log('Failed to delete unit');
            return;
        }
        console.log('Unit deleted successfully');
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
        if (inspectionsList.length === 1) {
            goBack();
            return;
        }
        fetchUnitInfo();
    }

    const fetchUnitInfo = useCallback(async (abort?: AbortController) => {
        if (!id) {
            return;
        }
        const result = await units.view(id, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch unit info');
            return;
        }
        setNumber(result.number);
        setBuilding(result.building);
        setInspectionsList(result.inspections);
        setFilteredInspections(result.inspections);
        console.log('Unit info fetched successfully');
    }, [id, units]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            return;
        }
        setInEditMode(false);

        const result = await units.edit(id, number);
        if (!result) {
            console.log('Failed to edit unit');
            return;
        }
        console.log('Unit edited successfully');
    }

    const handleSearch = (catagory: 'date' | 'engineer' | 'status', query: string) => {
        switch (catagory) {
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
                case 'date':
                    if (query === '') {
                        return true;
                    }
                    return item.inspectionDate?.toLocaleString().split('T')[0] === query;
                case 'engineer':
                    if (query === '') {
                        return true;
                    }
                    return item.engineer ? `${item.engineer.firstName} ${item.engineer.lastName}`.toLowerCase().includes(query.toLowerCase()) : false;
                case 'status':
                    if (query === '') {
                        return true;
                    }
                    return item.status.toLowerCase() === query.toLowerCase();
                default:
                    return false;
            }
        });
        setFilteredInspections(filteredItems);
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchUnitInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchUnitInfo]);

    const goBack = () => {
        navigate(-1);
    }

    const cancel = () => {
        setInEditMode(false);
        fetchUnitInfo();
    }

    return (
        <div className='M-container'>
            {/* Delete Unit Popup */}
            <Popup
                visible={deleteUnitPopupVisible}
                onRequestClose={() => { setDeleteUnitPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete Unit ${number}?`}</span>
                    <br /><span className="M-text-danger">NOTE: This will also delete:</span>
                    <br /><span className="M-text-danger">- All inspections associated with this unit</span>
                    <br /><span className="M-text-danger">- All photos associated with those inspections</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteUnit() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteUnitPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Delete Inspection Popup */}
            <Popup
                visible={deleteInspectionPopupVisible}
                onRequestClose={() => { setDeleteInspectionPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete the Inspection performed by ${inspectionToDelete?.engineer.firstName} ${inspectionToDelete?.engineer.lastName}?`}</span>
                    <br /><span className="M-text-danger">NOTE: This will also delete:</span>
                    <br /><span className="M-text-danger">- All photos associated with this inspection</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteInspection() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteInspectionPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>{`Unit ${number} in ${building?.name}`}</h1>
            {/* Unit Info */}
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
                                    <span id='number' className='M-section-text M-text-color'>Unit Number</span>
                                    <label htmlFor="number" className='hidden-label'>Unit Number</label>
                                    <Input
                                        type="text"
                                        value={number}
                                        variant={'secondary'}
                                        onChange={(e) => setNumber(e.target.value)}
                                        style={{ width: 100 }}
                                    />
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Building</span>
                                    <span className='M-section-text M-text-color'>{building?.name}, {building?.address}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="submit">Submit</Button>
                            <Button variant="danger" type="button" onClick={() => cancel()}>Cancel</Button>
                        </div>
                    </form>
                    :
                    <>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color'>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Unit Number</span>
                                    <span className='M-section-text M-text-color'>{number}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Building</span>
                                    <span className='M-section-text M-text-color'>{building?.name}, {building?.address}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={() => setInEditMode(true)}>Edit Unit</Button>
                            <Button variant="danger" type="button" onClick={() => { setDeleteUnitPopupVisible(true); }}>Delete Unit</Button>
                        </div>
                    </>
            }
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspections List</h2>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Date</th>
                        <th className='M-table-th M-section-header M-text-color'>Engineer</th>
                        <th className='M-table-th M-section-header M-text-color'>Status</th>
                        <th className='M-table-th M-section-header M-text-color'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
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
                                <option value="started" className="M-section-text M-text-color" selected={statusSearchQuery === 'started'}>Started</option>
                                <option value="not-started" className="M-section-text M-text-color" selected={statusSearchQuery === 'not-started'}>Not Started</option>
                            </select>
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        </td>
                    </tr>
                    {filteredInspections.map((inspection, index) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{inspection.inspectionDate ? inspection.inspectionDate.toLocaleString().split('T')[0] : 'Not inspected'}</td>
                            <td className='M-table-td M-section-text M-text-color'>{inspection.engineer.firstName} {inspection.engineer.lastName}</td>
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

export default Unit;