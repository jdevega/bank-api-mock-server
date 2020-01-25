const findCustomerByUuid = require('./findCustomerByUuid')
const constants = require('./constants')
const faker = require('faker')

module.exports = function(db) {
  return {
    customerRequestHandler: customerRequestHandler.bind(null, db),
    createSavingsAccountHandler: createSavingsAccountHandler.bind(null, db)
  }
}

function customerRequestHandler(db, req, res) {
  const customer = findCustomerByUuid(db, req.params.uuid)
  if(!customer) {
    return res.status(500).jsonp({
      error: "Customer with uuid " + req.params.uuid + " not found."
    })
  } else {
    return res.status(200).jsonp(customer)
  }
}

function createSavingsAccountHandler (db, req, res) {
  const IDAccount = nextID(db(), 'accounts')
  const account = {
    ID: IDAccount,
    IBAN: faker.finance.iban(),
    OverallBalance: +req.body.Amount,
    ProductType: constants.SAVINGS_ACCOUNT,
    Currency: '€'
  }

  const customerAccount = {
    UUIDCustomer: req.params.uuid,
    IDAccount,
    HolderType: "Account Holder"
  }

  const transaction = {
    TransactionID: faker.random.uuid(),
    OrderedBy: req.params.uuid,
    Amount: +req.body.Amount,
    IDOriginAccount: +req.body.IDOriginAccount,
    IDDestinationAccount: IDAccount,
    ExecutionDate: Date.now(),
    OrderDate: Date.now(),
    Description: 'Opening a new savings account'
  }

  db().accounts.push(account)
  db().customerAccount.push(customerAccount)
  db().transactions.push(transaction)
  return res.status(200).jsonp(account)
}

function nextID(db, table) {
  const IDs = db[table].map(row => row.ID)
  const maxID = Math.max.apply(Math, IDs)
  return (maxID || 0) + 1
}

