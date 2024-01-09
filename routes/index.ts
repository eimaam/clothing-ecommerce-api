import { Response, Router } from "express";
import { Orders } from "../handlers/orders";
import { Users } from "../handlers/users";
import { Products } from "../handlers/product";
import { validateInputData } from "../middlewares/validateInput.middleware";

export const route = Router()

// health check
route.get('/healthcheck', (_req, res:Response) => {
    res.status(200).json({ status: "ok", message: "Application is running..."})
})

// user
route.post('/user', Users.createUser)
route.get('/users', Users.getAllUsers)
route.get('/user/:userId', Users.getUserById)
route.patch('/user/:userId', Users.updateUser)
route.delete('/user/:userId', Users.deleteUser)

// product/item
route.post('/product', Products.createProduct)
route.get('/products', Products.getProducts)
route.get('/product/:productId', Products.getProductById)
route.patch('/product/:productId', Products.updateProduct)
route.delete('/product/:productId', Products.deleteProduct)

// orders
route.post('/order', Orders.createOrder)
route.get('/orders', Orders.getAllOrders)
route.get('/order/:orderId', Orders.getOrderById)
route.patch('/order/:orderId', validateInputData, Orders.updateOrder)
route.delete('/order/:orderId', Orders.deleteOrder)
