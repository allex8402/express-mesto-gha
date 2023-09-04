module.exports = function corsMiddleware(req, res, next) {
  const { origin, method, headers } = req;
  // Массив доменов, с которых разрешены кросс-доменные запросы
  const allowedCors = [
    'https://praktikum.tk',
    'http://praktikum.tk',
    'localhost:3000',
  ];

  // Проверяем, что источник запроса есть среди разрешенных
  if (allowedCors.includes(origin)) {
    // Устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);

    // Если это предварительный запрос (OPTIONS), добавляем нужные заголовки
    if (method === 'OPTIONS') {
      const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
      res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);

      // Сохраняем список заголовков исходного запроса
      const requestHeaders = headers['access-control-request-headers'];
      // Разрешаем кросс-доменные запросы с этими заголовками
      res.header('Access-Control-Allow-Headers', requestHeaders);

      // Завершаем обработку запроса и возвращаем результат клиенту
      return res.sendStatus(200);
    }
  }

  next();
  return undefined;
};
