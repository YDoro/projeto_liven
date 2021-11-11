import { MongoTransactionError, PushOperator, ObjectId, PullAllOperator } from 'mongodb'
import { AddAddressRepository } from '../../../../data/protocols/db/address/add-address-repository'
import { DeleteAddressRepository } from '../../../../data/protocols/db/address/delete-address-repository'
import { ListAddressesRepository } from '../../../../data/protocols/db/address/list-addresses-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddressModel } from '../../../../domain/models/address'
import { AccountMongoRepository } from '../account/account-mongo-repository'
import { MongoHelper } from '../helpers/mongo-helper'

export class AddressMongoRepository implements AddAddressRepository, ListAddressesRepository, DeleteAddressRepository {
  async list (accountId: string, query?:any): Promise<AddressModel[]> {
    const accountCollection = await MongoHelper.getCollection(AccountMongoRepository.accountCollection)

    const parsedQuery = {}
    if (query) {
      Object.keys(query).forEach((key) => {
        parsedQuery['addresses.' + key] = query[key]
      })
    }
    const accounts = await accountCollection.aggregate<AccountModel>()
      .unwind('$addresses')
      .match({ _id: new ObjectId(accountId), ...parsedQuery })
      .project({ addresses: true })
      .toArray()

    const result:AddressModel[] = []
    accounts.forEach((user) => {
      result.push(user.addresses)
    })

    return result
  }

  async add (address: AddressModel, userId: string): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection(AccountMongoRepository.accountCollection)
    const result = await accountCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $push: { addresses: address } as PushOperator<AccountModel|Document> },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      throw new MongoTransactionError(`failed on update user address: ${userId}`)
    }

    return MongoHelper.map(result.value)
  }

  async deleteByName (accountId: string, addressName: string): Promise<boolean> {
    const accountCollection = await MongoHelper.getCollection<AccountModel>(AccountMongoRepository.accountCollection)
    const accounts = await accountCollection.findOneAndUpdate(
      {
        _id: new ObjectId(accountId)
      }, {
        $pull: {
          addresses: { name: addressName }

        }
      })
    if (accounts.ok === 1) return true
    return false
  }
}
