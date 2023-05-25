import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserError } from './CreateUserError'
import { CreateUserUseCase } from './CreateUserUseCase'

describe('Create User Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it(' should be able to create and return a new user', async () => {
    const user = {
      email: 'email@gmail.com',
      name: 'Test',
      password: '1234'
    }

    const newUser = await createUserUseCase.execute(user)

    expect(newUser).toHaveProperty('id')
    expect(newUser.name).toBe(user.name)
  })

  it(' should not be able to create user if email already exists', async () => {
    const user = {
      email: 'email@gmail.com',
      name: 'Test',
      password: '1234'
    }

    await createUserUseCase.execute(user)

    expect(async () => {
      await createUserUseCase.execute(user)
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
