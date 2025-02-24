import { User, Calendar, MessageCircle } from "lucide-react";
import React from "react";

const blogPosts = [
  {
    id: 1,
    title: "Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.",
    date: "18 NOV",
    category: "Food",
    author: "Admin",
    comments: 65,
    image: "/news/Image (6).png",
  },
  {
    id: 2,
    title: "Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.",
    date: "23 JAN",
    category: "Food",
    author: "Admin",
    comments: 65,
    image: "/news/Image (7).png",
  },
  {
    id: 3,
    title: "Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.",
    date: "18 NOV",
    category: "Food",
    author: "Admin",
    comments: 65,
    image: "/news/Image (8).png",
  },
];

const BlogSection = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto text-center">
        <p className="text-red-500 uppercase text-sm font-semibold">Blog</p>
        <h2 className="text-3xl font-bold mt-2">Latest News</h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img src={post.image} alt={post.title} className="w-full h-60 object-cover" />
                <div className="absolute top-4 left-4 bg-white text-black px-3 py-2 rounded-md text-sm font-semibold shadow-md">
                  {post.date}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm space-x-4 mb-3">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {post.category}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    By {post.author}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments} Comments
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                <a href="#" className="text-blue-600 font-medium mt-4 inline-block">
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
