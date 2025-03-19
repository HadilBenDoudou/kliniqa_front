import { Gallery4, Gallery4Props } from "@/public/servicesection/blocks/gallery4";

const demoData: Gallery4Props = {
  title: "Healthcare Innovations",
  description:
    "Discover how cutting-edge technologies and solutions are transforming the healthcare industry. These case studies highlight real-world applications that improve patient care, streamline operations, and enhance medical outcomes.",
  items: [
    {
      id: "telemedicine",
      title: "Telemedicine: Connecting Patients and Doctors",
      description:
        "Explore how telemedicine platforms are revolutionizing healthcare delivery by enabling remote consultations, improving access to care, and reducing the burden on physical medical facilities.",
      href: "https://example.com/telemedicine", // Remplacez par un lien réel si disponible
      image: "/service/ashkan-forouzani-ignxm3E1Rg4-unsplash.jpg",
    },
    {
      id: "ehr",
      title: "Electronic Health Records (EHR): Digitizing Patient Data",
      description:
        "Learn how EHR systems are transforming medical record-keeping, offering secure, accessible, and efficient management of patient data to enhance clinical decision-making and care coordination.",
      href: "https://example.com/ehr", // Remplacez par un lien réel si disponible
      image: "/service/olga-guryanova-tMFeatBSS4s-unsplash.jpg",
    },
    {
      id: "ai-diagnostics",
      title: "AI Diagnostics: Precision in Healthcare",
      description:
        "See how artificial intelligence is being leveraged to provide faster and more accurate diagnostics, helping healthcare professionals detect diseases earlier and improve patient outcomes.",
      href: "https://example.com/ai-diagnostics", // Remplacez par un lien réel si disponible
      image: "/service/patty-brito-Y-3Dt0us7e0-unsplash (1).jpg",
    },
    {
      id: "wearables",
      title: "Wearable Health Tech: Monitoring Made Simple",
      description:
        "Discover how wearable devices are empowering patients and doctors with real-time health monitoring, from heart rate tracking to chronic disease management, all in a user-friendly format.",
      href: "https://example.com/wearables", // Remplacez par un lien réel si disponible
      image: "/service/sander-sammy-38Un6Oi5beE-unsplash.jpg",
    },
    {
      id: "pharmacy-automation",
      title: "Pharmacy Automation: Streamlining Medication Delivery",
      description:
        "Explore how automation technologies are optimizing pharmacy operations, reducing errors, and ensuring timely delivery of medications to patients and healthcare providers.",
      href: "https://example.com/pharmacy-automation", // Remplacez par un lien réel si disponible
      image: "/service/cdc-XLhDvfz0sUM-unsplash.jpg",
    },
  ],
};

function Gallery4Demo() {
  return <Gallery4 {...demoData} />;
}

export { Gallery4Demo };