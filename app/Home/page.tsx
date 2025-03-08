import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Hero from "./Hero";
import DoctorsSection from "./DoctorsSection";
import FeaturedProducts from "./FeaturedProducts";
import BlogSection from "./BlogSection";
import ContactSection from "./ContactSection";
import {Navbar} from "./Navbar";
import { CardHoverEffectDemo } from "./services";
import { TestimonialsSectionDemo } from "./TestimonialSection";
import { Feature108Demo } from "./TrustedSection";

export default function Home() {
  return (
    <div>  {/* Wrap everything in a single parent element */}
    
      <Navbar />
      <Hero />
      <CardHoverEffectDemo />
      <Feature108Demo />
      <DoctorsSection />
      <FeaturedProducts />
      <BlogSection />
      <TestimonialsSectionDemo />
      <ContactSection />
      <Footer />
    </div>
  );
}