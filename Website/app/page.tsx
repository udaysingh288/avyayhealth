import Nav from "./components/Nav";
import Hero from "./components/Hero";
import LogoStrip from "./components/LogoStrip";
import Benefits from "./components/Benefits";
import DemoSection from "./components/DemoSection";
import ProblemSection from "./components/ProblemSection";
import HowItWorks from "./components/HowItWorks";
import Comparison from "./components/Comparison";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="font-sans text-[#1A1A1A]">
      <Nav />
      <Hero />
      <LogoStrip />
      <Benefits />
      <DemoSection />
      <ProblemSection />
      <HowItWorks />
      <Comparison />
      <ContactForm />
      <Footer />
    </main>
  );
}
