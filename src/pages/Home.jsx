import React from 'react';
import Hero from '../components/Hero';
import FeaturedEvents from '../components/FeaturedEvents';
import CategoryFilters from '../components/CategoryFilters';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import RollingGallery from '../components/react-bits/RollingGallery';
import Newsletter from '../components/Newsletter';

const logos = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png'
];

const Home = () => {
    return (
        <div className="flex flex-col gap-0">
            <Hero />
            <RollingGallery images={logos} />
            <CategoryFilters />
            <FeaturedEvents />
            <HowItWorks />
            <Testimonials />
            <Newsletter />
        </div>
    );
}

export default Home;
