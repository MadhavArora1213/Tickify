import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToS3 } from '../../services/s3Service';
import toast from 'react-hot-toast';

const CreateEvent = () => {
    const { currentUser } = useAuth();
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingEvent, setFetchingEvent] = useState(false);
    const [error, setError] = useState('');
    const [paintMode, setPaintMode] = useState('select'); // 'select' or 'paint_ticket'
    const [selectedTicketForPaint, setSelectedTicketForPaint] = useState(0);

    const isEditMode = Boolean(eventId);

    // --- Form State ---
    const [formData, setFormData] = useState({
        // Stage 1: Basic
        eventTitle: '',
        eventDescription: '',
        category: 'Music',
        eventType: 'Offline', // 'Online', 'Offline', 'Hybrid'
        eventCode: '', // Auto-generated: YYYYMMDD + TYPE + SEQ
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        registrationEndDate: '',
        registrationEndTime: '',

        // Stage 2: Venue & Seating
        venueName: '',
        venueAddress: '',
        city: '',
        state: '',
        zipCode: '',
        onlinePlatform: '', // For online/hybrid events
        meetingLink: '', // For online/hybrid events
        seatingType: 'Open', // 'Open' or 'Reserved'

        // Reserved Seating Config
        totalRows: 10,
        seatsPerRow: 10,
        seatLabelFormat: 'A1-A10', // Just a string for now
        seatingGrid: [], // 2D Array: { id, rowLabel, colLabel, type: 'seat'|'aisle'|'blocked', priceTier: 'default' }
        totalCapacity: 0,

        // Stage 3 & Tickets - Added color field with defaults
        tickets: [
            { name: 'General Admission', price: 0, quantity: 100, description: '', color: '#10B981' }
        ],

        // Stage 4: Compliance
        panNumber: '',
        gstNumber: '',
        govtIdType: 'Aadhar',
        govtIdNumber: '',
        idProofFile: null, // File object
        bannerImageFile: null, // File object

        // Status
        status: 'pending',

        // Ticket ID Settings
        ticketPrefix: '',
        ticketPadding: 0
    });

    // Default ticket colors palette
    const ticketColorPalette = [
        { name: 'Green', value: '#10B981' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Gold/VIP', value: '#F59E0B' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Teal', value: '#14B8A6' },
    ];

    // --- Fetch Existing Event for Edit Mode ---
    useEffect(() => {
        const fetchEventData = async () => {
            if (!isEditMode || !eventId) return;

            setFetchingEvent(true);
            try {
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    const data = eventSnap.data();
                    // Parse seatingGrid back from JSON string
                    let parsedGrid = [];
                    if (data.seatingGrid) {
                        try {
                            parsedGrid = JSON.parse(data.seatingGrid);
                        } catch (e) {
                            console.warn('Could not parse seating grid');
                        }
                    }

                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        seatingGrid: parsedGrid,
                        // Don't overwrite file objects
                        bannerImageFile: null,
                        idProofFile: null,
                    }));
                } else {
                    setError('Event not found.');
                }
            } catch (err) {
                toast.error('Failed to load event data.');
                setError('Failed to load event data.');
            } finally {
                setFetchingEvent(false);
            }
        };

        fetchEventData();
    }, [eventId, isEditMode]);

    // --- Seating Grid Logic ---
    useEffect(() => {
        if (formData.seatingType === 'Reserved' && !isEditMode) {
            generateGrid();
        }
    }, [formData.totalRows, formData.seatsPerRow, formData.seatingType]);

    const generateGrid = () => {
        // Only regenerate if dimensions change drastically or init
        // Preserving existing gaps would be ideal but complex for this MVP. 
        // We'll regenerate a fresh grid for now if dimensions change.

        const newGrid = [];
        let capacity = 0;
        const rows = parseInt(formData.totalRows) || 0;
        const cols = parseInt(formData.seatsPerRow) || 0;

        for (let r = 0; r < rows; r++) {
            const rowArr = [];
            const rowChar = String.fromCharCode(65 + r); // A, B, C...
            for (let c = 0; c < cols; c++) {
                rowArr.push({
                    id: `${r}-${c}`,
                    row: r,
                    col: c,
                    label: `${rowChar}${c + 1}`,
                    type: 'seat', // Default all to seats
                });
                capacity++;
            }
            newGrid.push(rowArr);
        }

        // Check if we can preserve old grid data (if just resizing)
        // For simplicity in this prompt, we overwrite. 
        setFormData(prev => ({
            ...prev,
            seatingGrid: newGrid,
            totalCapacity: capacity
        }));
    };

    // Left-click: Toggle seat type OR Paint ticket
    const toggleSeatType = (r, c) => {
        setFormData(prev => {
            const newGrid = [...prev.seatingGrid];

            if (paintMode === 'paint_ticket') {
                // Paint Mode: Set to seat and assign specific ticket
                newGrid[r][c] = {
                    ...newGrid[r][c],
                    type: 'seat',
                    ticketTypeIndex: selectedTicketForPaint
                };
            } else {
                // Cycle Mode: Seat types -> Aisle -> Blocked -> Seat type 1
                const currentSeat = newGrid[r][c];
                const currentType = currentSeat.type;
                const currentTicketIndex = currentSeat.ticketTypeIndex || 0;
                const totalTickets = prev.tickets.length;

                if (currentType === 'seat') {
                    if (currentTicketIndex < totalTickets - 1) {
                        // Move to next ticket type
                        newGrid[r][c] = {
                            ...currentSeat,
                            ticketTypeIndex: currentTicketIndex + 1
                        };
                    } else {
                        // End of tickets -> Aisle
                        newGrid[r][c] = { ...currentSeat, type: 'aisle' };
                    }
                } else if (currentType === 'aisle') {
                    // Aisle -> Blocked
                    newGrid[r][c] = { ...currentSeat, type: 'blocked' };
                } else {
                    // Blocked -> First Ticket
                    newGrid[r][c] = { ...currentSeat, type: 'seat', ticketTypeIndex: 0 };
                }
            }

            let newCapacity = 0;
            newGrid.forEach(row => row.forEach(seat => {
                if (seat.type === 'seat') newCapacity++;
            }));

            return { ...prev, seatingGrid: newGrid, totalCapacity: newCapacity };
        });
    };



    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
        }));
    };

    const handleComplianceChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value.toUpperCase(); // Force uppercase for IDs

        // Specific constraints
        if (name === 'panNumber' && finalValue.length > 10) return;
        if (name === 'gstNumber' && finalValue.length > 15) return;

        if (name === 'govtIdNumber') {
            if (formData.govtIdType === 'Aadhar Card') {
                finalValue = value.replace(/\D/g, ''); // Numbers only
                if (finalValue.length > 12) return;
            }
            if (formData.govtIdType === 'Passport' && finalValue.length > 8) return;
            if (formData.govtIdType === 'Voter ID' && finalValue.length > 10) return;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleTicketChange = (index, field, value) => {
        const newTickets = [...formData.tickets];
        newTickets[index][field] = value;
        setFormData(prev => ({ ...prev, tickets: newTickets }));
    };

    const addTicketType = () => {
        // Pick next color from palette based on current ticket count
        const nextColorIndex = formData.tickets.length % ticketColorPalette.length;
        const nextColor = ticketColorPalette[nextColorIndex].value;

        setFormData(prev => ({
            ...prev,
            tickets: [...prev.tickets, { name: '', price: 0, quantity: 0, description: '', color: nextColor }]
        }));
    };

    const removeTicketType = (index) => {
        const newTickets = formData.tickets.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, tickets: newTickets }));
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.eventTitle || !formData.startDate || !formData.startTime || !formData.registrationEndDate) {
                setError('Please fill in all required basic details and registration deadline.');
                return false;
            }
        }
        if (step === 2) { // Step 2 is Tickets (renderStep3)
            if (!formData.tickets || formData.tickets.length === 0) {
                setError('At least one ticket type is required.');
                return false;
            }
            const hasInvalidTicket = formData.tickets.some(t => !t.name || t.quantity <= 0);
            if (hasInvalidTicket) {
                setError('Please provide a name and quantity for all ticket types.');
                return false;
            }
        }
        if (step === 3) { // Step 3 is Venue & Seating (renderStep2)
            if (formData.eventType !== 'Online') {
                if (!formData.venueName || !formData.city) {
                    setError('Venue name and City are required for offline/hybrid events.');
                    return false;
                }
            } else {
                if (!formData.onlinePlatform) {
                    setError('Please select an online platform.');
                    return false;
                }
            }

            if (formData.seatingType === 'Reserved' && formData.totalCapacity === 0) {
                setError('Please configure the seating grid.');
                return false;
            }
        }
        if (step === 4) { // Compliance
            const { panNumber, gstNumber, govtIdType, govtIdNumber, idProofFile } = formData;

            // PAN Validation
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(panNumber)) {
                setError('Invalid PAN Number. Must be 10 characters (5 Letters, 4 Numbers, 1 Letter).');
                return false;
            }

            // GST Validation
            if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)) {
                setError('Invalid GST Number. Must be 15 characters standard format.');
                return false;
            }

            // Govt ID Validation
            if (!govtIdNumber) {
                setError('Government ID Number is required.');
                return false;
            }

            if (govtIdType === 'Aadhar Card') {
                if (!/^\d{12}$/.test(govtIdNumber)) {
                    setError('Invalid Aadhar Number. Must be exactly 12 digits.');
                    return false;
                }
            } else if (govtIdType === 'Passport') {
                if (!/^[A-Z][0-9]{7}$/.test(govtIdNumber)) {
                    setError('Invalid Passport Number. Format: 1 Letter + 7 Digits.');
                    return false;
                }
            } else if (govtIdType === 'Voter ID') {
                if (!/^[A-Z]{3}[0-9]{7}$/.test(govtIdNumber)) {
                    setError('Invalid Voter ID. Format: 3 Letters + 7 Digits.');
                    return false;
                }
            } else if (govtIdType === 'Driving License') {
                if (govtIdNumber.length < 15) {
                    setError('Driving License number seems too short.');
                    return false;
                }
            }

            if (!idProofFile) {
                setError('Please upload an ID Proof document.');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) setStep(prev => prev + 1);
    };

    const handlePrev = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setLoading(true);
        try {
            // Upload Images to AWS S3
            let bannerUrl = '';
            let idProofUrl = '';

            if (formData.bannerImageFile) {
                bannerUrl = await uploadToS3(formData.bannerImageFile, 'events/banners');
            }

            if (formData.idProofFile) {
                idProofUrl = await uploadToS3(formData.idProofFile, 'organizers/id_proofs');
            }

            // Generate/Update Ticket numbering settings
            let ticketPrefix = formData.ticketPrefix;
            const capacity = formData.totalCapacity || formData.tickets.reduce((sum, t) => sum + parseInt(t.quantity || 0), 0);
            const padLength = formData.ticketPadding || 3;

            if (!ticketPrefix) {
                const dateStr = (formData.startDate || '').replace(/-/g, '');
                const typeCode = formData.eventType === 'Online' ? 'ON' :
                    formData.eventType === 'Hybrid' ? 'HYB' : 'OFF';
                ticketPrefix = `${dateStr}${typeCode}`;
            }

            const firstCategory = formData.tickets[0]?.name?.substring(0, 3).toUpperCase() || 'GEN';
            const lastCategory = formData.tickets[formData.tickets.length - 1]?.name?.substring(0, 3).toUpperCase() || 'GEN';

            const eventCodeFirst = `${ticketPrefix}${String(1).padStart(padLength, '0')}${firstCategory}`;
            const eventCodeLast = `${ticketPrefix}${String(capacity).padStart(padLength, '0')}${lastCategory}`;

            // Preparing data
            const eventData = {
                organizerId: currentUser.uid,
                ...formData,
                ticketPrefix,
                ticketPadding: padLength,
                eventCodeFirst,
                eventCodeLast,
                category: formData.category === 'Other' ? (formData.customCategory || 'Other') : formData.category,
                // Serialize 2D grid to JSON string to avoid Firestore "Nested arrays" error
                seatingGrid: JSON.stringify(formData.seatingGrid),
                // Remove file objects before saving to Firestore
                idProofFile: null,
                bannerImageFile: null,
                bannerUrl: bannerUrl || formData.bannerUrl || 'https://via.placeholder.com/1200x600',
                idProofUrl: idProofUrl || formData.idProofUrl || '',
                updatedAt: serverTimestamp(),
            };

            if (isEditMode) {
                // Update existing event
                const eventRef = doc(db, 'events', eventId);
                await updateDoc(eventRef, eventData);
            } else {
                // Create new event
                eventData.createdAt = serverTimestamp();
                eventData.approvalStatus = 'pending';
                eventData.settlementEnabled = false;
                const docRef = await addDoc(collection(db, 'events'), eventData);

                // Create Notification for Admin
                await addDoc(collection(db, 'notifications'), {
                    recipient: 'admin',
                    type: 'event_pending',
                    message: `New event pending approval: ${eventData.eventTitle}`,
                    eventId: docRef.id,
                    organizerId: currentUser.uid,
                    read: false,
                    createdAt: serverTimestamp()
                });
            }

            navigate('/organizer/dashboard'); // Success redirect
        } catch (err) {
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event`);
            setError(`Failed to ${isEditMode ? 'update' : 'create'} event: ` + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 1: Basic Event Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Event Name *</label>
                    <input name="eventTitle" value={formData.eventTitle} onChange={handleInputChange} type="text" placeholder="e.g. Neon Nights Festival" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Event Description</label>
                    <textarea name="eventDescription" value={formData.eventDescription} onChange={handleInputChange} rows="3" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"></textarea>
                </div>
                <div>
                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold">
                        <option>Music</option>
                        <option>Tech</option>
                        <option>Art</option>
                        <option>Workshop</option>
                        <option>Comedy</option>
                        <option>Sports</option>
                        <option>Theater</option>
                        <option>Food & Drink</option>
                        <option>Networking</option>
                        <option>Other</option>
                    </select>
                </div>
                {formData.category === 'Other' && (
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Specify Category</label>
                        <input name="customCategory" value={formData.customCategory || ''} onChange={(e) => setFormData(p => ({ ...p, customCategory: e.target.value }))} type="text" placeholder="Enter custom category" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                    </div>
                )}

                {/* Event Type - Online/Offline/Hybrid */}
                <div>
                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-2">Event Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['Offline', 'Online', 'Hybrid'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, eventType: type }))}
                                className={`p-4 border-2 border-[var(--color-text-primary)] font-bold uppercase text-sm transition-all ${formData.eventType === type
                                    ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-none'
                                    : 'bg-[var(--color-bg-surface)] shadow-[4px_4px_0_var(--color-text-primary)] hover:shadow-[2px_2px_0_var(--color-text-primary)] hover:translate-x-[2px] hover:translate-y-[2px]'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">
                                    {type === 'Offline' ? '🏟️' : type === 'Online' ? '💻' : '🔄'}
                                </span>
                                {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {formData.eventType === 'Online' && '📍 No physical venue needed. Attendees join via link.'}
                        {formData.eventType === 'Offline' && '📍 Physical venue with seating options.'}
                        {formData.eventType === 'Hybrid' && '📍 Both physical venue and online streaming.'}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Start Date *</label>
                        <input name="startDate" value={formData.startDate} onChange={handleInputChange} type="date" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Start Time *</label>
                        <input name="startTime" value={formData.startTime} onChange={handleInputChange} type="time" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">End Date</label>
                        <input name="endDate" value={formData.endDate} onChange={handleInputChange} type="date" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">End Time</label>
                        <input name="endTime" value={formData.endTime} onChange={handleInputChange} type="time" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                    </div>
                </div>

                {/* Registration Deadline */}
                <div className="p-4 bg-[var(--color-accent-secondary)]/10 border-2 border-dashed border-[var(--color-accent-secondary)] rounded-xl space-y-4">
                    <h3 className="font-black uppercase text-sm flex items-center gap-2">
                        ⏳ Registration Deadline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Reg. End Date *</label>
                            <input name="registrationEndDate" value={formData.registrationEndDate} onChange={handleInputChange} type="date" className="w-full neo-input bg-white border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            <p className="text-[10px] font-bold text-gray-500 mt-1">When tickets stop being available</p>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Reg. End Time *</label>
                            <input name="registrationEndTime" value={formData.registrationEndTime} onChange={handleInputChange} type="time" className="w-full neo-input bg-white border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">
                Step 3: {formData.eventType === 'Online' ? 'Platform Details' : 'Venue & Seating'}
            </h2>

            {/* Online Event Fields */}
            {(formData.eventType === 'Online' || formData.eventType === 'Hybrid') && (
                <div className="space-y-4 p-4 bg-blue-50 border-2 border-blue-300 mb-4">
                    <h3 className="font-black uppercase text-lg text-blue-800">💻 Online Event Details</h3>
                    <div>
                        <label className="block text-xs font-black uppercase text-blue-600 mb-1">Platform</label>
                        <select name="onlinePlatform" value={formData.onlinePlatform} onChange={handleInputChange} className="w-full neo-input bg-white border-2 border-blue-500 px-4 py-3 font-bold">
                            <option value="">Select Platform</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Microsoft Teams">Microsoft Teams</option>
                            <option value="YouTube Live">YouTube Live</option>
                            <option value="Custom">Custom / Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-blue-600 mb-1">Meeting / Stream Link</label>
                        <input name="meetingLink" value={formData.meetingLink} onChange={handleInputChange} type="url" placeholder="https://zoom.us/j/..." className="w-full neo-input bg-white border-2 border-blue-500 px-4 py-3 font-bold" />
                        <p className="text-xs text-blue-600 mt-1">This link will be shared with ticket holders</p>
                    </div>
                </div>
            )}

            {/* Venue Details - Only for Offline/Hybrid */}
            {(formData.eventType === 'Offline' || formData.eventType === 'Hybrid') && (
                <>
                    <div className="space-y-4 border-b-2 border-dashed border-[var(--color-text-primary)] pb-6">
                        <h3 className="font-black uppercase text-lg">🏟️ Physical Venue</h3>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Venue Name</label>
                            <input name="venueName" value={formData.venueName} onChange={handleInputChange} type="text" placeholder="e.g. Madison Square Garden" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Address</label>
                            <input name="venueAddress" value={formData.venueAddress} onChange={handleInputChange} type="text" placeholder="Street Address" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">City</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">State</label>
                                <input name="state" value={formData.state} onChange={handleInputChange} type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Zip</label>
                                <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Seating Configuration */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xl">🪑 Seating Configuration</h3>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Seating Type</label>
                            <select name="seatingType" value={formData.seatingType} onChange={handleInputChange} className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold">
                                <option value="Open">Open / General Admission (Standing)</option>
                                <option value="Reserved">Reserved Seating (Rows & Cols)</option>
                            </select>
                        </div>

                        {formData.seatingType === 'Reserved' && (
                            <div className="mt-4 flex flex-col md:flex-row gap-6">
                                {/* Left Side: Controls */}
                                <div className="w-full md:w-1/3 space-y-4 bg-gray-50 p-4 border-2 border-dashed border-gray-400">

                                    {/* Interaction Mode Toolbar */}
                                    <div className="bg-white border-2 border-gray-300 p-3 shadow-sm">
                                        <h4 className="font-black uppercase text-xs text-gray-500 mb-2">🖱️ Click Action</h4>
                                        <div className="flex gap-2 mb-3">
                                            <button
                                                type="button"
                                                key="mode-select"
                                                onClick={() => setPaintMode('select')}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase border-2 transition-all ${paintMode === 'select' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-black'}`}
                                            >
                                                Cycle Status
                                            </button>
                                            <button
                                                type="button"
                                                key="mode-paint"
                                                onClick={() => setPaintMode('paint_ticket')}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase border-2 transition-all ${paintMode === 'paint_ticket' ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0_black]' : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-black'}`}
                                            >
                                                Assign Ticket
                                            </button>
                                        </div>

                                        {paintMode === 'paint_ticket' && (
                                            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                                                {formData.tickets.map((t, idx) => (
                                                    <button
                                                        type="button"
                                                        key={`ticket-btn-${idx}`}
                                                        onClick={() => setSelectedTicketForPaint(idx)}
                                                        className={`flex items-center gap-2 p-2 border-2 text-xs font-bold text-left transition-all ${selectedTicketForPaint === idx ? 'border-black bg-blue-50 shadow-[2px_2px_0_rgba(0,0,0,0.2)]' : 'border-transparent hover:bg-gray-50'}`}
                                                    >
                                                        <div className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: t.color }}></div>
                                                        <span className="truncate">{t.name || `Ticket ${idx + 1}`}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="font-bold uppercase text-sm">Grid Settings</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase mb-1">Rows</label>
                                            <input name="totalRows" type="number" min="1" max="50" value={formData.totalRows} onChange={handleInputChange} className="w-full p-2 border border-black font-bold text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase mb-1">Columns</label>
                                            <input name="seatsPerRow" type="number" min="1" max="50" value={formData.seatsPerRow} onChange={handleInputChange} className="w-full p-2 border border-black font-bold text-center" />
                                        </div>
                                    </div>

                                    {/* Enhanced Instructions */}
                                    <div className="bg-yellow-50 border-2 border-yellow-400 p-3 text-xs">
                                        <p className="font-black text-yellow-800 mb-2">📖 HOW TO SET SEATS:</p>
                                        <div className="space-y-1 text-gray-700">
                                            <p className="font-bold">Click repeatedly to cycle:</p>
                                            <div className="pl-2 border-l-2 border-yellow-300">
                                                {/* Dynamic list of ticket types */}
                                                {formData.tickets.map((t, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <span className="font-black" style={{ color: t.color }}>{i + 1} Click{i > 0 && 's'}:</span>
                                                        <span>{t.name || `Ticket Type ${i + 1}`} ({t.price > 0 ? `$${t.price}` : 'Free'})</span>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-black text-gray-500">Next Click:</span>
                                                    <span>Aisle (Gap)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-red-500">Next Click:</span>
                                                    <span>Blocked</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Type Legend */}
                                    <div className="text-xs text-gray-500">
                                        <p><strong>Your Ticket Types:</strong></p>
                                        <ul className="pl-0 space-y-2 mt-2">
                                            {formData.tickets.map((ticket, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded shadow-sm border border-gray-400"
                                                        style={{ backgroundColor: ticket.color || '#10B981' }}
                                                    ></div>
                                                    <span>{ticket.name || `Ticket ${idx + 1}`}</span>
                                                </li>
                                            ))}
                                            <li className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
                                                <div className="w-4 h-4 bg-white border border-gray-300"></div>
                                                <span>Aisle / Walkway</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-gradient-to-b from-red-400 to-red-600 opacity-60"></div>
                                                <span>Blocked Seat</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-100 border border-blue-500 text-center">
                                        <span className="block text-xs font-black uppercase text-blue-800">Total Capacity</span>
                                        <span className="text-3xl font-black text-blue-600">{formData.totalCapacity}</span>
                                    </div>
                                </div>

                                {/* Right Side: Visual Grid */}
                                <div className="w-full md:w-2/3 bg-[#2a2a2a] p-8 border-4 border-black shadow-[6px_6px_0_gray] min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden rounded-lg">
                                    {/* Stage Decor */}
                                    <div className="w-full max-w-md h-8 bg-gradient-to-b from-gray-700 to-transparent mb-8 text-center text-gray-500 text-xs font-black tracking-[0.5em] uppercase opacity-50">
                                        S T A G E
                                    </div>

                                    <div className="perspective-container" style={{ perspective: '1000px' }}>
                                        <div
                                            className="grid gap-2 transition-transform duration-500 ease-out"
                                            style={{
                                                gridTemplateColumns: `repeat(${formData.seatsPerRow}, minmax(0, 1fr))`,
                                                transform: 'rotateX(10deg)',
                                                transformStyle: 'preserve-3d',
                                            }}
                                        >
                                            {formData.seatingGrid.map((row, rIndex) => (
                                                row.map((seat, cIndex) => {
                                                    // Get ticket type color for this seat
                                                    const ticketIndex = seat.ticketTypeIndex || 0;
                                                    const ticketType = formData.tickets[ticketIndex] || formData.tickets[0];
                                                    const seatColor = ticketType?.color || '#10B981';

                                                    return (
                                                        <div
                                                            key={seat.id}
                                                            onClick={() => toggleSeatType(rIndex, cIndex)}
                                                            title={`${seat.label} - ${seat.type === 'seat' ? (ticketType?.name || 'General') : seat.type}`}
                                                            className={`
                                                                relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[10px] cursor-pointer select-none transition-all duration-150
                                                                ${seat.type === 'aisle'
                                                                    ? 'bg-white/10 border-2 border-dashed border-white/20 rounded-sm hover:bg-white/20'
                                                                    : ''}
                                                                ${seat.type === 'blocked'
                                                                    ? 'bg-gradient-to-b from-red-800 to-red-900 text-white/50 rounded-md scale-90 opacity-60 shadow-inner'
                                                                    : ''}
                                                            `}
                                                            style={seat.type === 'seat' ? {
                                                                background: `linear-gradient(to bottom, ${seatColor}, ${seatColor}dd)`,
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                borderRadius: '8px 8px 6px 6px',
                                                                boxShadow: `0 4px 0 ${seatColor}88`,
                                                            } : {}}
                                                        >
                                                            {seat.type === 'seat' && (
                                                                <span className="drop-shadow-md">{seat.label}</span>
                                                            )}
                                                            {seat.type === 'aisle' && (
                                                                <span className="hidden">Gap</span>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 text-white/30 text-[10px] uppercase tracking-widest font-bold">
                                        Front of House
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
    const renderStep3 = () => {

        // Calculate preview event code range
        const totalTickets = formData.tickets.reduce((sum, t) => sum + parseInt(t.quantity || 0), 0);
        const capacity = formData.totalCapacity || totalTickets || 1;
        const padLength = formData.ticketPadding || 3;

        let prefix = formData.ticketPrefix;
        if (!prefix) {
            const dateStr = formData.startDate ? formData.startDate.replace(/-/g, '') : 'YYYYMMDD';
            const typeCode = formData.eventType === 'Online' ? 'ON' :
                formData.eventType === 'Hybrid' ? 'HYB' : 'OFF';
            prefix = `${dateStr}${typeCode}`;
        }

        const firstCategory = formData.tickets[0]?.name?.substring(0, 3).toUpperCase() || 'GEN';
        const lastCategory = formData.tickets[formData.tickets.length - 1]?.name?.substring(0, 3).toUpperCase() || 'GEN';

        const firstCode = `${prefix}${String(1).padStart(padLength, '0')}${firstCategory}`;
        const lastCode = `${prefix}${String(capacity).padStart(padLength, '0')}${lastCategory}`;

        return (
            <div className="space-y-6 animate-fade-in-up">
                <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 2: Tickets</h2>

                {/* Ticket ID Settings - User Requested customization */}
                <div className="bg-[var(--color-bg-surface)] border-4 border-black p-6 shadow-[8px_8px_0_black]">
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                        🆔 Ticket Number Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Custom Ticket Prefix</label>
                            <input
                                type="text"
                                value={formData.ticketPrefix}
                                onChange={(e) => setFormData(p => ({ ...p, ticketPrefix: e.target.value.toUpperCase() }))}
                                placeholder={prefix}
                                className="w-full neo-input bg-white border-2 border-black px-4 py-3 font-mono font-black placeholder-gray-300"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Example: TICK-2025- (Leave empty for default)</p>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Padding Zeros</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={formData.ticketPadding || padLength}
                                    onChange={(e) => setFormData(p => ({ ...p, ticketPadding: parseInt(e.target.value) }))}
                                    min="1"
                                    max="10"
                                    className="w-20 neo-input bg-white border-2 border-black px-4 py-3 font-black"
                                />
                                <span className="text-xs font-bold text-gray-600">Digits (Recommended: {String(capacity).length})</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black text-white p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Live Preview</span>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5">{capacity} Tickets Total</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-2 border-t border-white/10">
                            <div className="bg-white/10 px-4 py-2 font-mono font-black text-lg tracking-tighter text-[var(--color-accent-primary)]">{firstCode}</div>
                            <span className="text-white/30 font-black">TO</span>
                            <div className="bg-white/10 px-4 py-2 font-mono font-black text-lg tracking-tighter text-[var(--color-accent-primary)]">{lastCode}</div>
                        </div>
                    </div>
                </div>

                {formData.tickets.map((ticket, index) => (
                    <div key={index} className="neo-card bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-4 relative mb-4" style={{ borderLeftColor: ticket.color || '#10B981', borderLeftWidth: '6px' }}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-black shadow-[2px_2px_0_black]"
                                    style={{ backgroundColor: ticket.color || '#10B981' }}
                                ></div>
                                <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase">Ticket Type #{index + 1}</span>
                            </div>
                            {formData.tickets.length > 1 && (
                                <button onClick={() => removeTicketType(index)} className="text-red-600 font-bold hover:underline text-xs">REMOVE</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Name</label>
                                <input type="text" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} placeholder="VIP / General" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={ticket.quantity}
                                    onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                                    placeholder={formData.seatingType === 'Reserved' ? formData.totalCapacity : "100"}
                                    className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold"
                                />
                                {formData.seatingType === 'Reserved' && (
                                    <p className="text-[10px] text-gray-500 mt-1">Total Seats: {formData.totalCapacity}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Price (₹)</label>
                                <input type="number" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} placeholder="0.00" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Color</label>
                                <div className="flex flex-wrap gap-1">
                                    {ticketColorPalette.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => handleTicketChange(index, 'color', color.value)}
                                            title={color.name}
                                            className={`w-6 h-6 rounded border-2 transition-all ${ticket.color === color.value ? 'border-black scale-110 shadow-md' : 'border-gray-300 hover:scale-105'}`}
                                            style={{ backgroundColor: color.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Description</label>
                            <input type="text" value={ticket.description} onChange={(e) => handleTicketChange(index, 'description', e.target.value)} placeholder="Includes backstage access..." className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 text-sm" />
                        </div>
                    </div>
                ))}
                <button onClick={addTicketType} className="w-full py-3 border-2 border-dashed border-[var(--color-text-primary)] text-[var(--color-text-primary)] font-black uppercase hover:bg-[var(--color-bg-secondary)] transition-colors">
                    + Add Ticket Type
                </button>
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 4: Media & Compliance</h2>

            {/* Media */}
            <div className="mb-8">
                <h3 className="font-black uppercase text-lg mb-4">Event Media</h3>
                <div className="border-4 border-dashed border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg-surface)] transition-colors relative">
                    <input type="file" name="bannerImageFile" onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <span className="text-4xl mb-2">📷</span>
                    <p className="font-black uppercase text-[var(--color-text-primary)]">
                        {formData.bannerImageFile ? formData.bannerImageFile.name : 'Upload Banner Image'}
                    </p>
                </div>
            </div>

            {/* Compliance */}
            <div className="p-6 bg-yellow-50 border-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">👮</span>
                    <h3 className="font-black uppercase text-lg text-yellow-900">Compliance Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">PAN Number *</label>
                        <input
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleComplianceChange}
                            type="text"
                            className="w-full neo-input bg-white border-2 border-black px-4 py-3 font-bold uppercase placeholder:normal-case"
                            placeholder="ABCDE1234F (10 Chars)"
                            maxLength={10}
                        />
                        <p className="text-[10px] text-gray-500 mt-1 text-right">{formData.panNumber.length}/10</p>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">GST Number (Optional)</label>
                        <input
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleComplianceChange}
                            type="text"
                            className="w-full neo-input bg-white border-2 border-black px-4 py-3 font-bold uppercase placeholder:normal-case"
                            placeholder="22AAAAA0000A1Z5 (15 Chars)"
                            maxLength={15}
                        />
                        <p className="text-[10px] text-gray-500 mt-1 text-right">{formData.gstNumber.length}/15</p>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Govt ID Type *</label>
                        <select
                            name="govtIdType"
                            value={formData.govtIdType}
                            onChange={(e) => {
                                handleInputChange(e);
                                setFormData(p => ({ ...p, govtIdNumber: '' })); // Reset number on type change
                            }}
                            className="w-full neo-input bg-white border-2 border-black px-4 py-3 font-bold"
                        >
                            <option>Aadhar Card</option>
                            <option>Passport</option>
                            <option>Driving License</option>
                            <option>Voter ID</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">ID Number *</label>
                        <input
                            name="govtIdNumber"
                            value={formData.govtIdNumber}
                            onChange={handleComplianceChange}
                            type="text"
                            className="w-full neo-input bg-white border-2 border-black px-4 py-3 font-bold"
                            placeholder={
                                formData.govtIdType === 'Aadhar Card' ? '12 Digit Number' :
                                    formData.govtIdType === 'Passport' ? 'Letter + 7 Digits' :
                                        formData.govtIdType === 'Voter ID' ? 'ABC1234567' : 'ID Number'
                            }
                        />
                        <p className="text-[10px] text-gray-500 mt-1 text-right">
                            {formData.govtIdType === 'Aadhar Card' && `${formData.govtIdNumber.length}/12`}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Upload ID Proof *</label>
                        <input name="idProofFile" onChange={handleInputChange} type="file" className="w-full border-2 border-black p-2 bg-white" accept=".pdf,.jpg,.jpeg,.png" />
                        <p className="text-[10px] uppercase font-bold text-gray-500 mt-1">Accepted: PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                </div>
                <p className="text-xs font-bold text-red-600 mt-4">* These details are required for Admin Approval.</p>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 5: Review</h2>
            <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-3xl font-black uppercase mb-1">{formData.eventTitle}</h3>
                        <span className="bg-yellow-400 text-black px-2 py-0.5 text-xs font-black uppercase border border-black">{formData.category}</span>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-xl">{formData.startDate}</p>
                        <p className="text-sm font-bold text-gray-500">{formData.startTime}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-bold">
                    <div>
                        <span className="block text-gray-500 text-xs uppercase">Venue</span>
                        <p>{formData.venueName}, {formData.city}</p>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs uppercase">Seating</span>
                        <p>{formData.seatingType} {formData.seatingType === 'Reserved' && `(${formData.totalCapacity} Seats)`}</p>
                    </div>
                </div>

                <hr className="border-dashed border-gray-400 my-4" />

                <h4 className="font-black uppercase text-sm mb-2">Tickets</h4>
                <div className="space-y-2">
                    {formData.tickets.map((t, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-200 pb-1">
                            <span>{t.name}</span>
                            <span>{t.quantity} x ₹{t.price}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-gray-100 text-xs font-bold text-gray-600">
                    <p>{isEditMode ? 'ℹ️ Your changes will be saved. If you modified compliance details, the event may need re-approval.' : 'ℹ️ By submitting, your event will be sent for Admin Approval. You cannot sell tickets until your compliance details are verified.'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/organizer/dashboard" className="font-black underline uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        &larr; Back to Dashboard
                    </Link>
                    <p className="font-black uppercase text-[var(--color-text-primary)]">{isEditMode ? 'Edit Event' : 'Create New Event'}</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)]">
                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-[var(--color-accent-primary)]' : 'bg-gray-200'}`}></div>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep3()}  {/* Tickets now comes BEFORE Seating */}
                    {step === 3 && renderStep2()}  {/* Venue & Seating now comes AFTER Tickets */}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}

                    {/* Navigation */}
                    <div className="flex justify-between mt-10 pt-6 border-t-2 border-dashed border-[var(--color-text-primary)]">
                        <button
                            onClick={handlePrev}
                            disabled={step === 1 || loading}
                            className="neo-btn px-6 py-3 font-black uppercase text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] disabled:opacity-50 disabled:shadow-none bg-white"
                        >
                            Previous
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                className="neo-btn px-6 py-3 font-black uppercase text-white bg-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-text-primary)]"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="neo-btn px-8 py-3 font-black uppercase text-white bg-[var(--color-success)] shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-text-primary)] disabled:opacity-50"
                            >
                                {loading ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Submit for Approval')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
