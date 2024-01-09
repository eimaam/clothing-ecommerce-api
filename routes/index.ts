import { Response, Router } from "express";
import { Orders } from "../handlers/order";
import { Users } from "../handlers/user";
import { Products } from "../handlers/product";
import { validateInputData } from "../middlewares/validateInput.middleware";
import { checkUser } from "../middlewares/userCheck.middleware";

export const route = Router()

// health check
route.get('/healthcheck', (_req, res:Response) => {
    res.status(200).json({ status: "ok", message: "Application is running..."})
})

// user
route.post('/user', Users.createUser)
route.get('/users', Users.getAllUsers)
route.get('/user/:userId', Users.getUserById)
route.patch('/user/:id', validateInputData, Users.updateUser)
route.delete('/user/:userId', Users.deleteUser)

// product/item
route.post('/product', Products.createProduct)
route.get('/products', Products.getProducts)
route.get('/product/:productId', Products.getProductById)
route.patch('/product/:productId', validateInputData, Products.updateProduct)
route.delete('/product/:productId', Products.deleteProduct)

// orders
route.post('/order', checkUser, Orders.createOrder)
route.get('/orders', Orders.getAllOrders)
route.get('/order/:orderId', Orders.getOrderById)
route.patch('/order/:orderId', checkUser, validateInputData, Orders.updateOrder)
route.delete('/order/:orderId', Orders.deleteOrder)
