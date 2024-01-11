// the packages and variables needed for setup
// every test file different port number!!
const request = require('supertest') // this is the thing that lets us run our code like postman
const { MongoMemoryServer } = require('mongodb-memory-server') // this creates the fake Mongodb database that exists on our computer in our memory.. not on atlas
const app = require('../app') // this is our api application that we made with express.. this is the thing that we are giving to supertest to test
const User = require('../models/user') // this is for us to be able to do crud operations on the User
const mongoose = require('mongoose')
const server = app.listen(8080, () => console.log('Testing on Port 8080'))
let mongoServer 

beforeAll( async () => {
  mongoServer = await MongoMemoryServer.create()
  mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll( async () => {
  await mongoose.connection.close() // shut off mongoose connection with mongodb
  mongoServer.stop() // get rid of mongo serve
  server.close() // shut off the application server we have running
})

describe('Test suite for the /users routes on our api', () => {
  // /users
  test('It should create a new user in the db', async () => {
    const response = await request(app).post('/users').send({ name: 'Jeremy Casanova', email: 'casanova@smooth.com', password: '12345' })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.user.name).toEqual('Jeremy Casanova')
    expect(response.body.user.email).toEqual('casanova@smooth.com')
    expect(response.body).toHaveProperty('token')
  })

  // /users/login
  test('It should login a user', async () => {
    const user = new User({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })
    await user.save()

    const response = await request(app)
      .post('/users/login')
      .send({ email: 'john.doe@example.com', password: 'password123' })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.user.name).toEqual('John Doe')
    expect(response.body.user.email).toEqual('john.doe@example.com')
    expect(response.body).toHaveProperty('token')
  })

  // /users/:id update
  test('It should update a user', async () => {
    const user = new User({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })
    await user.save()
    const token = await user.generateAuthToken()

    const response = await request(app)
      .put(`/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Doe', email: 'jane.doe@example.com' })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.name).toEqual('Jane Doe')
    expect(response.body.email).toEqual('jane.doe@example.com')
  })

  // /users/:id delete
  test('It should delete a user', async () => {
    const user = new User({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })
    await user.save()
    const token = await user.generateAuthToken()

    const response = await request(app)
      .delete(`/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toEqual('User deleted')
  })
})