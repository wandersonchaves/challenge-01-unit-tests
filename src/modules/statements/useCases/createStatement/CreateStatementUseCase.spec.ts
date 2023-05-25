import { hash } from 'bcryptjs'
import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementError } from './CreateStatementError'
import { CreateStatementUseCase } from './CreateStatementUseCase'
import { OperationType } from '../../entities/Statement'

describe('Create Statement Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryStatementsRepository: InMemoryStatementsRepository
  let createStatementUseCase: CreateStatementUseCase

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it(' should be able to create a new statement', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    const statement = await createStatementUseCase.execute({
      amount: 10,
      description: 'test',
      type: 'deposit' as OperationType,
      user_id: user.id!
    })

    const { balance } = await inMemoryStatementsRepository.getUserBalance({
      user_id: user.id!
    })

    expect(statement).toHaveProperty('id')
    expect(statement).toHaveProperty('user_id')
    expect(statement.user_id).toBe(user.id)
    expect(balance).toBe(statement.amount)
  })

  it(' should not be able to create a new statement for a inexistent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 10,
        description: 'test',
        type: 'deposit' as OperationType,
        user_id: '123'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it(' should not be able to create a new statement of type "withdraw" if funds is insufficient', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    await createStatementUseCase.execute({
      amount: 10,
      description: 'deposit',
      type: 'deposit' as OperationType,
      user_id: user.id!
    })

    expect(async () => {
      await createStatementUseCase.execute({
        amount: 20,
        description: 'withdraw',
        type: 'withdraw' as OperationType,
        user_id: user.id!
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
