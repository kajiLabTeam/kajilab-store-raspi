import { BuyProduct } from "./app/features/payment/type";
import { Arrival, Payment, Product, User } from "./types/json";
import { CartProduct } from "./types/product";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const apiKey = process.env.NEXT_PUBLIC_KAJILABSTORE_API_KEY;

type CreatePaymentType = {
    pay_at: string;
    method: string,
    user_number: string,
    products: CreatePaymentProductType[],
}

type CreatePaymentProductType = {
    id: number;
    quantity: number;
    unit_price: number;
}

type CreateArrivalType = {
    arrive_at: string;
    money: number;
    user_barcode: string;
    products: CreateArrivalProductType[];
}

type CreateArrivalProductType = {
    id: number;
    quantity: number;
}

type CreateProductType = {
    name: string;
    barcode: number;
    price: number;
    tag_id: number;
}

type UpdateProductType = {
    id: number;
    name: string;
    barcode: number;
    price: number;
    stock: number;
    tag_id: number;
}

type CreateUserType = {
    name: string;
    barcode: string; 
}

type UpdateUserDebtType = {
    id: number;
    debt: number;
}

export const getPayments = async (): Promise<Payment[]> => {
    try{
        //const res = await fetch("http://localhost:8080/api/v1/products/buy/logs?limit=5", {cache: "no-store"})  // SSR
        const res = await fetch(`${baseURL}/api/v1/products/buy/logs?limit=5`, {
            cache: "no-store",  // SSR
            headers: {
                'X-API-KEY': apiKey ?? "",
            }
        })
        console.log(res)

        const payments = await res.json()
        return payments
    } catch (error) {
        return []
    }
}

export const getProductByBarcode = async (barcode: number): Promise<Product> => {
    try{
        //const res = await fetch(`http://localhost:8080/api/v1/products/134912341232`, {cache: "no-store"})
        // const res = await fetch(`http://localhost:8080/api/v1/products/${barcode}`, {cache: "no-store"})
        const res = await fetch(`${baseURL}/api/v1/products/${barcode}`, {
            cache: "no-store",
            headers: {
                'X-API-KEY': apiKey ?? "",
            }
        })
        console.log(res)

        const product = await res.json()
        return product
    } catch (error) {
        const product: Product = {
            id: -1,
            name: "",
            barcode: -1,
            price: 0,
            stock: 0,
            tag_id: 0,
            image_path: ""
        }
        return product
    }
}

export const getArrivals = async (): Promise<Arrival[]> => {
    //const res = await fetch("http://localhost:8080/api/v1/products/buy/logs?limit=5", {cache: "no-store"})  // SSR
    try{
        const res = await fetch(`${baseURL}/api/v1/products/arrive/logs?limit=5`, {
            cache: "no-store",  // SSR
            headers: {
                'X-API-KEY': apiKey ?? "",
            }
        })
        console.log(res)

        const arrivals = await res.json()
        console.log(arrivals)
        return arrivals

    } catch (error) {
        return []
    }
}

export const getGlobalIP = async(): Promise<string> => {
    try{
        const res = await fetch(`http://httpbin.org/ip`, {cache: "no-store"})  // SSR
        const ip = await res.json()
        return ip.origin
    } catch (error) {
        console.log("http://httpbin.org/ip is error")
        try{
            const res2 = await fetch(`http://api.ipify.org`, {cache: "no-store"})
            const ip2 = await res2.text()
            return ip2
        } catch (error2) {
            console.log("http://api.ipify.org is error")
            return ""
        }
    }
}


export const deletePayment = async (id: number) => {
    const res = await fetch(`${baseURL}/api/v1/products/buy/${id}`, {
        method: "DELETE",
        headers: {
            'X-API-KEY': apiKey ?? "",
        }
    });

    if(res.ok){
        console.log("削除に成功")
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return
}

export const deleteArrival = async (id: number) => {
    const res = await fetch(`${baseURL}/api/v1/products/arrival/${id}`, {
        method: "DELETE",
        headers: {
            'X-API-KEY': apiKey ?? "",
        }
    });

    if(res.ok){
        console.log("削除に成功")
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return
}


export const createPayment = async (buyProducts: BuyProduct[], method: string, userNumber: string) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const tokyoTime = dayjs().tz("Asia/Tokyo")
    console.log(tokyoTime.format()); // 2025-11-06T09:50:24+09:00
    let cartProducts: CreatePaymentProductType[] = []
    buyProducts.map((buyProduct) => (
        cartProducts.push({
            id: buyProduct.product.id,
            quantity: buyProduct.quantity,
            unit_price: buyProduct.product.price,
        })
    ))
    const requestPayment:CreatePaymentType = {
        pay_at: tokyoTime.format(),
        method: method,
        user_number: userNumber,
        products: cartProducts
    }

    const res = await fetch(`${baseURL}/api/v1/products/buy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestPayment)
    });
}

export const createArrival = async (arrivalProducts: CartProduct[], withdrawal: number, userBarcode: string): Promise<number> => {
    const currentDatetime = new Date().toISOString();
    let cartProducts: CreateArrivalProductType[] = []
    arrivalProducts.map((arrivalProduct) => (
        cartProducts.push({
            id: arrivalProduct.product.id,
            quantity: arrivalProduct.quantity,
        })
    ))
    const requestArrival: CreateArrivalType = {
        arrive_at: currentDatetime,
        money: withdrawal,
        user_barcode: userBarcode,
        products: cartProducts
    }

    const res = await fetch(`${baseURL}/api/v1/products/arrive`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestArrival)
    });

    console.log(res.status)

    return res.status
}

// export const createProduct = async (newProduct: Product): Promise<number> => {
export const createProduct = async (name: string, barcode:number, price: number, tag_id: number): Promise<number> => {
    let requestProduct: CreateProductType = {
        name: name,
        barcode: barcode,
        price: price,
        tag_id: tag_id,
    }

    const res = await fetch(`${baseURL}/api/v1/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestProduct)
    });

    console.log(res.status)
    return res.status
}

export const updateProduct = async (id: number, name: string, barcode: number, price: number, stock: number, tagId: number): Promise<number> => {
    let requestProduct: UpdateProductType = {
        id: id,
        name: name,
        barcode: barcode,
        price: price,
        stock: stock,
        tag_id: tagId, 
    }

    const res = await fetch(`${baseURL}/api/v1/products`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestProduct)
    })

    console.log(res.status)
    return res.status
}

export const getUser = async (barcode: string): Promise<User> => {
    //const res = await fetch(`${baseURL}/api/v1/users/1080123456788`, {cache: "no-store"})  // SSR
    const res = await fetch(`${baseURL}/api/v1/users/${barcode}`, {
        cache: "no-store",  // SSR
        headers: {
            'X-API-KEY': apiKey ?? "",
        }
    })
    console.log(res)

    const user = await res.json()
    console.log(user)
    return user
}

export const createUser = async (name: string, barcode: string): Promise<number> => {
    let requestUser: CreateUserType = {
        name: name,
        barcode: barcode,
    }

    const res = await fetch(`${baseURL}/api/v1/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestUser)
    });

    console.log(res.status)
    return res.status
}

export const updateUserDebt = async (id: number, debt: number): Promise<number> => {
    let requestUserDebt: UpdateUserDebtType = {
        id: id,
        debt: debt,
    }
    const res = await fetch(`${baseURL}/api/v1/users/debt`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': apiKey ?? "",
        },
        body: JSON.stringify(requestUserDebt)
    })

    return res.status
}

