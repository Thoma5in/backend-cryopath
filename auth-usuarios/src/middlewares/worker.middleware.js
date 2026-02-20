export const requireWorkerOrAdmin = async (req, res, next) => {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        //Llamada al microservicio de auth-usuarios para validar el token y obtener roles
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/usuarios/roles`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const {roles} = await response.json();

        const allowed = 
        roles.includes('admin') || roles.includes('trabajador');

        if (!allowed) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        //Autorizado
        next();
    } catch (err) {
        console.error('Error en la verificación de roles:', err);
        return res.status(500).json({ error: 'Error validando permisos' });
    }
}