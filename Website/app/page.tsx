import Nav from "./components/Nav";
import Hero from "./components/Hero";
import DemoSection from "./components/DemoSection";
import ProblemSection from "./components/ProblemSection";
import HowItWorks from "./components/HowItWorks";
import Comparison from "./components/Comparison";
import FAQ from "./components/FAQ";
import ContactForm from "./components/ContactForm";
import Founders from "./components/Founders";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="font-sans text-[#1A1A1A]">
      <Nav />
      <Hero />
      <DemoSection />
      <ProblemSection />
      <HowItWorks />
      <Comparison />
      <FAQ />
      <ContactForm />
      <Founders />
      <Footer />
    </main>
  );
}
