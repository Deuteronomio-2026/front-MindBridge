// src/hooks/useRealUser.ts
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { userService } from '../service/userService';
import type { Psychologist, Patient } from '../types/user';

interface DecodedToken {
  userId: number;
  role: 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN';
  name: string;
  sub: string;
  exp: number;
}

export function useRealUser() {
  const [profile, setProfile] = useState<Patient | Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setRole(decoded.role);
      
      const profileData = await userService.getMyProfile();
      setProfile(profileData);
      setError(null);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Patient | Psychologist>) => {
    if (!profile) throw new Error('No hay perfil cargado');
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No token');
    
    const decoded: DecodedToken = jwtDecode(token);
    const userRole = decoded.role;
    
    let updated;
    if (userRole === 'PSYCHOLOGIST') {
      updated = await userService.patchPsychologist(profile.id, updates);
    } else if (userRole === 'PATIENT') {
      updated = await userService.patchPatient(profile.id, updates);
    } else {
      throw new Error('Rol no soportado para actualización');
    }
    setProfile(updated);
    return updated;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile, role };
}