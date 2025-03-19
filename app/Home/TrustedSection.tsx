import { Layout, Pointer, Zap } from "lucide-react";
import { Feature108 } from "@/components/ui/trust/shadcnblocks-com-feature108";

const demoData = {
  heading: "Digital Solutions for Healthcare and Medicine",
  description: "Partner with us to revolutionize healthcare with modern digital tools.",
  tabs: [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Clinical Efficiency",
      content: {
        badge: "Modern Technologies",
        title: "Enhance Your Healthcare Services.",
        description:
          "Leverage cutting-edge digital innovations to build efficient medical platforms that streamline patient management and boost clinical outcomes.",
        buttonText: "View Plans",
        imageSrc: "/trust/Group 8 (1).png",
        imageAlt: "Clinical Efficiency Solution",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Patient Engagement",
      content: {
        badge: "Advanced Features",
        title: "Strengthen Patient Connections.",
        description:
          "Provide an intuitive and functional design to improve access to healthcare services, retain patients, and ensure a seamless and engaging experience.",
        buttonText: "Explore Tools",
        imageSrc: "/trust/jeshoots-com-l0j0DHVWcIE-unsplash.jpg",
        imageAlt: "Patient Engagement",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Intuitive Management",
      content: {
        badge: "Healthcare Solutions",
        title: "Develop Advanced Medical Management.",
        description:
          "Use modern technologies to simplify the management of medical records, appointments, and resources, delivering a standout digital experience in healthcare.",
        buttonText: "Discover Options",
        imageSrc: "/trust/anton-8q-U8X1zkvI-unsplash.jpg",
        imageAlt: "Intuitive Healthcare Management",
      },
    },
  ],
};

function Feature108Demo() {
  return <Feature108 {...demoData} />;
}

export { Feature108Demo };