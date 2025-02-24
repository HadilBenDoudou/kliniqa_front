import React from "react";
import Header from "./Header";
import TrustedSection from "./TrustedSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TestimonialSection from "./TestimonialSection";
import Hero from "./Hero";
import Services from "./services";
import DoctorsSection from "./DoctorsSection";
import FeaturedProducts from "./FeaturedProducts";
import BlogSection from "./BlogSection";
import ContactSection from "./ContactSection";

export default function Home() {
  return (
    <div>  {/* Wrap everything in a single parent element */}
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
    </div>
  );
}