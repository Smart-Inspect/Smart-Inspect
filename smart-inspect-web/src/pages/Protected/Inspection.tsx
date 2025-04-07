import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';
import { IoIosArrowBack } from 'react-icons/io';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { IImage, IMetric, IProject, IUnit, IUser } from '../../utils/types';
import Popup from '../../components/Popup/Popup';

function Inspection() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { inspections } = useRequests();
    const [inEditMode, setInEditMode] = useState(false);
    const [engineer, setEngineer] = useState<IUser>();
    const [unit, setUnit] = useState<IUnit>();
    const [project, setProject] = useState<IProject>();
    const [inspectionDate, setInspectionDate] = useState<string>();
    const [layout, setLayout] = useState<IImage>();
    const [notes, setNotes] = useState<string>('');
    const [photos, setPhotos] = useState<IImage[]>([]);
    const [editPhotos, setEditPhotos] = useState<IImage[]>([]);
    const [metricsList, setMetricsList] = useState<IMetric[]>([]);
    const [filteredMetricsList, setFilteredMetricsList] = useState<IMetric[]>([]);
    const [status] = useState<'completed' | 'started' | 'not-started'>('not-started');
    const [layoutLoaded, setLayoutLoaded] = useState(false);
    const [photosLoaded, setPhotosLoaded] = useState(false);
    const [deleteInspectionPopupVisible, setDeleteInspectionPopupVisible] = useState(false);
    const [nameSearchQuery, setNameSearchQuery] = useState('');
    const [typeSearchQuery, setTypeSearchQuery] = useState('');
    const [valueSearchQuery, setValueSearchQuery] = useState('');

    const deleteInspection = async () => {
        if (!id) {
            return;
        }
        setDeleteInspectionPopupVisible(false);
        if (!await inspections.delete(id)) {
            console.log('Failed to delete inspection');
            return;
        }
        console.log('Inspection deleted successfully');
        goBack();
    }

    const openEditMode = () => {
        setEditPhotos(photos);
        setInEditMode(true);
    }

    const handleSearch = (catagory: 'name' | 'type' | 'value', query: string) => {
        switch (catagory) {
            case 'name':
                setNameSearchQuery(query);
                break;
            case 'type':
                setTypeSearchQuery(query);
                break;
            case 'value':
                setValueSearchQuery(query);
                break;
            default:
                return;
        }
        const filteredItems = metricsList.filter(metric => {
            switch (catagory) {
                case 'name':
                    return metric.name.toLowerCase().includes(query.toLowerCase());
                case 'type':
                    const metricsSchema = project?.metricsSchema.find(({ name }) => name === metric.name);
                    return metricsSchema?.fieldType.toLowerCase().includes(query.toLowerCase());
                case 'value':
                    return metric.value?.toString().toLowerCase().includes(query.toString().toLowerCase());
                default:
                    return false;
            }
        });
        setFilteredMetricsList(filteredItems);
    }

    const fetchInspectionInfo = useCallback(async (abort?: AbortController) => {
        if (!id) {
            return;
        }
        const result = await inspections.view(id, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch inspection info');
            return;
        }
        setEngineer(result.engineer);
        setUnit(result.unit);
        setProject(result.project);
        setMetricsList(result.metrics);
        setFilteredMetricsList(result.metrics);
        const dateStr = new Date(parseInt(result.inspectionDate)).toLocaleString();
        if (dateStr !== 'Invalid Date') {
            setInspectionDate(dateStr);
        } else {
            setInspectionDate('N/A');
        }
        setNotes(result.notes);
        if (result.layout) {
            const imgResult = await inspections.downloadLayout(id, abort);
            if (imgResult === 'abort') {
                return;
            }
            if (imgResult === 'fail') {
                console.log('Failed to fetch layout');
                return;
            }
            const imgURL = URL.createObjectURL(imgResult);
            result.layout.url = imgURL;
            setLayout(result.layout);
        }
        setLayoutLoaded(true);
        if (result.photos.length !== 0) {
            for (let i = 0; i < result.photos.length; i++) {
                const imgResult = await inspections.downloadPhoto(id, result.photos[i].id, abort);
                if (imgResult === 'abort') {
                    return;
                }
                if (imgResult === 'fail') {
                    console.log('Failed to fetch photos');
                    return;
                }
                const imgURL = URL.createObjectURL(imgResult);
                result.photos[i].url = imgURL;
                result.photos[i].timestamp = new Date(parseInt(result.photos[i].timestamp));
                result.photos[i].uploadedAt = new Date(parseInt(result.photos[i].uploadedAt));
            }
            setPhotos(result.photos);
        }
        setPhotosLoaded(true);
        console.log('Inspection info fetched successfully');
    }, [inspections, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            return;
        }
        setInEditMode(false);

        const result = await inspections.edit(id, notes, status);
        if (!result) {
            console.log('Failed to edit inspection');
            return;
        }
        console.log('Inspection edited successfully');

        if (photos.length !== editPhotos.length) {
            const deletedPhotos = photos.filter((photo) => !editPhotos.includes(photo));
            const photoResult = await inspections.deletePhotos(id, deletedPhotos.map(({ id }) => id));
            if (!photoResult) {
                console.log('Failed to delete photos');
                return;
            }
            console.log('Photos deleted', deletedPhotos);
        }

        await fetchInspectionInfo(new AbortController());
        setPhotos(editPhotos);
    }

    const removePhoto = (index: number) => {
        const newPhotos = [] as IImage[];
        editPhotos.forEach((photo, i) => {
            if (i !== index) {
                newPhotos.push(photo);
            }
        });
        setEditPhotos(newPhotos);
    }

    const cancel = () => {
        setInEditMode(false);
        fetchInspectionInfo(new AbortController());
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchInspectionInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchInspectionInfo]);

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div className='M-container'>
            {/* Delete Inspection Popup */}
            <Popup
                visible={deleteInspectionPopupVisible}
                onRequestClose={() => { setDeleteInspectionPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete the Inspection on Unit ${unit?.number} by ${engineer ? `${engineer?.firstName} ${engineer?.lastName}` : 'Deleted User'}?`}</span>
                    <br /><span className="M-text-danger">NOTE: This will also delete:</span>
                    <br /><span className="M-text-danger">- All photos associated with this inspection</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteInspection() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteInspectionPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>{`Inspection on Unit ${unit?.number} by ${engineer ? `${engineer?.firstName} ${engineer?.lastName}` : 'Deleted User'}`}</h1>
            {/* Inspection Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
            {
                inEditMode ?
                    <form onSubmit={handleSubmit} style={{ paddingBottom: 20 }}>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Unit Number</span>
                                    <span className='M-section-text M-text-color'>{unit?.number}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Assigned Engineer</span>
                                    <span className='M-section-text M-text-color'>{engineer ? `${engineer?.firstName} ${engineer?.lastName}` : 'Deleted User'}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Project</span>
                                    <span className='M-section-text M-text-color'>{project?.name}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Inspection Date</span>
                                    <span className='M-section-text M-text-color'>{inspectionDate}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <label htmlFor="layout" className='hidden-label'>Layout</label>
                                    <span id='layout' className='M-section-text M-text-color'>Layout</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {!layout ?
                                            <span className='M-section-text M-text-danger' style={{ marginRight: 'auto' }}>{layoutLoaded ? "No layout picked" : "Loading..."}</span>
                                            :
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: 1000 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <a href={layout.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                        <img src={layout.url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                    </a>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Status</span>
                                    <span className='M-section-text M-text-color'>{status === 'completed' ? 'Completed' : 'Not Started'}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Notes</span>
                                    <label htmlFor="notes" className='hidden-label'>Notes</label>
                                    <Input
                                        variant='secondary'
                                        type="text"
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => { setNotes(e.target.value) }}
                                        placeholder="Notes"
                                    />
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspection Photos</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Photos</span>
                                    <label htmlFor="photos" className='hidden-label'>Photos</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                            {editPhotos.length === 0 && <span className='M-section-text M-text-danger' style={{ marginLeft: 'auto' }}>{photosLoaded ? "No photos uploaded" : "Loading..."}</span>}
                                            {editPhotos.map(({ url, caption, timestamp }, index) => (
                                                <div key={index} style={{ display: 'flex', flexDirection: 'row', gap: 50 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', alignSelf: 'center' }}>
                                                            <img id={`image-${index}`} src={url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                        </a>
                                                        <label htmlFor={`image-${index}`} className='M-text-color' style={{ textAlign: 'center', maxWidth: 500 }}><b>Taken at: {timestamp.toLocaleString()}</b></label>
                                                        <label htmlFor={`image-${index}`} className='M-text-color' style={{ textAlign: 'center', maxWidth: 500 }}><i>{caption}</i></label>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto' }}>
                                                        <Button variant="danger" type="button" onClick={() => { removePhoto(index) }}>Remove</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
                            <Button variant="secondary" type="submit">Submit</Button>
                            <Button variant="danger" type="button" onClick={() => cancel()}>Cancel</Button>
                        </div>
                    </form>
                    :
                    <>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>General Information</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Unit Number</span>
                                    <span className='M-section-text M-text-color'>{unit?.number}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Assigned Engineer</span>
                                    <span className='M-section-text M-text-color'>{engineer ? `${engineer?.firstName} ${engineer?.lastName}` : 'Deleted User'}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Project</span>
                                    <span className='M-section-text M-text-color'>{project?.name}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Inspection Date</span>
                                    <span className='M-section-text M-text-color'>{inspectionDate}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <label htmlFor="layout" className='hidden-label'>Layout</label>
                                    <span id='layout' className='M-section-text M-text-color'>Layout</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {!layout ?
                                            <span className='M-section-text M-text-danger' style={{ marginRight: 'auto' }}>{layoutLoaded ? "No layout picked" : "Loading..."}</span>
                                            :
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: 1000 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <a href={layout.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                        <img src={layout.url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                    </a>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Status</span>
                                    <span className='M-section-text M-text-color'>{status === 'completed' ? 'Completed' : 'Not Started'}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Notes</span>
                                    <span className='M-section-text M-text-color'>{notes ?? 'N/A'}</span>
                                </span>
                            </div>
                        </div>
                        <h2 className='M-section-header' style={{ marginBottom: 30 }}>Inspection Photos</h2>
                        <div className='M-section M-border-color' style={{ marginBottom: 50 }}>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <label htmlFor="photos" className='hidden-label'>Photos</label>
                                    <span id='photos' className='M-section-text M-text-color'>Photos</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                                        {photos.length === 0 && <span className='M-section-text M-text-danger' style={{ marginLeft: 'auto' }}>{photosLoaded ? "No photos uploaded" : "Loading..."}</span>}
                                        {photos.map(({ url, caption, timestamp }, index) => (
                                            <div key={index} style={{ display: 'flex', flexDirection: 'row', gap: 1000 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', alignSelf: 'center' }}>
                                                        <img src={url} alt='Layout' className="M-border-color" style={{ width: 300 }} />
                                                    </a>
                                                    <label htmlFor={`image-${index}`} className='M-text-color' style={{ textAlign: 'center', maxWidth: 500 }}><b>Taken at: {timestamp.toLocaleString()}</b></label>
                                                    <label htmlFor={`image-${index}`} className='M-text-color' style={{ textAlign: 'center', maxWidth: 500 }}><i>{caption}</i></label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={openEditMode}>Edit Inspection</Button>
                            <Button variant="danger" type="button" onClick={() => { setDeleteInspectionPopupVisible(true); }}>Delete Inspection</Button>
                        </div>
                    </>
            }
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Metrics List</h2>
            <table className='M-table M-section M-border-color' style={{ marginBottom: 25 }}>
                <thead>
                    <tr className='M-table-tr'>
                        <th className='M-table-th M-section-header M-text-color'>Metric Name</th>
                        <th className='M-table-th M-section-header M-text-color'>Metric Type</th>
                        <th className='M-table-th M-section-header M-text-color'>Metric Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='M-table-tr'>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="name" className='hidden-label'>Name</label>
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
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="type" className='hidden-label'>Type</label>
                            <select name="type" id="type" className="M-dropdown" required onChange={(e) => { handleSearch('type', e.target.value) }}>
                                <option value="" disabled className="M-section-text M-text-color">Sort by type...</option>
                                <option value="" className="M-section-text M-text-color" selected={typeSearchQuery === ''}>All</option>
                                <option value="text" className="M-section-text M-text-color" selected={typeSearchQuery === 'text'}>Text</option>
                                <option value="number" className="M-section-text M-text-color" selected={typeSearchQuery === 'number'}>Number</option>
                            </select>
                        </td>
                        <td className='M-table-td M-section-header M-text-color' style={{ maxWidth: 175 }}>
                            <label htmlFor="value" className='hidden-label'>Value</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="value"
                                value={valueSearchQuery}
                                onChange={(e) => { handleSearch('value', e.target.value) }}
                                placeholder="Sort by value..."
                                required
                                className='M-table-input'
                            />
                        </td>
                        <td className='M-table-td' style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        </td>
                    </tr>
                    {filteredMetricsList.map((metric, index) => (
                        <tr className='M-table-tr'>
                            <td className='M-table-td M-section-text M-text-color'>{metric.name}</td>
                            <td className='M-table-td M-section-text M-text-color'>{project?.metricsSchema.find(m => m.name === metric.name)?.fieldType === "text" ? "Text" : "Number"}</td>
                            <td className='M-table-td M-section-text M-text-color'>{metric.value ? typeof metric.value === 'string' ? metric.value.charAt(0).toUpperCase() + metric.value.slice(1) : metric.value : 'No Value'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Inspection;