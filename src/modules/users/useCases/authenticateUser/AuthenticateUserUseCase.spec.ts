import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase'
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError'

describe('Authenticate User Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let authenticateUserUseCase: AuthenticateUserUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    )
  })

  it(' should be able to authenticate user and return jwt token', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: '1234'
    })

    expect(result).toHaveProperty('token')
    expect(result.user).toHaveProperty('id')
    expect(result.user).toHaveProperty('name')
    expect(result.user).toHaveProperty('email')
    expect(result.user.email).toBe(user.email)
    expect(result.user.name).toBe(user.name)
  })

  it(' should not be able to authenticate inexistent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'anyemail@gmail.com',
        password: '1234'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it(' should not be able to authenticate user with incorrect password', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: '888'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
