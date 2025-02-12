import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { useRequests } from "../../context/RequestsContext";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

function BuildingCreate() {
    const navigate = useNavigate();
    const { buildings } = useRequests();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!await buildings.create(name, address)) {
            console.log('Failed to create building');
            return;
        }
        console.log('Building created successfully');
        goBack();
    }

    const goBack = () => {
        navigate('/auth/buildings');
    }

    return (
        <div className='M-container'>
            {/* Title */}
            <h1 className='M-title'>Creating New Building</h1>
            {/* Building Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
            <form onSubmit={handleSubmit}>
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                    <Button variant="secondary" type="submit">Submit</Button>
                    <Button variant="danger" type="button" onClick={goBack}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}

export default BuildingCreate;