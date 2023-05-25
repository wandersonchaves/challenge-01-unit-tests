import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { OperationType } from '../../entities/Statement'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { GetBalanceError } from './GetBalanceError'
import { GetBalanceUseCase } from './GetBalanceUseCase'

describe('Get User Balance Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryStatementsRepository: InMemoryStatementsRepository
  let getBalanceUseCase: GetBalanceUseCase
  let createStatementUseCase: CreateStatementUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    )
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it(' should be able to return all statements for a user', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    await createStatementUseCase.execute({
      amount: 10,
      description: 'test',
      type: 'deposit' as OperationType,
      user_id: user.id!
    })

    const result = await getBalanceUseCase.execute({
      user_id: user.id!
    })

    expect(result).toHaveProperty('balance')
    expect(result).toHaveProperty('statement')
    expect(result.balance).toBe(10)
  })

  it(' should not be able to return statements for a inexistent user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: '1234' })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
