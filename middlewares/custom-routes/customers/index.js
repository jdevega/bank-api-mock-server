const findCustomerByUuid = require('./findCustomerByUuid')
const findCustomerAccounts = require('./findCustomerAccounts')
const constants = require('./constants')
const accountsFactory = require('../accounts')
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
    OverallBalance: 0,
    ProductType: constants.SAVINGS_ACCOUNT,
    Currency: '€',
    Alias: "New account"
  }

  const customerAccount = {
    UUIDCustomer: req.params.uuid,
    IDAccount,
    HolderType: "Account Holder"
  }

  console.log(req.body)
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
  accountsFactory(db).updateAccountsBalance(transaction)
  const accounts = findCustomerAccounts(db, req.params.uuid)
  return res.status(200).jsonp(accounts)
}

function nextID(db, table) {
  const IDs = db[table].map(row => row.ID)
  const maxID = Math.max.apply(Math, IDs)
  return (maxID || 0) + 1
}

