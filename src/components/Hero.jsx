const Hero = () => (
  <div className="bg-emerald-50 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="w-full md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-800">
          Smart Time Tracking System
        </h1>
        <p className="text-emerald-600 text-base md:text-lg">
          Effortlessly monitor work hours, manage timesheets, and track
          attendance with our intuitive pointage system. Get real-time insights
          and improve productivity.
        </p>
        <button className="bg-emerald-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-emerald-700 transition-all duration-300 w-full md:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Start Tracking Now
        </button>
      </div>
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <img
          src="/src/assets/tracking.jpg"
          alt="Time Tracking"
          className="w-full md:w-4/5 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  </div>
);
export default Hero;
