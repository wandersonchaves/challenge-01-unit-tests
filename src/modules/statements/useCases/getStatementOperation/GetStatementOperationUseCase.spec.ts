import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { OperationType } from '../../entities/Statement'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetStatementOperationError } from './GetStatementOperationError'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

describe('Get Statement Operation Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryStatementsRepository: InMemoryStatementsRepository

  let getStatementOperationUseCase: GetStatementOperationUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it(' should be able to return statement operation', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    const statement = await inMemoryStatementsRepository.create({
      amount: 10,
      description: 'Test',
      type: 'deposit' as OperationType,
      user_id: user.id!
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!
    })

    expect(statementOperation).toHaveProperty('id')
    expect(statementOperation.amount).toBe(statement.amount)
    expect(statementOperation.description).toBe(statement.description)
    expect(statementOperation.user_id).toBe(statement.user_id)
  })

  it(' should not be able to return inexistent statement operation', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: '123132'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

  it(' should not be able to return statement operation for a inexistent user', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    const statement = await inMemoryStatementsRepository.create({
      amount: 10,
      description: 'Test',
      type: 'deposit' as OperationType,
      user_id: user.id!
    })

    await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!
    })

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: '123123',
        statement_id: statement.id!
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })
})
