"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { fetchProducts, createProduct, Product, CreateProductInput } from "@/lib/services/products/productService";
import { fetchSubcategories, Subcategory } from "@/lib/services/categorie/categoryService";
import { createProductSchema } from "@/lib/validation/produit/schemas";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import {
  Plus,
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/products/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// AnimatedLoadingSkeleton Component
interface GridConfig {
  numCards: number;
  cols: number;
  xBase: number;
  yBase: number;
  xStep: number;
  yStep: number;
}

const AnimatedLoadingSkeleton = () => {
  const [windowWidth, setWindowWidth] = useState(0);
  const controls = useAnimation();

  const getGridConfig = (width: number): GridConfig => {
    const numCards = 8; // Increased to 8 to better match 4 cards per row
    const cols = width >= 1024 ? 4 : width >= 640 ? 2 : 1; // Adjusted to 4 columns on large screens
    return {
      numCards,
      cols,
      xBase: 40,
      yBase: 60,
      xStep: 180, // Reduced to fit 4 cards more comfortably
      yStep: 230,
    };
  };

  const generateSearchPath = (config: GridConfig) => {
    const { numCards, cols, xBase, yBase, xStep, yStep } = config;
    const rows = Math.ceil(numCards / cols);
    let allPositions = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if ((row * cols + col) < numCards) {
          allPositions.push({
            x: xBase + (col * xStep),
            y: yBase + (row * yStep),
          });
        }
      }
    }

    const numRandomCards = 4;
    const shuffledPositions = allPositions
      .sort(() => Math.random() - 0.5)
      .slice(0, numRandomCards);
    shuffledPositions.push(shuffledPositions[0]);

    return {
      x: shuffledPositions.map((pos) => pos.x),
      y: shuffledPositions.map((pos) => pos.y),
      scale: Array(shuffledPositions.length).fill(1.2),
      transition: {
        duration: shuffledPositions.length * 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
        times: shuffledPositions.map((_, i) => i / (shuffledPositions.length - 1)),
      },
    };
  };

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const config = getGridConfig(windowWidth);
    controls.start(generateSearchPath(config));
  }, [windowWidth, controls]);

  const frameVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.2)",
        "0 0 35px rgba(59, 130, 246, 0.4)",
        "0 0 20px rgba(59, 130, 246, 0.2)",
      ],
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const config = getGridConfig(windowWidth);

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
      variants={frameVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <motion.div
          className="absolute z-10 pointer-events-none"
          animate={controls}
          style={{ left: 24, top: 24 }}
        >
          <motion.div
            className="bg-blue-500/20 p-3 rounded-full backdrop-blur-sm"
            variants={glowVariants}
            animate="animate"
          >
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Adjusted to 4 columns */}
          {[...Array(config.numCards)].map((_, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-4"
            >
              <motion.div
                className="h-32 bg-gray-200 rounded-md mb-3"
                animate={{
                  background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-3 w-3/4 bg-gray-200 rounded mb-2"
                animate={{
                  background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-3 w-1/2 bg-gray-200 rounded"
                animate={{
                  background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Simplified ProductCard Component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-lg max-w-sm overflow-hidden bg-white dark:bg-zinc-900 shadow-md flex flex-col">
      <div className="relative w-full h-48 flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.nom}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-black dark:text-neutral-200 mb-2 line-clamp-1">
          {product.nom}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-grow line-clamp-2">
          {product.desc || "No description available."}
        </p>
        <Button
          className={cn(
            "w-full rounded-md py-2 flex items-center justify-between px-4 text-xs font-bold text-white transition-colors",
            product.en_stock
              ? "bg-black hover:bg-gray-800 dark:bg-black dark:hover:bg-gray-800"
              : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
          )}
          asChild
        >
          <div>
            <span>{product.en_stock ? "In Stock" : "Out of Stock"}</span>
            <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0.5 text-white">
              ${product.prix}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}

// Interface for NewProduct
interface NewProduct {
  nom: string;
  ref: string;
  desc?: string;
  qt_stock: number;
  en_stock: boolean;
  prix: number;
  subcategory_id: string;
  brand?: string;
  images: string[];
}

// Custom hook for image upload
function useImageUpload() {
  const previewRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleThumbnailClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        const newUrls = Array.from(files).map((file) => URL.createObjectURL(file));
        const updatedUrls = [...previewUrls, ...newUrls];
        setPreviewUrls(updatedUrls);
        previewRef.current = updatedUrls;
      } catch (error) {
        console.error("Erreur lors de la création des URL d'aperçu:", error);
      }
    }
  };

  const handleRemove = (index: number) => {
    const urlToRemove = previewUrls[index];
    if (urlToRemove) URL.revokeObjectURL(urlToRemove);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);
    previewRef.current = updatedUrls;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return {
    previewUrls,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}

export default function ProductCardView({ userId }: { userId: number | null }) {
  const queryClient = useQueryClient();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    nom: "",
    ref: "",
    desc: "",
    qt_stock: 0,
    en_stock: true,
    prix: 0,
    subcategory_id: "",
    brand: "",
    images: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { previewUrls, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload();

  const { data: products = [], isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ["products", userId],
    queryFn: () => fetchProducts(userId!),
    enabled: !!userId,
  });

  const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: () => fetchSubcategories(),
    enabled: true,
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", userId] });
      setIsAddProductOpen(false);
      setNewProduct({
        nom: "",
        ref: "",
        desc: "",
        qt_stock: 0,
        en_stock: true,
        prix: 0,
        subcategory_id: "",
        brand: "",
        images: [],
      });
      handleRemove(0);
      setCurrentImageIndex(0);
      setValidationErrors({});
    },
    onError: (error: any) => {
      console.error("Error creating product:", error.message);
    },
  });

  const handleAddProduct = () => {
    if (!userId) {
      setValidationErrors({ general: "User ID is not defined" });
      return;
    }

    const productData: CreateProductInput = {
      nom: newProduct.nom,
      ref: newProduct.ref,
      desc: newProduct.desc || undefined,
      qt_stock: Number(newProduct.qt_stock),
      en_stock: Boolean(newProduct.en_stock),
      prix: Number(newProduct.prix),
      subcategory_id: Number(newProduct.subcategory_id),
      brand: newProduct.brand || undefined,
      created_by: userId,
      image: fileInputRef.current?.files?.[0],
    };

    const result = createProductSchema.safeParse(productData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setValidationErrors(
        Object.fromEntries(
          Object.entries(errors).map(([key, value]) => [key, value?.[0] || "Invalid value"])
        )
      );
      return;
    }

    setValidationErrors({});
    createProductMutation.mutate(productData);
  };

  const handlePrevImage = (prev: number) => {
    setCurrentImageIndex(prev > 0 ? prev - 1 : previewUrls.length - 1);
  };

  const handleNextImage = (prev: number) => {
    setCurrentImageIndex(prev < previewUrls.length - 1 ? prev + 1 : 0);
  };

  if (isProductsLoading) return <AnimatedLoadingSkeleton />;
  if (productsError) return <div>Error loading products: {(productsError as Error).message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="border-b border-border px-6 py-4 text-base">
                Add New Product
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="sr-only">
              Fill in the details to add a new product to your inventory.
            </DialogDescription>
            <div className="overflow-y-auto max-h-[80vh]">
              <div className="h-32 relative">
                <div className="flex h-full w-full items-center justify-center overflow-hidden bg-muted">
                  {previewUrls.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        className="h-full w-full object-cover"
                        src={previewUrls[currentImageIndex]}
                        alt={`Preview ${currentImageIndex + 1}`}
                        width={512}
                        height={96}
                      />
                      {previewUrls.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            onClick={() => handlePrevImage(currentImageIndex)}
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={16} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            onClick={() => handleNextImage(currentImageIndex)}
                            aria-label="Next image"
                          >
                            <ChevronRight size={16} strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No image selected</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
                      onClick={handleThumbnailClick}
                      aria-label="Upload image"
                    >
                      <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
                    </button>
                    {previewUrls.length > 0 && (
                      <button
                        type="button"
                        className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
                        onClick={() => handleRemove(currentImageIndex)}
                        aria-label="Remove current image"
                      >
                        <X size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  aria-label="Upload product image"
                />
                {previewUrls.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {previewUrls.length}
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 pt-4">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={newProduct.nom}
                      onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                    {validationErrors.nom && (
                      <p className="text-red-500 text-sm">{validationErrors.nom}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ref">Reference</Label>
                    <Input
                      id="ref"
                      value={newProduct.ref}
                      onChange={(e) => setNewProduct({ ...newProduct, ref: e.target.value })}
                      placeholder="Enter reference"
                      required
                    />
                    {validationErrors.ref && (
                      <p className="text-red-500 text-sm">{validationErrors.ref}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input
                      id="desc"
                      value={newProduct.desc}
                      onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qt_stock">Quantity in Stock</Label>
                    <Input
                      id="qt_stock"
                      type="number"
                      value={newProduct.qt_stock || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, qt_stock: Number(e.target.value) })}
                      placeholder="Enter stock quantity"
                      min="0"
                      required
                    />
                    {validationErrors.qt_stock && (
                      <p className="text-red-500 text-sm">{validationErrors.qt_stock}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="en_stock">Stock Status</Label>
                    <Select
                      value={newProduct.en_stock ? "In Stock" : "Out of Stock"}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, en_stock: value === "In Stock" })
                      }
                    >
                      <SelectTrigger id="en_stock" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[1000]">
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix">Price ($)</Label>
                    <Input
                      id="prix"
                      type="number"
                      value={newProduct.prix || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, prix: Number(e.target.value) })}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                    {validationErrors.prix && (
                      <p className="text-red-500 text-sm">{validationErrors.prix}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    {isSubcategoriesLoading ? (
                      <div>Loading subcategories...</div>
                    ) : (
                      <Select
                        value={newProduct.subcategory_id}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, subcategory_id: value })
                        }
                      >
                        <SelectTrigger id="subcategory" className="w-full">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent className="z-[1000] max-h-[200px] overflow-y-auto">
                          {subcategories.map((subcategory) => (
                            <SelectItem
                              key={subcategory.id}
                              value={subcategory.id.toString()}
                            >
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {validationErrors.subcategory_id && (
                      <p className="text-red-500 text-sm">{validationErrors.subcategory_id}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      placeholder="Enter brand name"
                    />
                  </div>
                  {validationErrors.general && (
                    <p className="text-red-500 text-sm">{validationErrors.general}</p>
                  )}
                </form>
              </div>
            </div>
            <DialogFooter className="border-t border-border px-6 py-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleAddProduct}
                disabled={
                  createProductMutation.isPending ||
                  !newProduct.nom ||
                  !newProduct.ref ||
                  !newProduct.subcategory_id ||
                  newProduct.prix <= 0 ||
                  newProduct.qt_stock < 0 ||
                  !userId
                }
              >
                {createProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"> {/* Changed md:grid-cols-3 to md:grid-cols-4 */}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}