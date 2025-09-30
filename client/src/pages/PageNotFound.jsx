import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floating money symbols */}
                <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">💰</div>
                <div className="absolute top-32 right-20 text-4xl opacity-10 animate-float-delayed">💸</div>
                <div className="absolute bottom-32 left-20 text-5xl opacity-10 animate-float">📊</div>
                <div className="absolute bottom-20 right-32 text-3xl opacity-10 animate-float-delayed">💳</div>
                <div className="absolute top-1/2 left-1/4 text-7xl opacity-5 animate-float">💵</div>
                <div className="absolute top-1/3 right-1/3 text-4xl opacity-10 animate-float-delayed">🪙</div>

                {/* Interactive background gradient */}
                <div
                    className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)`
                    }}
                ></div>
            </div>

            {/* Main Content */}
            <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="text-center max-w-2xl mx-auto">

                    {/* 404 Number with Animation */}
                    <div className="mb-8 relative">
                        <div className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse select-none">
                            404
                            <div>
                                <span className="text-2xl md:text-3xl font-semibold text-gray-700 block mt-4">
                                    Page Not Found
                                </span>
                            </div>
                        </div>

                        {/* Floating elements around 404 */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-teal-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 -left-8 w-4 h-4 bg-purple-500 rounded-full opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>


                    {/* Help Section */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-4">
                            Still lost? Here are some helpful links:
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <a href="#" className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                📊 Dashboard
                            </a>
                            <a href="#" className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                💳 Expenses
                            </a>
                            <Link to="/tracker" className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                🎯 Login
                            </Link>
                            <a href="#" className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                ❓ Help Center
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
        </div>
    );
};

export default PageNotFound;