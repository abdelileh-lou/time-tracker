const Hero = () => (
  <div className="bg-sky-50 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="w-full md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sky-900">
          Smart Time Tracking System
        </h1>
        <p className="text-sky-700 text-base md:text-lg">
          Effortlessly monitor work hours, manage timesheets, and track
          attendance with our intuitive pointage system. Get real-time insights
          and improve productivity.
        </p>
        <button
          className="bg-sky-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg 
          hover:bg-sky-700 transition-all duration-300 w-full md:w-auto 
          shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Start Tracking Now
        </button>
      </div>
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <div className="relative group">
          <div
            className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-sky-600 
            rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <img
            src="/src/assets/tracking.jpg"
            alt="Time Tracking"
            className="relative w-full md:w-4/5 rounded-lg shadow-2xl 
              transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  </div>
);

export default Hero;
