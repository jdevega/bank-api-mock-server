const findCustomerByUuid = require("../customers/findCustomerByUuid");
const faker = require("faker");

module.exports = function(db) {
  return {
    accountRequestHandler: accountRequestHandler.bind(null, db),
    createTransferHandler: accountTransferHandler.bind(null, db),
    updateAccountsBalance: updateAccountsBalance.bind(null, db)
  };
};

function accountRequestHandler(db, req, res) {
  const account = findAccountById(db, req.params.id);
  if (!account) {
    return res.status(500).jsonp({
      error: "Account with id " + req.params.id + " not found."
    });
  } else {
    return res.status(200).jsonp(account);
  }
}

function findAccountById(db, id) {
  const IDAccount = +id;
  const account = db().accounts.find(account => account.ID === IDAccount);
  if (!account) return;
  const Holders = db()
    .customerAccount.filter(ca => ca.IDAccount === IDAccount)
    .map(ca => {
      const customer = findCustomerByUuid(db, ca.UUIDCustomer);
      return {
        CustomerName: customer.Name,
        HolderType: ca.HolderType
      };
    });
  const Transactions = db()
    .transactions.filter(
      transaction =>
        transaction.IDOriginAccount === IDAccount ||
        transaction.IDDestinationAccount === IDAccount
    )
    .map(transaction => {
      const customer = findCustomerByUuid(db, transaction.OrderedBy);
      return Object.assign({}, transaction, {
        OrderedBy: customer.Name
      });
    });
  return Object.assign({}, account, { Holders, Transactions });
}

function accountTransferHandler(db, req, res) {
  const date = Date.now();
  const transaction = {
    IDTransaction: faker.random.uuid(),
    OrderedBy: req.body.OrderedBy,
    Amount: req.body.Amount,
    IDOriginAccount: +req.params.id,
    IDDestinationAccount: +req.body.IDDestinationAccount,
    ExecutionDate: date,
    OrderDate: date,
    Description: req.body.Description
  };
  updateAccountsBalance(db, transaction);
  db().transactions.push(transaction);
  res.status(200).jsonp(transaction);
}

function updateAccountsBalance(db, transaction) {
  var originAccount = db().accounts.find(account => account.ID === transaction.IDOriginAccount);
  var destinationAccount = db().accounts.find(account => account.ID === transaction.IDDestinationAccount);
  originAccount && (originAccount.OverallBalance -= transaction.Amount);
  destinationAccount && (destinationAccount.OverallBalance += transaction.Amount);
}