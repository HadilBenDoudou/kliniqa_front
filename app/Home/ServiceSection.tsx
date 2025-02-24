import { motion } from 'framer-motion';

const services = [
  { name: 'Routine Check-Ups' },
  { name: 'Prosthodontics', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
  { name: 'Pediatric Dentistry' },
  { name: 'Cosmetic Dentistry' },
];

const ServiceSection = () => {
  return (
    <section 
      className="py-16 px-6 flex flex-col items-center bg-cover bg-center relative text-white text-center"
      style={{ backgroundImage: "url('/service/blue.png')" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold">Our Services</h2>
        <p className="text-lg mt-3 max-w-2xl mx-auto opacity-90">
          Your journey to better health starts with a simple, efficient, and patient-focused appointment booking process.
        </p>
      </div>

      {/* Section des services */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl px-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="relative p-6 rounded-lg shadow-lg min-h-[260px] flex flex-col justify-end transition-all bg-gray-300 text-black overflow-hidden group"
          >
            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity"></div>

            {/* Contenu du service */}
            <h3 className="text-lg font-semibold relative z-10 transition-all">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-sm text-gray-600 mt-2 relative z-10 transition-all">
                {service.description}
              </p>
            )}

            {/* Bouton flèche visible au hover sur chaque service */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white p-3 rounded-full shadow-md">
                ➡
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton View All Services aligné en bas à droite */}
      <div className="mt-10 w-full max-w-7xl flex justify-end px-10">
        <button className="border border-white text-white py-2 px-6 rounded-md text-sm tracking-wide hover:bg-white hover:text-blue-600 transition">
          View All Services
        </button>
      </div>
    </section>
  );
};export default ServiceSection;
