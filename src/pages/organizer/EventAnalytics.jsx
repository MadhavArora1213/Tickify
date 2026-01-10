import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const EventAnalytics = () => {
    const { eventId } = useParams();
    const [period, setPeriod] = useState('All Time');
    const [event, setEvent] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventAnalytics = async () => {
            if (!eventId) return;
            try {
                setLoading(true);
                // 1. Fetch Event Info
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    setEvent({ id: eventSnap.id, ...eventSnap.data() });
                }

                // 2. Fetch Bookings for this event
                const bookingsRef = collection(db, 'bookings');
                const bq = query(bookingsRef, where('eventId', '==', eventId));
                const bSnapshot = await getDocs(bq);

                const fetchedBookings = bSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setBookings(fetchedBookings);
            } catch (error) {
                toast.error("Error fetching event analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchEventAnalytics();
    }, [eventId]);

    // Calculate Real Stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const ticketsSold = bookings.reduce((sum, b) => {
        return sum + (b.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0);
    }, 0);
    const totalTickets = event?.totalCapacity || 100;
    const eventName = event?.eventTitle || "Loading...";

    // Ticket Selection Breakdown
    const ticketBreakdown = {};
    bookings.forEach(b => {
        if (b.items) {
            b.items.forEach(item => {
                const name = item.name || item.ticketName || 'General';
                if (!ticketBreakdown[name]) {
                    ticketBreakdown[name] = { sold: 0, revenue: 0 };
                }
                ticketBreakdown[name].sold += (item.quantity || 1);
                ticketBreakdown[name].revenue += (item.price * (item.quantity || 1));
            });
        }
    });

    const downloadPDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // 1. Branding & Header
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKIFY ANALYTICS', 14, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Event: ${eventName}`, 14, 32);
        doc.text(`Generated: ${timestamp}`, 140, 32);

        // 2. Summary Boxes
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Executive Summary', 14, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `INR ${totalRevenue.toLocaleString()}`],
                ['Tickets Sold', `${ticketsSold} / ${totalTickets}`],
                ['Success Rate', `${Math.round((ticketsSold / totalTickets) * 100)}%`],
                ['Total Bookings', bookings.length.toString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] }
        });

        // 3. VISUAL GRAPH: Sales Trend (Drawing manually)
        const graphY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Sales Trend (Last 14 Days)', 14, graphY);

        // Draw Graph Background
        doc.setDrawColor(200, 200, 200);
        doc.line(14, graphY + 5, 14, graphY + 55); // Y axis
        doc.line(14, graphY + 55, 196, graphY + 55); // X axis

        // Process Graph Data
        const salesByDate = {};
        const last14Days = Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split('T')[0];
        });
        bookings.forEach(b => {
            if (!b.bookingDate) return;
            const date = b.bookingDate.toDate ? b.bookingDate.toDate().toISOString().split('T')[0] :
                (typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : null);
            if (date) salesByDate[date] = (salesByDate[date] || 0) + (b.totalAmount || 0);
        });
        const maxVal = Math.max(...Object.values(salesByDate), 100);

        // Draw Bars
        const barWidth = 10;
        const spacing = (182 - (14 * barWidth)) / 13;
        last14Days.forEach((date, i) => {
            const val = salesByDate[date] || 0;
            const barHeight = (val / maxVal) * 45;
            const x = 14 + (i * (barWidth + spacing));
            const y = graphY + 55 - barHeight;

            if (val > 0) {
                doc.setFillColor(168, 85, 247); // Purple matching UI
                doc.rect(x, y, barWidth, barHeight, 'F');
                doc.setDrawColor(0, 0, 0);
                doc.rect(x, y, barWidth, barHeight, 'D');
            } else {
                doc.setFillColor(240, 240, 240);
                doc.rect(x, graphY + 54, barWidth, 1, 'F');
            }

            // Date labels
            doc.setFontSize(6);
            doc.setTextColor(100, 100, 100);
            const dLabel = new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
            doc.text(dLabel, x, graphY + 60);
        });

        // 4. Detailed Breakdown Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ticket Type Breakdown', 14, graphY + 75);

        const breakdownRows = Object.entries(ticketBreakdown).map(([name, data]) => {
            const eventTicket = event?.tickets?.find(t => t.name === name || t.ticketName === name);
            const total = eventTicket?.quantity || 'N/A';
            return [name, data.sold, total, `INR ${data.revenue.toLocaleString()}`];
        });

        autoTable(doc, {
            startY: graphY + 80,
            head: [['Type', 'Sold', 'Capacity', 'Revenue']],
            body: breakdownRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`Tickify_Report_${eventName.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadCSV = () => {
        // Prepare Header Info
        let csvContent = "\uFEFF";
        csvContent += `Tickify Event Report: ${eventName}\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n`;
        csvContent += `Event ID: ${eventId}\n\n`;

        csvContent += "SUMMARY\n";
        csvContent += "Property,Value\n";
        csvContent += `Tickets Sold,${ticketsSold} / ${totalTickets}\n`;
        csvContent += `Total Revenue,INR ${totalRevenue}\n`;
        csvContent += `Total Bookings,${bookings.length}\n\n`;

        csvContent += "DAILY SALES TREND (LAST 14 DAYS)\n";
        csvContent += "Date,Revenue (INR)\n";

        const salesByDate = {};
        const last14Days = Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split('T')[0];
        });

        bookings.forEach(b => {
            if (!b.bookingDate) return;
            const date = b.bookingDate.toDate ? b.bookingDate.toDate().toISOString().split('T')[0] :
                (typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : null);
            if (date) salesByDate[date] = (salesByDate[date] || 0) + (b.totalAmount || 0);
        });

        last14Days.forEach(date => {
            csvContent += `${date},${salesByDate[date] || 0}\n`;
        });
        csvContent += "\n";

        csvContent += "TICKET BREAKDOWN\n";
        csvContent += "Ticket Type,Sold,Capacity,Revenue\n";
        Object.entries(ticketBreakdown).forEach(([name, data]) => {
            const eventTicket = event?.tickets?.find(t => t.name === name || t.ticketName === name);
            const total = eventTicket?.quantity || 'N/A';
            csvContent += `${name},${data.sold},${total},INR ${data.revenue}\n`;
        });
        csvContent += "\n";

        csvContent += "TRANSACTIONS\n";
        csvContent += "Order ID,Customer,Email,Date,Amount\n";

        bookings.forEach(b => {
            const date = b.bookingDate?.toDate ? b.bookingDate.toDate().toLocaleDateString() :
                (typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : 'N/A');
            csvContent += `${b.id},${b.userName || 'Guest'},${b.userEmail || 'N/A'},${date},INR ${b.totalAmount}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Tickify_Report_${eventName.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="font-black text-2xl animate-pulse">ANALYZING DATA...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <Link to="/organizer/dashboard" className="text-xs font-black uppercase underline text-[var(--color-text-secondary)] mb-2 inline-block">&larr; Back to Dashboard</Link>
                        <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Analytics: {eventName}</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={downloadPDF}
                            className="neo-btn bg-purple-600 text-white border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black]"
                        >
                            PDF (with Graphs) 📊
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="neo-btn bg-white text-black border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black]"
                        >
                            CSV (Raw Data) 📝
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Revenue</h3>
                        <p className="text-4xl font-black text-green-500">₹{totalRevenue.toLocaleString()}</p>
                        <span className="text-xs font-bold text-gray-500">Confirmed Sales</span>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Tickets Sold</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">{ticketsSold} <span className="text-lg text-[var(--color-text-secondary)]">/ {totalTickets}</span></p>

                        <div className="w-full bg-gray-200 h-2 mt-2 border border-black rounded-full overflow-hidden">
                            <div className="bg-[var(--color-accent-primary)] h-full" style={{ width: `${Math.min((ticketsSold / totalTickets) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Bookings</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">{bookings.length}</p>
                        <span className="text-xs font-bold text-blue-500">Unique Transactions</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Sales Timeline Chart */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase">Sales Trends</h3>
                            <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 border-2 border-green-700">Live Data</span>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-1 border-b-2 border-dashed border-[var(--color-text-secondary)] pb-2 px-2 relative">
                            {(() => {
                                // Real Aggregation: Group revenue by date
                                const salesByDate = {};
                                const last14Days = Array.from({ length: 14 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - (13 - i));
                                    return d.toISOString().split('T')[0];
                                });

                                bookings.forEach(b => {
                                    if (!b.bookingDate) return;
                                    const date = b.bookingDate.toDate ? b.bookingDate.toDate().toISOString().split('T')[0] :
                                        (typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : null);
                                    if (date) {
                                        salesByDate[date] = (salesByDate[date] || 0) + (b.totalAmount || 0);
                                    }
                                });

                                const maxRevenue = Math.max(...Object.values(salesByDate), 100);

                                return last14Days.map(date => {
                                    const revenue = salesByDate[date] || 0;
                                    const h = (revenue / maxRevenue) * 90; // Scale to 90% max height
                                    const displayDate = new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

                                    return (
                                        <div key={date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                            {revenue > 0 && (
                                                <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] p-1 font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    ₹{revenue.toLocaleString()}
                                                </div>
                                            )}
                                            <div
                                                className={`w-full border-2 border-black transition-all duration-500 hover:brightness-110 cursor-help ${revenue > 0 ? 'bg-[var(--color-accent-primary)] shadow-[2px_2px_0_black]' : 'bg-gray-100 opacity-20'}`}
                                                style={{ height: `${Math.max(h, 2)}%` }}
                                            ></div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                            <span>{new Date(Date.now() - 13 * 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                            <span className="text-black">Daily Revenue (Last 14 Days)</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Ticket Type Breakdown */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6">Ticket Breakdown</h3>
                        <div className="space-y-6">
                            {Object.entries(ticketBreakdown).length === 0 ? (
                                <p className="text-center font-bold text-gray-500 py-10">No tickets sold yet.</p>
                            ) : (
                                Object.entries(ticketBreakdown).map(([name, data]) => {
                                    // Try to find matching ticket in event doc to get total quantity
                                    const eventTicket = event?.tickets?.find(t => t.name === name || t.ticketName === name);
                                    const total = eventTicket?.quantity || 100;
                                    const percent = Math.min((data.sold / total) * 100, 100);

                                    return (
                                        <div key={name}>
                                            <div className="flex justify-between text-sm font-black uppercase mb-1">
                                                <span>{name}</span>
                                                <span>{data.sold} / {total} (₹{data.revenue.toLocaleString()})</span>
                                            </div>
                                            <div className="w-full h-8 bg-gray-200 border-2 border-black rounded-r-full overflow-hidden">
                                                <div className={`h-full border-r-2 border-black bg-purple-400`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics;
