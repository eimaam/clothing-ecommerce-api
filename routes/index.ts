import { Response, Router } from "express";
import { Orders } from "../handlers/orders";
import { Users } from "../handlers/users";

export const route = Router()

// health check
route.get('/healthcheck', (_req, res:Response) => {
    res.status(200).json({ status: "ok", message: "Application is running..."})
})

// user
route.post('/user', Users.createUser)
route.get('/user', Users.getUserById)
route.get('/users', Users.getAllUsers)
route.patch('/user/:userId', Users.updateUser)
route.delete('/user/:userId', Users.deleteUser)


// orders
route.get('/orders', Orders.getAllOrders)
