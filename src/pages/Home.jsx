import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import toast from 'react-hot-toast';
import FeaturedEvents from '../components/FeaturedEvents';
import CategoryFilters from '../components/CategoryFilters';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import FAQSection from '../components/FAQSection';
import RollingGallery from '../components/react-bits/RollingGallery';
import Newsletter from '../components/Newsletter';
import OrganizerCTA from '../components/OrganizerCTA';
import SEOHead from '../components/SEOHead';

const logos = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png'
];

const Home = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Initial fetch of all events for local filtering (Optimization: Fetch once)
    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, where('status', '==', 'published'));
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    title: doc.data().eventTitle || doc.data().title,
                    location: doc.data().city ? `${doc.data().venueName ? doc.data().venueName + ', ' : ''}${doc.data().city}` : doc.data().location,
                    image: doc.data().bannerUrl || doc.data().image,
                    date: doc.data().startDate || doc.data().date,
                    price: doc.data().price || (doc.data().tickets?.[0]?.price)
                }));
                setAllEvents(fetched);
            } catch (error) {
                toast.error("Failed to load search index");
            }
        };
        fetchAllEvents();
    }, []);

    // Local filtering logic (Optimization: No API call on type)
    useEffect(() => {
        if (!searchQuery && !locationQuery) {
            setFilteredEvents([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const filtered = allEvents.filter(event => {
            const matchesName = !searchQuery || event.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = !locationQuery || event.location?.toLowerCase().includes(locationQuery.toLowerCase());
            return matchesName && matchesLocation;
        });
        setFilteredEvents(filtered);
    }, [searchQuery, locationQuery, allEvents]);

    return (
        <>
            <SEOHead
                title="Book Event Tickets Online"
                description="Tickify is India's #1 event ticketing platform. Discover and book tickets for concerts, festivals, conferences, workshops, and live events. Zero hidden fees, instant booking confirmation. Trusted by 2M+ users."
                keywords={[
                    'book event tickets',
                    'online ticket booking',
                    'concert tickets india',
                    'festival tickets',
                    'live events near me',
                    'music events',
                    'tech conferences',
                    'workshop booking',
                    'event ticketing platform',
                    'buy tickets online india'
                ]}
                canonical="https://tickify.co.in/"
                ogType="website"
                ogImage="https://tickify.co.in/og-home.jpg"
                ogImageAlt="Tickify - Your Gateway to Amazing Events"
            />
            <div className="flex flex-col gap-0">
                <Hero
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    location={locationQuery}
                    setLocation={setLocationQuery}
                />

                {/* Live Search Results Section */}
                {isSearching && (
                    <section className="container mx-auto px-4 py-12 bg-yellow-50 border-y-4 border-black -mt-4 mb-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black uppercase italic">
                                Search Results ({filteredEvents.length})
                            </h2>
                            <button
                                onClick={() => { setSearchQuery(''); setLocationQuery(''); }}
                                className="neo-btn bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-black uppercase border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                            >
                                Clear X
                            </button>
                        </div>

                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {filteredEvents.map(event => (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="neo-card bg-[var(--color-bg-surface)] p-4 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-y-[-2px] transition-all"
                                    >
                                        <div className="h-32 bg-[var(--color-bg-secondary)] mb-4 border-2 border-[var(--color-text-primary)] overflow-hidden">
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-black uppercase text-sm truncate text-[var(--color-text-primary)]">{event.title}</h3>
                                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">{event.location}</p>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-xs font-black text-[var(--color-accent-primary)]">₹{event.price || 'FREE'}</span>
                                            <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">{event.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-xl font-black uppercase opacity-50">No matches found for your search.</p>
                            </div>
                        )}
                    </section>
                )}

                <RollingGallery images={logos} />
                <CategoryFilters />
                <FeaturedEvents />
                <OrganizerCTA />
                <HowItWorks />
                <Testimonials />
                <FAQSection />
                <Newsletter />
            </div>
        </>
    );
}

export default Home;
