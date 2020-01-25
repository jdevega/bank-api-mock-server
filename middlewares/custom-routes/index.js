const customersFactory = require("./customers");
const accountsFactory = require("./accounts");

module.exports = function middlewareFactory(router) {
  const db = router.db.getState.bind(router.db);
  const customers = customersFactory(db);
  const accounts = accountsFactory(db);
  return {
    notFound,
    serverError,
    customer: customers.customerRequestHandler,
    createSavingsAccount: customers.createSavingsAccountHandler,
    account: accounts.accountRequestHandler,
    createTransfer: accounts.createTransferHandler
  };
};

function notFound(req, res) {
  return res.status(404).end();
}

function serverError(req, res) {
  return res.status(500).end();
}