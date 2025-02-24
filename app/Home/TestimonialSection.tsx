import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Importation de ShadCN UI

const testimonials = [
  {
    id: 1,
    name: "Robert Fox",
    role: "Customer",
    image: "/profile/Image (9).png",
    text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget",
    rating: 5,
  },
  {
    id: 2,
    name: "Dianne Russell",
    role: "Customer",
    image: "/profile/Image (10).png",
    text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget",
    rating: 5,
  },
  {
    id: 3,
    name: "Eleanor Pena",
    role: "Customer",
    image: "/profile/Image (11).png",
    text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget",
    rating: 5,
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-200">
      <div className="container mx-auto text-center">
        <p className="text-red-500 uppercase text-sm font-semibold tracking-wider">
          Testimonial
        </p>
        <h2 className="text-4xl font-bold mt-2">What Our Customer Says</h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-start">
                <Image src="/quote/Vector (1).png" alt="Quote" width={32} height={32} />
              </div>
              <p className="text-gray-600 mt-4">{testimonial.text}</p>

              <div className="flex items-center mt-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
                <div className="ml-auto text-yellow-500">
                  {"★".repeat(testimonial.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4 mt-12">
          <Button className="p-3 bg-gray-200 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <Button className="p-3 bg-blue-600 text-white rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
