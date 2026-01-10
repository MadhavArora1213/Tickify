import React from 'react';

const ServerError = () => {
    return (
        <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
            <div className="neo-card verification-card bg-white border-4 border-black p-12 text-center shadow-[16px_16px_0_black] max-w-lg">
                <div className="text-8xl mb-6">🔥</div>
                <h1 className="text-6xl font-black uppercase text-gray-900 mb-4">500</h1>
                <h2 className="text-2xl font-black uppercase text-gray-900 mb-6">Server On Fire</h2>
                <p className="text-lg font-bold text-gray-700 mb-8">
                    Something went wrong on our end. Our monkeys are working hard to fix it. Please try again later.
                </p>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-gray-900 text-white font-black uppercase border-2 border-transparent hover:bg-white hover:text-gray-900 hover:border-gray-900 transition-all">
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

export default ServerError;
