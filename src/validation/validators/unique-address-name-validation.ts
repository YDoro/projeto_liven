import { ListAddressesRepository } from '../../data/protocols/db/address/list-addresses-repository'
import { Validation } from '../../presentation/controllers/protocols/validation'
import { UniqueParamError } from '../../presentation/errors/unique-param-error'

export class UniqueAddressNameValidation implements Validation {
  constructor (
      private readonly listAddressesRepository: ListAddressesRepository
  ) { }

  async validate (input: any): Promise<Error> {
    const accountId = input.middleware.accountId
    const addresses = await this.listAddressesRepository.list(accountId)
    if (addresses) {
      const address = addresses.filter((address) => {
        return address.name === input.name
      })
      if (address.length > 0) { return new UniqueParamError('name', input.name) }
    }
  }
}
