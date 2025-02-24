import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Emplacement */}
        <div className="border rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
          <div className="bg-green-100 p-4 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-green-500" />
          </div>
          <h4 className="text-gray-800 font-semibold">OUR LOCATION</h4>
          <p className="text-gray-500 text-sm">
            1901 Thornridge Cir. Shiloh, Washington DC 20020, United States
          </p>
        </div>

        {/* Contact */}
        <div className="border rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
          <div className="bg-green-100 p-4 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-green-500" />
          </div>
          <h4 className="text-gray-800 font-semibold">CALL US 24/7</h4>
          <p className="text-green-500 text-lg font-semibold">(303) 555-0105</p>
        </div>

        {/* Newsletter */}
        <div className="border rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
          <div className="bg-green-100 p-4 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-green-500" />
          </div>
          <h4 className="text-gray-800 font-semibold">SUBSCRIBE NEWSLETTER</h4>
          <div className="flex mt-2 w-full">
            <input
              type="email"
              placeholder="Your email address"
              className="border px-3 py-2 w-full rounded-l-lg focus:outline-none"
            />
            <Button className="bg-green-500 text-white px-4 py-2 rounded-r-lg">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
