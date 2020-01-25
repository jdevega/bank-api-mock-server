const findCustomerAccounts = require('./findCustomerAccounts')
module.exports = function(db, uuid) {
  const customer = db().customers.find(customer => customer.UUID === uuid);
  if(!customer) return
  return Object.assign({}, customer, {Accounts: findCustomerAccounts(db, uuid)})
}