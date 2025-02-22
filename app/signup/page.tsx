"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

const submitRegistration = async (formData: any) => {
    try {
      const response = await axios.post("http://localhost:3000/register", {
        utilisateur: {
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
        },
        adresse: {
          num_street: formData.num_street,
          street: formData.street,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
          longitude: formData.longitude,
          latitude: formData.latitude,
        },
        pharmacien: {
          cartePro: formData.cartePro,
          diplome: formData.diplome,
          assurancePro: formData.assurancePro,
        },
        pharmacie: {
          nomp: formData.nomp,
          docPermis: formData.docPermis,
          docAutorisation: formData.docAutorisation,
        },
      }, {
        withCredentials: true, // Ajouter ceci si tu veux envoyer des cookies ou des en-têtes d'authentification
      });
  
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Une erreur est survenue");
    }
  };
  
export default function Signup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    telephone: "",
    num_street: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    longitude: "",
    latitude: "",
    cartePro: "",
    diplome: "",
    assurancePro: "",
    nomp: "",
    docPermis: "",
    docAutorisation: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Utilisation de TanStack Query pour la soumission du formulaire
  const { mutateAsync: register, status, error } = useMutation<any, Error, typeof formData>({
    mutationFn: submitRegistration,
    onSuccess: (data: any) => {
      setSuccessMessage(data.message);
      setErrorMessage(""); // Efface les erreurs précédentes
    },
    onError: (err) => {
      setErrorMessage(err.message || "Une erreur s'est produite");
      setSuccessMessage(""); // Efface les messages de succès précédents
    },
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData); // Lancer la mutation
    } catch (error) {
      // Les erreurs sont gérées par onError de useMutation
    }
  };

  const renderStep1 = () => (
    <div className="space-y-2">
      <Label htmlFor="nom">Nom</Label>
      <Input
        id="nom"
        type="text"
        name="nom"
        value={formData.nom}
        onChange={handleChange}
        required
      />
      <Label htmlFor="prenom">Prénom</Label>
      <Input
        id="prenom"
        type="text"
        name="prenom"
        value={formData.prenom}
        onChange={handleChange}
        required
      />
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Label htmlFor="password">Mot de passe</Label>
      <Input
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <Label htmlFor="telephone">Téléphone</Label>
      <Input
        id="telephone"
        type="text"
        name="telephone"
        value={formData.telephone}
        onChange={handleChange}
        required
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-2">
      <Label htmlFor="num_street">Numéro de rue</Label>
      <Input
        id="num_street"
        type="text"
        name="num_street"
        value={formData.num_street}
        onChange={handleChange}
        required
      />
      <Label htmlFor="street">Rue</Label>
      <Input
        id="street"
        type="text"
        name="street"
        value={formData.street}
        onChange={handleChange}
        required
      />
      <Label htmlFor="city">Ville</Label>
      <Input
        id="city"
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
      />
      <Label htmlFor="postal_code">Code postal</Label>
      <Input
        id="postal_code"
        type="text"
        name="postal_code"
        value={formData.postal_code}
        onChange={handleChange}
        required
      />
      <Label htmlFor="country">Pays</Label>
      <Input
        id="country"
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        required
      />
      <Label htmlFor="longitude">Longitude</Label>
      <Input
        id="longitude"
        type="text"
        name="longitude"
        value={formData.longitude}
        onChange={handleChange}
        required
      />
      <Label htmlFor="latitude">Latitude</Label>
      <Input
        id="latitude"
        type="text"
        name="latitude"
        value={formData.latitude}
        onChange={handleChange}
        required
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-2">
      <Label htmlFor="cartePro">Carte Professionnelle</Label>
      <Input
        id="cartePro"
        type="file"
        name="cartePro"
        value={formData.cartePro}
        onChange={handleChange}
        required
      />
      <Label htmlFor="diplome">Diplôme</Label>
      <Input
        id="diplome"
        type="file"
        name="diplome"
        value={formData.diplome}
        onChange={handleChange}
        required
      />
      <Label htmlFor="assurancePro">Assurance Professionnelle</Label>
      <Input
        id="assurancePro"
        type="file"
        name="assurancePro"
        value={formData.assurancePro}
        onChange={handleChange}
        required
      />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-2">
      <Label htmlFor="nomp">Nom de la pharmacie</Label>
      <Input
        id="nomp"
        type="text"
        name="nomp"
        value={formData.nomp}
        onChange={handleChange}
        required
      />
      <Label htmlFor="docPermis">Document Permis</Label>
      <Input
        id="docPermis"
        type="file"
        name="docPermis"
        value={formData.docPermis}
        onChange={handleChange}
        required
      />
      <Label htmlFor="docAutorisation">Document Autorisation</Label>
      <Input
        id="docAutorisation"
        type="file"
        name="docAutorisation"
        value={formData.docAutorisation}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold tracking-tighter">Inscription</h1>
            <p className="text-muted-foreground">Remplissez les informations ci-dessous</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between">
              {currentStep > 1 && <Button type="button" onClick={handlePreviousStep}>Retour</Button>}
              {currentStep < 4 && <Button type="button" onClick={handleNextStep}>Suivant</Button>}
              {currentStep === 4 && <Button type="submit" disabled={status === 'pending'}>Soumettre</Button>}
            </div>
          </form>

          {/* Affichage des messages de succès ou d'erreur */}
          {successMessage && <div className="text-green-500">{successMessage}</div>}
          {error && <div className="text-red-500">{errorMessage || error?.message}</div>}
          {status === 'pending' && <div>Chargement...</div>}
        </div>
      </motion.div>
    </div>
  );
}
