const customRoutesMiddleware = require('./middlewares/custom-routes')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const customMiddlewares = customRoutesMiddleware(router)

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

server.use((req, res, next) => {
  console.log({
    path: req.path,
  })
  next()
})
server.use(jsonServer.bodyParser)
server.get('/customers/:uuid', customMiddlewares.customer)
server.post('/customers/:uuid/savings', customMiddlewares.createSavingsAccount)
server.get('/accounts', customMiddlewares.serverError)
server.get('/accounts/:id', customMiddlewares.account)
server.get('/transactions', customMiddlewares.notFound)
server.post('/accounts/:id/transfer', customMiddlewares.createTransfer)


// Use default router
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})