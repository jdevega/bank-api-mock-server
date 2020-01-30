const constants = require('./constants')

function IsTransactional(account) {
  return account.ProductType.toLowerCase() !== constants.SAVINGS_ACCOUNT.toLowerCase()
}

module.exports = function(db, uuid) {
  const customerAccounts = db().customerAccount.filter(ca => ca.UUIDCustomer === uuid)
  const customerAccountIds = customerAccounts.map(ca => ca.IDAccount)
  
  return db().accounts
    .filter(a => customerAccountIds.includes(a.ID))
    .map(account => {
      const ca = customerAccounts.find(ca => ca.IDAccount === account.ID)
      return Object.assign({}, account, {
        HolderType: ca.HolderType,
        Transactional: IsTransactional(account)
      })
    })
}