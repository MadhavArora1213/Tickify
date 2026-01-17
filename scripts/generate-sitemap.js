import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Expects FIREBASE_SERVICE_ACCOUNT environment variable to be a JSON string
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (!serviceAccount) {
    console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Site Configuration
const SITE_URL = 'https://tickify.co.in';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static Routes (from your existing sitemap)
const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/events', changefreq: 'hourly', priority: '0.9' },
    { loc: '/resell', changefreq: 'hourly', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/faq', changefreq: 'weekly', priority: '0.7' },
    { loc: '/help', changefreq: 'weekly', priority: '0.7' },
    { loc: '/pricing', changefreq: 'monthly', priority: '0.8' },
    { loc: '/careers', changefreq: 'monthly', priority: '0.6' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.4' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.4' },
    { loc: '/cookie-policy', changefreq: 'yearly', priority: '0.4' },
    { loc: '/login', changefreq: 'monthly', priority: '0.5' },
    { loc: '/register', changefreq: 'monthly', priority: '0.5' },
    { loc: '/forgot-password', changefreq: 'monthly', priority: '0.4' },
    { loc: '/organizer/register', changefreq: 'monthly', priority: '0.6' },
    { loc: '/organizer/login', changefreq: 'monthly', priority: '0.5' },
    { loc: '/organizer/forgot-password', changefreq: 'monthly', priority: '0.4' },
    { loc: '/scanner/login', changefreq: 'monthly', priority: '0.4' }
];

const generateSitemap = async () => {
    try {
        console.log('🔄 Fetching events from Firestore...');

        // Fetch published events
        const eventsSnapshot = await db.collection('events')
            .where('status', '==', 'published')
            .get();

        const events = [];
        eventsSnapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Found ${events.length} published events.`);

        // XML Header
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

        // Add Static Routes
        staticRoutes.forEach(route => {
            xml += `
  <url>
    <loc>${SITE_URL}${route.loc === '/' ? '/' : route.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
        });

        // Add Event Routes
        events.forEach(event => {
            // Safe image handling
            const imageUrl = event.bannerUrl || event.image || `${SITE_URL}/logo.png`;
            const lastMod = event.updatedAt
                ? new Date(event.updatedAt.toDate()).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            xml += `
  <url>
    <loc>${SITE_URL}/events/${event.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(event.title || 'Event')}</image:title>
    </image:image>
  </url>`;
        });

        xml += `
</urlset>`;

        // Write to file
        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`✅ Sitemap generated successfully at ${SITEMAP_PATH}`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
};

// Helper to escape XML special characters
const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

generateSitemap();
