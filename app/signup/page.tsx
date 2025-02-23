"use client";
import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

type FormData = {
  utilisateur: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: string;
  };
  adresse: {
    num_street: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
    longitude: string;
    latitude: string;
  };
  pharmacien: {
    cartePro: string;
    diplome: string;
  };
  pharmacie: {
    nom: string;
    docPermis: string;
    docAutorisation: string;
  };
};

const initialFormData: FormData = {
  utilisateur: {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'utilisateur',
  },
  adresse: {
    num_street: '',
    street: '',
    city: '',
    postal_code: '',
    country: '',
    longitude: '',
    latitude: '',
  },
  pharmacien: {
    cartePro: '',
    diplome: '',
  },
  pharmacie: {
    nom: '',
    docPermis: '',
    docAutorisation: '',
  },
};

const signupSchema = z.object({
  utilisateur: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    nom: z.string().min(1),
    prenom: z.string().min(1),
    telephone: z.string().min(10),
    role: z.enum(['utilisateur', 'pharmacien']),
  }),
  adresse: z.object({
    num_street: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
    longitude: z.string().optional(),
    latitude: z.string().optional(),
  }),
  pharmacien: z.object({
    cartePro: z.string().optional(),
    diplome: z.string().optional(),
  }),
  pharmacie: z.object({
    nom: z.string().min(1),
    docPermis: z.string().optional(),
    docAutorisation: z.string().optional(),
  }),
});

const SignupForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value,
      },
    }));
  };

  const { mutate, status, isError, error, isSuccess } = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('http://localhost:3000/register', data);
      return response.data;
    },
    onError: (err) => {
      console.error('Error:', err);
    },
    onSuccess: (data) => {
      console.log('User registered successfully', data);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    try {
      signupSchema.parse(formData);
      mutate(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(err.errors.map((error) => error.message));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>

      {/* User Information */}
      <div>
        <label>Email</label>
        <input
          type="email"
          name="utilisateur.email"
          value={formData.utilisateur.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          name="utilisateur.password"
          value={formData.utilisateur.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="utilisateur.nom"
          value={formData.utilisateur.nom}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Surname</label>
        <input
          type="text"
          name="utilisateur.prenom"
          value={formData.utilisateur.prenom}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Phone</label>
        <input
          type="text"
          name="utilisateur.telephone"
          value={formData.utilisateur.telephone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Role</label>
        <select
          name="utilisateur.role"
          value={formData.utilisateur.role}
          onChange={handleChange}
        >
          <option value="utilisateur">User</option>
          <option value="pharmacien">Pharmacist</option>
        </select>
      </div>

      {/* Address Information */}
      <h2>Address Information</h2>
      <div>
        <label>Street Number</label>
        <input
          type="text"
          name="adresse.num_street"
          value={formData.adresse.num_street}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Street</label>
        <input
          type="text"
          name="adresse.street"
          value={formData.adresse.street}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>City</label>
        <input
          type="text"
          name="adresse.city"
          value={formData.adresse.city}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Postal Code</label>
        <input
          type="text"
          name="adresse.postal_code"
          value={formData.adresse.postal_code}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Country</label>
        <input
          type="text"
          name="adresse.country"
          value={formData.adresse.country}
          onChange={handleChange}
        />
      </div>

      {/* Pharmacist Information (conditionally displayed) */}
      {formData.utilisateur.role === 'pharmacien' && (
        <>
          <h2>Pharmacist Information</h2>
          <div>
            <label>Professional Card</label>
            <input
              type="text"
              name="pharmacien.cartePro"
              value={formData.pharmacien.cartePro}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Diploma</label>
            <input
              type="text"
              name="pharmacien.diplome"
              value={formData.pharmacien.diplome}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      {/* Pharmacy Information */}
      <h2>Pharmacy Information</h2>
      <div>
        <label>Pharmacy Name</label>
        <input
          type="text"
          name="pharmacie.nom"
          value={formData.pharmacie.nom}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Permit Document</label>
        <input
          type="text"
          name="pharmacie.docPermis"
          value={formData.pharmacie.docPermis}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Authorization Document</label>
        <input
          type="text"
          name="pharmacie.docAutorisation"
          value={formData.pharmacie.docAutorisation}
          onChange={handleChange}
        />
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={status === 'pending'}>
        {status === 'pending' ? 'Registering...' : 'Register'}
      </button>

      {/* Validation Error Messages */}
      {validationErrors.length > 0 && (
        <div style={{ color: 'red' }}>
          {validationErrors.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      )}

      {/* Success/Error Messages */}
      {isSuccess && <p>Registration successful! Please check your email.</p>}
      {isError && <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>}
    </form>
  );
};

export default SignupForm;
