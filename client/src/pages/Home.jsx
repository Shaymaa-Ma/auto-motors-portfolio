
import React from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import ServicesSection from "../components/sections/ServicesSection";
import ProductsSection from "../components/sections/ProductsSection";
import VehiclesSection from "../components/sections/VehiclesSection";
import AdvantagesSection from "../components/sections/AdvantagesSection";
import GallerySection from "../components/sections/GallerySection";
import FAQSection from "../components/sections/FAQSection";
import ContactSection from "../components/sections/ContactSection";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProductsSection />
        <VehiclesSection />
        <AdvantagesSection />
        <GallerySection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}

export default Home;
