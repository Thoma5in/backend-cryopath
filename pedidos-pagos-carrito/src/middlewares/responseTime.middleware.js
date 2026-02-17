export const responseTimeMiddleware = (req, res, next) => {
  // Excluir rutas que no queremos monitorear
  if (req.path === '/health') {
    return next();
  }

  // Capturar tiempo de inicio en nanosegundos
  const startTime = process.hrtime.bigint();

  // Capturar el momento en que se envía la respuesta
  res.on('finish', () => {
    // Calcular tiempo transcurrido en milisegundos
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    // Registrar en formato: METHOD ROUTE TIEMPOms
    console.log(`${req.method} ${req.path} ${durationMs.toFixed(2)}ms`);
  });

  next();
};
