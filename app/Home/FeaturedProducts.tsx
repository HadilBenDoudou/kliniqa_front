"use client";
import { Button } from "@/components/ui/button"; // Importation de ShadCN UI

import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { useState } from "react";

const featuredProducts = [
    { id: 1, name: "Green Apple", price: "$14.99", image: "/products/Image (1).png" },
    { id: 2, name: "Chaisie Cabbage", price: "$14.99", image: "/products/Image (2).png" },
    { id: 3, name: "Green Lettuce", price: "$14.99", image: "/products/Image (1).png" },
    { id: 4, name: "Green Chili", price: "$14.99", image: "/products/Image (4).png" },
    { id: 5, name: "Corn", price: "$14.99", image: "/products/Image (2).png" },
    { id: 6, name: "Corn", price: "$14.99", image: "/products/Image (2).png" },

];

const categoriesss = {
    "Hot Deals": [
        { id: 6, name: "Green Apple", price: "$14.99", image: "/products/Image (5).png" },
        { id: 7, name: "Indian Malta", price: "$14.99", image: "/products/Image (5).png" },
        { id: 8, name: "Green Lettuce", price: "$14.99", image: "/products/Image (5).png" },
    ],
    "Best Seller": [
        { id: 9, name: "Eggplant", price: "$14.99", image: "/products/Image (5).png" },
        { id: 10, name: "Red Capsicum", price: "$14.99", image: "/products/Image (5).png" },
        { id: 11, name: "Red Tomatoes", price: "$14.99", image: "/products/Image (5).png" },
    ],
    "Top Rated": [
        { id: 12, name: "Big Potatoes", price: "$14.99", image: "/products/Image (5).png" },
        { id: 13, name: "Corn", price: "$14.99 $20.99", image: "/products/Image (5).png" },
        { id: 14, name: "Fresh Cauliflower", price: "$14.99", image: "/products/Image (5).png" },
    ],
};

interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
}

const FeaturedProducts = () => {
    const [cart, setCart] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

    const addToCart = (product: Product) => {
        setCart([...cart, product]);
    };

    return (
        <section className="p-8 bg-cover bg-center" style={{ backgroundImage: "url('/pharmacier/para.jpg')" }}>
            <section className="p-8 mx-auto max-w-screen-xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <h2 className="text-3xl font-bold">Featured Pharmacy Essentials</h2>
                    <a href="#" className="text-red-500 font-semibold hover:underline flex items-center mt-4 md:mt-0">
                        Tout les produits <span className="ml-2">→</span>
                    </a>
                </div>
                <p className="text-gray-500 mt-2">
                    Libero diam auctor tristique hendrerit in eu vel id. <br />
                    Nec leo amet suscipit nulla. Nullam vitae sit tempus diam.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {featuredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className={`p-4 border relative shadow-md rounded-lg transition-all ${
                                selectedProduct === product.id ? "border-red-500" : "border-gray-200"
                            }`}
                            onClick={() => setSelectedProduct(product.id)}
                        >
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <Heart className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500" />
                                <Eye className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500" />
                            </div>

                            <img src={product.image} alt={product.name} className="w-full h-32 object-contain" />

                            <CardContent className="text-center">
                                <h3 className="font-semibold mt-2">{product.name}</h3>
                                <p className="text-sm text-gray-600">${product.price}</p>

                                <div className="flex justify-center mt-2">
                                    <div className="flex space-x-1 text-yellow-400">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-2 right-2">
                                    <Button
                                        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(categoriesss).map(([title, products]) => (
                            <div key={title}>
                                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                                <div className="space-y-2">
                                    {products.map((product) => (
                                        <Card
                                            key={product.id}
                                            className="p-2 border flex items-center space-x-4 rounded-lg shadow-sm relative cursor-pointer hover:shadow-md transition"
                                            onClick={() => setSelectedProduct(product.id)}
                                        >
                                            <img src={product.image} alt={product.name} className="w-12 h-12 object-contain" />

                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700">{product.name}</h4>
                                                <p className="text-xs text-gray-600">${product.price}</p>

                                                <div className="flex space-x-1 text-yellow-400 mt-1">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedProduct === product.id && (
                                                <div className="absolute bottom-2 right-2 flex space-x-2">
                                                    <Button className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700">
                                                        <ShoppingBag className="w-5 h-5" />
                                                    </Button>
                                                    <Button className="bg-gray-200 text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-300">
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                    <Button className="bg-gray-200 text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-300">
                                                        <Heart className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="col-span-1 flex items-center justify-center">
                        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                            <p className="text-lg font-bold uppercase tracking-wide">Hot Sale</p>
                            <h2 className="text-2xl font-extrabold mt-2">Save 37% on Every Order</h2>
                            <Button className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 flex items-center">
                                Shop Now
                                <span className="ml-2">→</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default FeaturedProducts;
