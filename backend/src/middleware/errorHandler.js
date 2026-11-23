export function errorHandler(err, req, res, next) {
  console.error('Erro:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (err.code) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({
          success: false,
          message: 'Registro duplicado',
          details: err.details
        });
      case '23503':
        return res.status(400).json({
          success: false,
          message: 'Referência inválida',
          details: err.details
        });
      case '23514':
        return res.status(400).json({
          success: false,
          message: 'Dados violam restrição de validação',
          details: err.details
        });
      case '42P01':
        return res.status(500).json({
          success: false,
          message: 'Tabela não encontrada. Execute a migration SQL no Supabase.',
          details: err.message
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Erro de banco de dados',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição'
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.url} não encontrada`
  });
}