import { Response, Router } from "express";
import { Orders } from "../handlers/orders";
import { Users } from "../handlers/users";
import { Products } from "../handlers/product";
import { validateInputData } from "../middlewares/validateInput.middleware";
import { checkUser } from "../middlewares/userCheck.middleware";
import { Carts } from "../handlers/cart";
import { Favourites } from "../handlers/favoruites";

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
route.get('/order/user/:userId', checkUser, Orders.getUserOrders)
route.patch('/order/:orderId', checkUser, validateInputData, Orders.updateOrder)
route.delete('/order/:orderId', Orders.deleteOrder)

// cart
route.post('/cart', checkUser, Carts.addToCart)
route.get('/carts', Carts.getAllCarts)
route.get('/cart/:id', Carts.getCart)
route.get('/cart/user/:userId', checkUser, Carts.getUserCart)
route.patch('/cart/:id', checkUser, validateInputData, Carts.updateCart)
route.delete('/cart/:id', Carts.deleteCart)

// favourites
route.post('/favourite', checkUser, Favourites.addToFavourites)
route.get('/favourite/:userId', checkUser, Favourites.getFavourites)
route.post('/favourite/:productId', checkUser, Favourites.removeFavourite)