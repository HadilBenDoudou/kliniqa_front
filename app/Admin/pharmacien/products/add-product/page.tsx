// pages/add-product.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchSubcategories, Subcategory } from "@/lib/services/categorie/categoryService";
import { createProduct, CreateProductInput } from "@/lib/services/products/productService";
import { createProductSchema } from "@/lib/validation/produit/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import AppLayout from "@/components/ui/pharmacien/AppLayout";

// Interface for options
interface Option {
  value: string;
  text: string;
}

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

interface UseImageUploadProps {
  onUpload?: (urls: string[]) => void;
}

function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
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
        onUpload?.(updatedUrls);
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

  return {
    previewUrls,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}

export default function AddProductPage({ userId }: { userId: number | null }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: () => fetchSubcategories(),
    enabled: true,
  });

  const [productNameOptions, setProductNameOptions] = useState<Option[]>([]);
  const [isProductNameOptionsLoading, setIsProductNameOptionsLoading] = useState(true);
  const [productNameOptionsError, setProductNameOptionsError] = useState<string | null>(null);
  const [labOptions, setLabOptions] = useState<Option[]>([]);
  const [isLabOptionsLoading, setIsLabOptionsLoading] = useState(true);
  const [labOptionsError, setLabOptionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsProductNameOptionsLoading(true);
        const productNameResponse = await fetch("/json/options.json");
        if (!productNameResponse.ok) {
          throw new Error("Erreur lors du chargement de options.json");
        }
        const productNameData: Option[] = await productNameResponse.json();
        const validProductNameOptions = productNameData.filter((option) => option.value !== "");
        setProductNameOptions(validProductNameOptions);

        setIsLabOptionsLoading(true);
        const labResponse = await fetch("/json/code_labo_options.json");
        if (!labResponse.ok) {
          throw new Error("Erreur lors du chargement de code_labo_options.json");
        }
        const labData: Option[] = await labResponse.json();
        const validLabOptions = labData.filter((option) => option.value !== "");
        setLabOptions(validLabOptions);
      } catch (error) {
        console.error("Erreur lors du chargement des options:", error);
        setProductNameOptionsError("Impossible de charger les options de nom.");
        setLabOptionsError("Impossible de charger les options de laboratoire.");
      } finally {
        setIsProductNameOptionsLoading(false);
        setIsLabOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", userId] });
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
      setProductNameSearch("");
      setLabSearch("");
      router.push("/products");
    },
  });

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
  const [productNameSearch, setProductNameSearch] = useState("");
  const [isProductNameDropdownOpen, setIsProductNameDropdownOpen] = useState(false);
  const [labSearch, setLabSearch] = useState("");
  const [isLabDropdownOpen, setIsLabDropdownOpen] = useState(false);
  const { previewUrls, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload();

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: newProduct.desc || "",
    onUpdate: ({ editor }) => {
      setNewProduct({ ...newProduct, desc: editor.getHTML() });
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

  const filteredProductNameOptions = productNameOptions.filter((option) =>
    option.text.toLowerCase().includes(productNameSearch.toLowerCase())
  );

  const filteredLabOptions = labOptions.filter((option) =>
    option.text.toLowerCase().includes(labSearch.toLowerCase())
  );

  return (
    <AppLayout>
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">
            You can see all sales analysis results more clearly and completely
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/pharmacien/products")}>
            Cancel
          </Button>
          <Button
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
            className="bg-[#6b48ff] hover:bg-[#5a3de6] text-white"
          >
            {createProductMutation.isPending ? "Adding..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Column: Thumbnail and Status */}
        <div className="w-1/3 space-y-6">
          {/* Thumbnail Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium block mb-2">Thumbnail</Label>
            <div className="h-48 relative border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                {previewUrls.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img
                      className="h-full w-full object-contain"
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
                  <span className="text-gray-500">No image selected</span>
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
            <p className="text-xs text-gray-500 mt-2">
              Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted.
            </p>
          </div>

          {/* Set Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium block mb-2">Set Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="en_stock"
                checked={newProduct.en_stock}
                onCheckedChange={(checked) =>
                  setNewProduct({ ...newProduct, en_stock: checked })
                }
              />
              <Label htmlFor="en_stock" className="text-sm">
                {newProduct.en_stock ? "Published" : "Draft"}
              </Label>
              {newProduct.en_stock && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabs and Form */}
        <div className="w-2/3">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="flex border-b border-gray-200 mb-6">
              <TabsTrigger
                value="general"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#6b48ff] data-[state=active]:font-bold"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="advance"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#6b48ff] data-[state=active]:font-bold"
              >
                Advance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* General Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name" className="text-sm font-medium">
                    Product Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="product-name"
                      value={productNameSearch}
                      onChange={(e) => {
                        setProductNameSearch(e.target.value);
                        setIsProductNameDropdownOpen(true);
                      }}
                      onFocus={() => setIsProductNameDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsProductNameDropdownOpen(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsProductNameDropdownOpen(false);
                        }
                      }}
                      placeholder="New Balance 2002R Light Grey"
                      className="w-full"
                      autoComplete="off"
                      aria-autocomplete="list"
                      aria-controls="product-name-options"
                      aria-expanded={isProductNameDropdownOpen}
                    />
                    {isProductNameOptionsLoading ? (
                      <div className="text-gray-500">Loading product names...</div>
                    ) : productNameOptionsError ? (
                      <p className="text-red-500 text-sm">{productNameOptionsError}</p>
                    ) : filteredProductNameOptions.length > 0 && isProductNameDropdownOpen && productNameSearch ? (
                      <div
                        id="product-name-options"
                        className="absolute top-full w-full mt-1 z-[1000] max-h-[200px] overflow-y-auto border border-gray-200 rounded-md shadow-sm bg-white"
                      >
                        {filteredProductNameOptions.map((option) => (
                          <div
                            key={option.value}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                            onMouseDown={() => {
                              setNewProduct({ ...newProduct, nom: option.value });
                              setProductNameSearch(option.text);
                              setIsProductNameDropdownOpen(false);
                            }}
                            role="option"
                            aria-selected={newProduct.nom === option.value}
                          >
                            {option.text}
                          </div>
                        ))}
                      </div>
                    ) : productNameSearch && !isProductNameOptionsLoading && !productNameOptionsError ? (
                      <div className="absolute top-full w-full mt-1 z-[1000] text-gray-500 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
                        No matching product names found.
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500">
                    A product name is required and recommended to be unique.
                  </p>
                  {validationErrors.nom && (
                    <p className="text-red-500 text-sm">{validationErrors.nom}</p>
                  )}
                </div>

                {/* Description Section with Tiptap */}
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-sm font-medium">
                    Description
                  </Label>
                  <div className="border border-gray-200 rounded-md">
                    <div className="flex gap-2 p-2 border-b border-gray-200 bg-gray-100">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1 ${editor?.isActive("bold") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1 ${editor?.isActive("italic") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Italic"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className={`p-1 ${editor?.isActive("underline") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Underline"
                      >
                        <u>U</u>
                      </button>
                      <select
                        onChange={(e) => {
                          const level = parseInt(e.target.value);
                          if (level === 0) {
                            editor?.chain().focus().setParagraph().run();
                          } else {
                            // Assert that level is a valid Level type (1, 2, or 3 in this case)
                            editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                          }
                        }}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        title="Heading"
                      >
                        <option value="0">Normal</option>
                        <option value="1">H1</option>
                        <option value="2">H2</option>
                        <option value="3">H3</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`p-1 ${editor?.isActive("bulletList") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Bullet List"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`p-1 ${editor?.isActive("orderedList") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Ordered List"
                      >
                        1.
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = window.prompt("Enter the URL");
                          if (url) {
                            editor?.chain().focus().setLink({ href: url }).run();
                          }
                        }}
                        className={`p-1 ${editor?.isActive("link") ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Link"
                      >
                        🔗
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                        className={`p-1 ${editor?.isActive("textAlign", { textAlign: "left" }) ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Align Left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                        className={`p-1 ${editor?.isActive("textAlign", { textAlign: "center" }) ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Align Center"
                      >
                        ↔
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                        className={`p-1 ${editor?.isActive("textAlign", { textAlign: "right" }) ? "bg-gray-300" : "bg-gray-200"} rounded hover:bg-gray-300`}
                        title="Align Right"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().undo().run()}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        title="Undo"
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().redo().run()}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        title="Redo"
                      >
                        ↻
                      </button>
                    </div>
                    <EditorContent
                      editor={editor}
                      className="w-full h-40 p-3 text-sm overflow-y-auto"
                      placeholder="If you unsure regarding your size, please click the size chart button and browse through the chart to find your correct measurements. For more details, kindly add our Customer Service to consult further."
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Set a description to the product for better visibility
                  </p>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="space-y-2">
                  <Label htmlFor="prix" className="text-sm font-medium">
                    Price ($)
                  </Label>
                  <Input
                    id="prix"
                    type="number"
                    value={newProduct.prix || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, prix: Number(e.target.value) })}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                    className="w-full"
                  />
                  {validationErrors.prix && (
                    <p className="text-red-500 text-sm">{validationErrors.prix}</p>
                  )}
                </div>
              </div>

              {/* Hidden Fields (for validation) */}
              <div className="space-y-2 hidden">
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
              <div className="space-y-2 hidden">
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
              <div className="space-y-2 hidden">
                <Label htmlFor="subcategory">Subcategory</Label>
                {isSubcategoriesLoading ? (
                  <div>Loading subcategories...</div>
                ) : (
                  <select
                    id="subcategory"
                    value={newProduct.subcategory_id}
                    onChange={(e) => setNewProduct({ ...newProduct, subcategory_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-md p-2"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                )}
                {validationErrors.subcategory_id && (
                  <p className="text-red-500 text-sm">{validationErrors.subcategory_id}</p>
                )}
              </div>
              <div className="space-y-2 hidden">
                <Label htmlFor="brand">Laboratoire</Label>
                <div className="relative">
                  <Input
                    id="brand"
                    value={labSearch}
                    onChange={(e) => {
                      setLabSearch(e.target.value);
                      setIsLabDropdownOpen(true);
                    }}
                    onFocus={() => setIsLabDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsLabDropdownOpen(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsLabDropdownOpen(false);
                      }
                    }}
                    placeholder="Type to search laboratories..."
                    className="w-full"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls="lab-options"
                    aria-expanded={isLabDropdownOpen}
                  />
                  {isLabOptionsLoading ? (
                    <div className="text-gray-500">Loading laboratories...</div>
                  ) : labOptionsError ? (
                    <p className="text-red-500 text-sm">{labOptionsError}</p>
                  ) : filteredLabOptions.length > 0 && isLabDropdownOpen && labSearch ? (
                    <div
                      id="lab-options"
                      className="absolute top-full w-full mt-1 z-[1000] max-h-[200px] overflow-y-auto border border-gray-200 rounded-md shadow-sm bg-white"
                    >
                      {filteredLabOptions.map((option) => (
                        <div
                          key={option.value}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                          onMouseDown={() => {
                            setNewProduct({ ...newProduct, brand: option.value });
                            setLabSearch(option.text);
                            setIsLabDropdownOpen(false);
                          }}
                          role="option"
                          aria-selected={newProduct.brand === option.value}
                        >
                          {option.text}
                        </div>
                      ))}
                    </div>
                  ) : labSearch && !isLabOptionsLoading && !labOptionsError ? (
                    <div className="absolute top-full w-full mt-1 z-[1000] text-gray-500 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
                      No matching laboratories found.
                    </div>
                  ) : null}
                </div>
              </div>
              {validationErrors.general && (
                <p className="text-red-500 text-sm">{validationErrors.general}</p>
              )}
            </TabsContent>

            <TabsContent value="advance">
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Advance Settings</h3>
                <p className="text-sm text-gray-500">
                  Additional settings will be added here in the future.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div></AppLayout>
  );
}