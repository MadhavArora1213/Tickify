import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOHead - Comprehensive SEO component for Tickify
 * Handles all meta tags, Open Graph, Twitter Cards, and Structured Data
 */
const SEOHead = ({
    // Core SEO
    title,
    description,
    keywords = [],

    // Page info
    canonical,
    noIndex = false,
    noFollow = false,

    // Open Graph
    ogType = 'website',
    ogImage,
    ogImageAlt,
    ogLocale = 'en_US',

    // Twitter Card
    twitterCard = 'summary_large_image',
    twitterSite = '@tickify',
    twitterCreator,

    // Article specific (for event pages)
    publishedTime,
    modifiedTime,
    author,

    // Event structured data
    event = null,

    // Business structured data
    organization = null,

    // Breadcrumb structured data
    breadcrumbs = null,

    // FAQ structured data
    faqItems = null,

    // Additional meta
    children
}) => {
    const siteName = 'Tickify';
    const siteUrl = 'https://tickify.co.in';
    const defaultImage = `${siteUrl}/og-image.jpg`;
    const defaultDescription = 'Tickify - India\'s premier event ticketing platform. Discover concerts, festivals, conferences & more. Book tickets seamlessly with zero hidden fees.';

    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Your Gateway to Amazing Events`;
    const metaDescription = description || defaultDescription;
    const metaImage = ogImage || defaultImage;
    const metaUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

    // Build keywords string
    const keywordString = [
        'event tickets',
        'book tickets online',
        'concerts',
        'festivals',
        'conferences',
        'workshops',
        'tickify',
        'event booking india',
        ...keywords
    ].join(', ');

    // Generate robots directive
    const robotsContent = [
        noIndex ? 'noindex' : 'index',
        noFollow ? 'nofollow' : 'follow',
        'max-image-preview:large',
        'max-snippet:-1',
        'max-video-preview:-1'
    ].join(', ');

    // Organization Schema (shown on all pages)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tickify",
        "alternateName": "Tickify Events",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`,
        "sameAs": [
            "https://facebook.com/tickify",
            "https://twitter.com/tickify",
            "https://instagram.com/tickify",
            "https://linkedin.com/company/tickify"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-1800-TICKIFY",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi"]
        }
    };

    // Website Schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tickify",
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/events?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    // Event Schema (for event detail pages)
    const eventSchema = event ? {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.title,
        "description": event.description,
        "image": event.image,
        "startDate": event.startDate,
        "endDate": event.endDate || event.startDate,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": event.isOnline
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        "location": event.isOnline ? {
            "@type": "VirtualLocation",
            "url": event.onlineUrl || metaUrl
        } : {
            "@type": "Place",
            "name": event.venueName || event.location,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": event.city,
                "addressRegion": event.state,
                "addressCountry": event.country || "IN"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": event.organizer || "Tickify Organizer",
            "url": siteUrl
        },
        "performer": event.performers ? event.performers.map(p => ({
            "@type": "Person",
            "name": p
        })) : undefined,
        "offers": event.tickets ? event.tickets.map(ticket => ({
            "@type": "Offer",
            "name": ticket.name,
            "price": ticket.price,
            "priceCurrency": "INR",
            "availability": ticket.available !== false
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            "validFrom": event.saleStartDate || new Date().toISOString(),
            "url": metaUrl
        })) : {
            "@type": "Offer",
            "price": event.price || 0,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "url": metaUrl
        }
    } : null;

    // Breadcrumb Schema
    const breadcrumbSchema = breadcrumbs ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url ? `${siteUrl}${crumb.url}` : undefined
        }))
    } : null;

    // FAQ Schema
    const faqSchema = faqItems ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={keywordString} />
            <meta name="robots" content={robotsContent} />
            <meta name="googlebot" content={robotsContent} />
            <meta name="bingbot" content={robotsContent} />

            {/* Language and Locale */}
            <meta name="language" content="English" />
            <meta httpEquiv="content-language" content="en" />

            {/* Canonical URL */}
            <link rel="canonical" href={metaUrl} />

            {/* Author & Publisher */}
            <meta name="author" content={author || "Tickify Team"} />
            <meta name="publisher" content="Tickify" />
            <meta name="copyright" content="Tickify" />

            {/* Viewport & Mobile */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
            <meta name="theme-color" content="#8B5CF6" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Tickify" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={ogImageAlt || title || 'Tickify Event Booking'} />
            <meta property="og:locale" content={ogLocale} />

            {/* Article Meta (for events/blog) */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content={twitterSite} />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
            <meta name="twitter:image:alt" content={ogImageAlt || title || 'Tickify Event Booking'} />
            {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

            {/* Additional Meta for SEO */}
            <meta name="rating" content="General" />
            <meta name="distribution" content="Global" />
            <meta name="revisit-after" content="1 days" />
            <meta name="format-detection" content="telephone=no" />

            {/* Geo targeting for India */}
            <meta name="geo.region" content="IN" />
            <meta name="geo.placename" content="India" />
            <meta name="ICBM" content="20.5937, 78.9629" />

            {/* Structured Data - Organization */}
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>

            {/* Structured Data - Website */}
            <script type="application/ld+json">
                {JSON.stringify(websiteSchema)}
            </script>

            {/* Structured Data - Event (if provided) */}
            {eventSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(eventSchema)}
                </script>
            )}

            {/* Structured Data - Breadcrumb (if provided) */}
            {breadcrumbSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            )}

            {/* Structured Data - FAQ (if provided) */}
            {faqSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            )}

            {/* Additional custom meta tags */}
            {children}
        </Helmet>
    );
};

export default SEOHead;
