import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShinyText from '../components/react-bits/ShinyText';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Fix for default Leaflet icon not finding images in Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const FILTER_CATEGORIES = ['All', 'Music', 'Technology', 'Arts', 'Food', 'Wellness', 'Business', 'Sports'];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(1000);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('All');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const eventsRef = collection(db, 'events');
                // You can add more specific queries here if needed, e.g., only active events
                // const q = query(eventsRef, where("status", "==", "active")); 
                const querySnapshot = await getDocs(eventsRef);

                const fetchedEvents = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    // Calculate starting price from tickets if not set directly
                    let startingPrice = data.price;
                    if (!startingPrice && data.tickets && Array.isArray(data.tickets) && data.tickets.length > 0) {
                        const prices = data.tickets.map(t => Number(t.price) || 0);
                        startingPrice = Math.min(...prices);
                    }

                    return {
                        id: doc.id,
                        ...data,
                        // Mappings for UI compatibility
                        title: data.eventTitle || data.title,
                        image: data.bannerUrl || data.image,
                        date: data.startDate || data.date,
                        location: data.city ? `${data.venueName ? data.venueName + ', ' : ''}${data.city}` : data.location,
                        price: startingPrice
                    };
                });

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching events: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Filter logic
    const filteredEvents = events.filter(event => {
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        // Parse price safely. If price is a string like "$120", remove '$'. If simple number, use it.
        let priceValue = 0;
        if (typeof event.price === 'string') {
            priceValue = parseFloat(event.price.replace(/[^0-9.]/g, ''));
        } else if (typeof event.price === 'number') {
            priceValue = event.price;
        }

        const matchesPrice = priceValue <= priceRange;
        const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase());
        // Simple location match (can be improved)
        const matchesLocation = locationFilter === 'All' || event.location?.includes(locationFilter);

        return matchesCategory && matchesPrice && matchesSearch && matchesLocation;
    });

    if (loading) {
        return (
            <div className="pt-36 pb-20 min-h-screen bg-[var(--color-bg-primary)] flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Loading Events...</div>
            </div>
        );
    }

    return (
        <div className="pt-36 pb-20 min-h-screen bg-[var(--color-bg-primary)]">
            {/* Header */}
            <div className="container mx-auto px-4 mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[var(--color-text-primary)] tracking-tight uppercase">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Explore Events</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Explore Events</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg font-bold">
                    Discover workshops, conferences, and parties happening near you.
                </p>
            </div>

            <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-1/4 flex-shrink-0 space-y-8">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full neo-input bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                        />
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    {/* Filter Card */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 sticky top-32 border-2 border-[var(--color-text-primary)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] uppercase">Filters</h3>
                            <button
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setPriceRange(1000);
                                    setSearchTerm('');
                                    setLocationFilter('All');
                                }}
                                className="text-sm font-bold text-[var(--color-accent-primary)] hover:underline border-b-2 border-transparent hover:border-[var(--color-accent-primary)]"
                            >
                                RESET
                            </button>
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <label className="block text-sm font-black text-[var(--color-text-primary)] mb-2 uppercase tracking-wide">Location</label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full neo-input bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                            >
                                <option value="All">All Locations</option>
                                <option value="New York">New York, USA</option>
                                <option value="San Francisco">San Francisco, USA</option>
                                <option value="London">London, UK</option>
                                <option value="Tokyo">Tokyo, JP</option>
                            </select>
                        </div>

                        {/* Date */}
                        <div className="mb-6">
                            <label className="block text-sm font-black text-[var(--color-text-primary)] mb-2 uppercase tracking-wide">Date</label>
                            <input type="date" className="w-full neo-input bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" />
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span className="text-[var(--color-text-primary)]">Max Price</span>
                                <span className="text-[var(--color-accent-primary)]">${priceRange}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full h-4 bg-[var(--color-text-primary)] rounded-full appearance-none cursor-pointer border-2 border-black"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-black text-[var(--color-text-primary)] mb-3 uppercase tracking-wide">Categories</label>
                            <div className="space-y-3">
                                {FILTER_CATEGORIES.map(cat => (
                                    <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                                        <div className={`w-6 h-6 border-2 border-[var(--color-text-primary)] flex items-center justify-center transition-all ${selectedCategory === cat ? 'bg-[var(--color-accent-primary)]' : 'bg-transparent group-hover:bg-[var(--color-text-secondary)]'}`}>
                                            {selectedCategory === cat && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            className="hidden"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                        />
                                        <span className={`text-base font-bold uppercase ${selectedCategory === cat ? 'text-[var(--color-text-primary)] underline decoration-2 decoration-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'}`}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div className="text-[var(--color-text-primary)] font-black text-xl">
                            {filteredEvents.length} RESULTS
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Sort */}
                            <select className="neo-input bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] py-2 text-sm font-bold">
                                <option>Sort: Popularity</option>
                                <option>Date: Soonest</option>
                                <option>Price: Low to High</option>
                            </select>

                            {/* View Toggle */}
                            <div className="neo-card p-1 flex bg-[var(--color-bg-surface)] border-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-all border-2 border-transparent ${viewMode === 'grid' ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0px_black]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 transition-all border-2 border-transparent ${viewMode === 'map' ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0px_black]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid/Map Content */}
                    {viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map(event => (
                                        <Link key={event.id} to={`/events/${event.id}`}>
                                            <div className="neo-card bg-[var(--color-bg-surface)] overflow-hidden group h-full flex flex-col">
                                                <div className="h-48 overflow-hidden relative border-b-2 border-black">
                                                    <img src={event.image || "https://via.placeholder.com/400x200?text=No+Image"} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                    <div className="absolute top-2 right-2 neo-btn bg-[var(--color-accent-primary)] text-white text-xs px-2 py-1 rotate-3">
                                                        {event.price ? (typeof event.price === 'number' ? `$${event.price}` : event.price) : 'Free'}
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <div className="text-xs font-black text-[var(--color-accent-secondary)] mb-1 uppercase tracking-widest">{event.category || 'General'}</div>
                                                    <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-2 leading-tight">{event.title}</h3>
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <span className="text-sm font-bold text-[var(--color-text-muted)]">{event.date}</span>
                                                        <span className="neo-btn bg-white text-black px-3 py-1 text-xs">DETAILS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-[var(--color-text-secondary)]">
                                        <p className="text-xl font-bold">No events found matching your filters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Load More */}
                            {filteredEvents.length > 12 && (
                                <div className="mt-12 text-center">
                                    <button className="neo-btn bg-[var(--color-accent-primary)] text-white px-8 py-4 text-lg">
                                        LOAD MORE !!!
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="neo-card w-full h-[600px] bg-[var(--color-bg-surface)] overflow-hidden relative border-4 border-black shadow-[8px_8px_0_black]">
                            <MapContainer center={[39.8283, -98.5795]} zoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filteredEvents.map((event) => (
                                    (event.coordinates || (event.lat && event.lng)) && (
                                        <Marker
                                            key={event.id}
                                            position={event.coordinates || [event.lat, event.lng]}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                                    <p className="text-sm mb-2">{event.location}</p>
                                                    <Link to={`/events/${event.id}`} className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">View</Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;
