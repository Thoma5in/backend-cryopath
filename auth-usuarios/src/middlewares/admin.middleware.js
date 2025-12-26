import supabase from '../config/supabase.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user?.roles?.includes('admin')) {
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }
  next();
};

