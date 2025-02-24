import Header from "./Home/Header";
import Navbar from "./Home/Navbar";
import Hero from "./Home/Hero";
import FeaturedProducts from "./Home/FeaturedProducts";
import Services from "./Home/services";
import TrustedSection from "./Home/TrustedSection";
import DoctorsSection from "./Home/DoctorsSection";
import BlogSection from "./Home/BlogSection";
import TestimonialSection from "./Home/TestimonialSection";
import ContactSection from "./Home/ContactSection";
import Footer from "./Home/Footer";
  import ServiceSection from "./Home/ServiceSection";
const Home: React.FC = () => {
  return (
    <>
      <Header />
     <Navbar />
     <Hero />
      <Services />
      <TrustedSection />
      <DoctorsSection />
      <FeaturedProducts />
      <BlogSection />
      <TestimonialSection />
      <ContactSection />
      
      <Footer />


    </>
  );
};

export default Home;
