const https = require("https")
const express = require('express')
const cors = require('cors')
const { getUserById, getUserByLineId, addUser, setUserLineId, getUserInCustomerList, logoutUser, userUpdate, updateUserAddressInOrderList, getCustomerSizeByCustomerId, updateCustomerSize, addCustomerSize, getUserByFacebookName } = require('./controllers/UserController')
const bodyParser = require('body-parser');
const con = require('./db/connection');
const branch1 = require('./db/branch1');
const branch2 = require('./db/branch2');
const { getPromotions } = require('./controllers/PromotionController');
const { getUserOrderNumbers, getOrdersByOrderNumber, getOrdersByActivitiesOrderId, getOrderDetailByOrderId, getRecentOrderStatus, getProductImageByProductCode, getRecentTracking, getOrderById, getProductOneImageByProductCode } = require('./controllers/OrderController');
const { getTrackingByCustomerName } = require('./controllers/DeliveryController');
const axios = require('axios')

const { getAllPendingNotify, addNotify, getNotifyByNotifyId, updateNotifyStatus } = require("./controllers/NotifyController");
const schedule = require('node-schedule');
const { nanoid } = require('nanoid');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 3001

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.post('/login', async (req, res) => {
    const userId = req.body.user_id;
    const lineId = req.body.line_id;

    if (userId.split('-')[0].toUpperCase() !== "PM000") {
        const data = {
            status: "error",
            result: "ไม่พบหมายเลขเบอร์โทรศัพท์นี้ภายในระบบ"
        }

        return res.json(data)
    }

    const user = await getUserById(userId.split('-')[1]);
    if (user.length > 0) {

        console.log(user[0].line_id)

        if (user[0].line_id) {

            const data = {
                status: "error",
                result: "โปรดตรวจสอบหมายเลขผู้ใช้งานนี้กำลังถูกใช้งานบนเครื่่องอื่น"
            }

            return res.json(data)
        }
        else {
            await setUserLineId(userId.split('-')[1], lineId)

            const data = {
                status: "success",
                result: "เข้าสู่ระบบสำเร็จ"
            }

            return res.json(data)
        }
    } else {

        const data = {
            status: "error",
            result: "ไม่พบหมายเลขเบอร์โทรศัพท์นี้ภายในระบบ"
        }

        return res.json(data)
    }
})

app.post('/check', async (req, res) => {
    const lineId = req.body.line_id;
    const lineCustomer = await getUserByLineId(lineId);

    if (lineCustomer.length <= 0) {
        const data = {
            status: "register_required",
            result: "โปรดยืนยันตัวตนเพื่อเข้าสู่ระบบ"
        }

        return res.json(data)
    } else {
        const data = {
            status: "success",
            result: "เข้าสู่ระบบสำเร็จ"
        }

        return res.json(data)
    }
})

app.post('/users', async (req, res) => {
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);
    return res.json(user);
})

app.post('/users/save', async (req, res) => {
    const lineId = req.body.line_id;
    const name = req.body.name;
    const phone_number = req.body.phone_number;
    const address = req.body.address;



    const user = await getUserByLineId(lineId);

    await userUpdate(lineId, name, address, phone_number)
    await updateUserAddressInOrderList(user[0].facebook_name, phone_number, address)

    const fetchUser = await getUserByLineId(lineId);

    console.log(user[0].address, fetchUser[0].address)

    const data = {
        status: "success",
        result: "ดำเนินการสำเร็จ",
        is_update_address: user[0].address === fetchUser[0].address,
        old_address: user[0].address,
        new_address: fetchUser[0].address,
        user: fetchUser[0]
    }

    return res.json(data);
})

app.post('/promotions', async (req, res) => {
    const promotions = await getPromotions()
    return res.json(promotions);
})

app.post('/orders', async (req, res) => {
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);
    const order_nums = await getUserOrderNumbers(user[0].facebook_name)
    return res.json(order_nums)
})

app.post('/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);

    const orders = await getOrdersByOrderNumber(orderId, user[0].facebook_name)

    orders.forEach(async (order, index) => {
        const order_status = await getRecentOrderStatus(order.id);

        if (order_status.length <= 0) {
            Object.assign(order, {
                status: 'pending'
            })
        } else {
            Object.assign(order, {
                status: order_status[0].status
            })
        }
        if (index + 1 === orders.length) {
            return res.json(orders)
        }
    })

})

app.post('/orders/:id/activities', async (req, res) => {
    const order_product_id = req.params.id;
    const activities = await getOrdersByActivitiesOrderId(order_product_id)
    return res.json(activities)
})

app.post('/orders/:id/detail', async (req, res) => {
    const order_product_id = req.params.id;
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);
    const order_detail = await getOrderDetailByOrderId(order_product_id, user[0].facebook_name)
    const order_status = await getRecentOrderStatus(order_product_id);

    if (order_status.length <= 0) {
        Object.assign(order_detail[0], {
            status: 'pending'
        })
    } else {
        Object.assign(order_detail[0], {
            status: order_status[0].status
        })
    }

    return res.json(order_detail)
})

app.post("/order-tracking", async (req, res) => {
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);

    const customerName = user[0]?.real_name.replace("คุณ", "");
    const orderTracking = await getTrackingByCustomerName(customerName)

    return res.json(orderTracking)
})

app.post("/logout", async (req, res) => {
    const lineId = req.body.line_id;
    await logoutUser(lineId)
    return res.json("success")
})

app.post('/product_images', async (req, res) => {
    const productCode = req.body.product_code;
    const productImage = await getProductImageByProductCode(productCode)
    return res.json(productImage)
})

app.post('/users/size/update', async (req, res) => {
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);

    if (user.length > 0) {

        const customerSizeData = {
            line_id: lineId,
            customer_id: user[0].id,
            customer_name: user[0].facebook_name,
            shirt_shirt_size: req.body.shirtSize,
            shirt_waist_size: req.body.waistSize,
            sarong_waist_size: req.body.sarongwaistSize,
            sarong_hip_size: req.body.saronghipSize,
            sarong_long_size: req.body.saronglongSize,
        }

        const customerSize = await getCustomerSizeByCustomerId(user[0].id)
        if (customerSize.length > 0) {
            await updateCustomerSize(customerSizeData)
        } else {
            await addCustomerSize(customerSizeData)
        }
        const data = {
            status: "success",
            result: "ดำเนินการสำเร็จ",
            user: {
                id: user[0].id
            }
        }
        return res.json(data)
    }
    else {
        const data = {
            status: "error",
            result: "ไม่สามารถดำเนินการได้"
        }
        return res.json(data)
    }

})

app.post('/users/size', async (req, res) => {
    const lineId = req.body.line_id;
    const user = await getUserByLineId(lineId);
    if (user.length > 0) {
        const customerSize = await getCustomerSizeByCustomerId(user[0].id)
        res.json(customerSize[0])
    }
    else {
        res.json({})
    }
})



app.get('/notify/mark/:id', async (req, res) => {
    const notifyId = req.params.id;
    console.log(notifyId)
    const notify = await getNotifyByNotifyId(notifyId);
    console.log(notify)

    if (notify.length > 0) {
        const updateNotfi = await updateNotifyStatus(notifyId, notify[0].status == 'pending' ? 'completed' : 'pending')
        console.log(updateNotfi)
        if (notify[0].status == 'pending') {
            res.redirect('https://order.phamaiintrend.co/notify/complete');
        } else {
            res.redirect('https://order.phamaiintrend.co/notify/pending');
        }

    }
})

app.post("/webhook/line/callback", async (req, res) => {
    if (req.body.events[0]?.type === "message") {

        console.log(req.body.events[0])
        // if (req.body.events[0].message.text.split(" ")[0] === "สอบถามรหัสลูกค้า") {

        // console.log(req.body.events[0].message.text.substring(req.body.events[0].message.text.indexOf(' ') + 1))

        const user = await getUserByFacebookName(req.body.events[0].message.text)

        console.log(user)

        if (user.length > 0) {
            const dataString = JSON.stringify({
                replyToken: req.body.events[0].replyToken,
                messages: [
                    {
                        "type": "text",
                        "text": `สวัสดีคุณ ${user[0].facebook_name} รหัสลูกค้าของคุณคือ PM000-${user[0].id} 😍 เข้าใช้งานระบบติดตามสถานะสินค้าคลิกที่นี่ https://liff.line.me/1656853914-9PxOOqpy`
                    },
                ]
            })

            // } else {
            //     dataString = JSON.stringify({
            //         replyToken: req.body.events[0].replyToken,
            //         messages: [
            //             {
            //                 "type": "text",
            //                 "text": `ขออภัยเราไม่สามารถค้นหาหมายเลขผู้ใช้งานได้นี้ได้จากชื่อ ${req.body.events[0].message.text.substring(req.body.events[0].message.text.indexOf(' ') + 1)} 🧐`
            //             },
            //         ]
            //     })
            // }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer ehrXtpNl2PbwxfL2TSQ0epzWaVxi1V1WPd9spZJoZpMuiOeZgp95NCkMcOCrkoMJNn4/KZb7Zlo4rojN/zQKB9hq5w3xc4+2mFMZovLr0O6mH3yIoX4a785qHT9aXugIodREA4o1W3Ahtb0giZZYgwdB04t89/1O/w1cDnyilFU="
            }

            const webhookOptions = {
                "hostname": "api.line.me",
                "path": "/v2/bot/message/reply",
                "method": "POST",
                "headers": headers,
                "body": dataString
            }

            const request = https.request(webhookOptions, (res) => {
                res.on("data", (d) => {
                    process.stdout.write(d)
                })
            })

            request.on("error", (err) => {
                console.error(err)
            })


            request.write(dataString)
            request.end()

        }
    }

    // }
    else {
        res.json("success")
    }

})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})

setInterval(() => {
    con.query(`SELECT 1`, function (err, results, fields) {
        if (err) reject(err);
        console.log("Reconnected DB")
    });
}, 10000)

setInterval(() => {
    branch1.query(`SELECT 1`, function (err, results, fields) {
        if (err) reject(err);
        console.log("Reconnected Branch 1 DB")
    });

}, 10000)

setInterval(async () => {
    branch2.query(`SELECT 1`, async function (err, results, fields) {
        if (err) reject(err);
        console.log("Reconnected Branch 2 DB")
    });

}, 10000)

// const line = require('@line/bot-sdk');

// const client = new line.Client({
//     channelAccessToken: 'd9l2hDLkxy9OJs15ZrxPtuHyptFUih6NKFKX9s1oQq+Xf3REW56gnZkI9feWAX13/FSGIEtT8Wu4kYor3ESYJd2ZziYYNxRs078nXiduYinY6RLuo9xSd2D1T2Nq43jIaHTq2jp6P2B6oU7ptpxRoAdB04t89/1O/w1cDnyilFU='
// });

app.post('/line-notify', async (req, res) => {

    //save asdasdasdasd status pending
    const order_id = req.body.order_id;
    const message = req.body.message;

    console.log(order_id)
    console.log(message)

    //Order Detail
    //User Line id
    const recentStatus = await getRecentTracking(parseInt(order_id));
    const order = await getOrderById(order_id);
    console.log(order[0].product_code)
    const orderImage = await getProductOneImageByProductCode(order[0].product_code)

    //console.log(orderImage[0]?.image_url)
    const imageUrl = orderImage[0]?.image_url;

    if (recentStatus.length > 0 && recentStatus[0].status != "pending" && recentStatus[0].status != "processing") {
        // const payload = {
        //     type: 'text',
        //     message: 'Hello World!'
        // };
        // //Done
        // client.pushMessage('Uc2e0219db6c7ae86eee597f709c16211', payload)
        //     .then(() => {
        //         console.log("Sent message")
        //     })
        // .catch((err) => {
        //     // error handling
        //     console.log(err)
        // });


        var userInfo = null;
        userInfo = await getEmployeeBranch1(recentStatus[0].employee_id, recentStatus[0].employee);

        //console.log("User 1", userInfo)

        if (userInfo.length == 0) {
            userInfo = await getEmployeeBranch2(recentStatus[0].employee_id, recentStatus[0].employee);
            //console.log("User 2", userInfo)
        }

        console.log(userInfo)

        if (userInfo.length > 0 && userInfo[0].line_id != null) {


            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer d9l2hDLkxy9OJs15ZrxPtuHyptFUih6NKFKX9s1oQq+Xf3REW56gnZkI9feWAX13/FSGIEtT8Wu4kYor3ESYJd2ZziYYNxRs078nXiduYinY6RLuo9xSd2D1T2Nq43jIaHTq2jp6P2B6oU7ptpxRoAdB04t89/1O/w1cDnyilFU='
            }

            const notifyId = nanoid();

            const msg = getMessage(order_id, message, imageUrl, order, notifyId);

            const flex_msg = {
                "to": userInfo[0].line_id,
                "messages": [
                    msg
                ]
            }

            axios.post('https://api.line.me/v2/bot/message/push', flex_msg, {
                headers: headers
            }).then(async (resp) => {
                const notify = await addNotify(order_id, userInfo[0].line_id, message, notifyId, "private", userInfo[0].name)
                res.json({
                    "status": "success",
                    "result": "ดำเนินการสำเร็จ"
                });
            }).catch((error) => {
                console.log(error.response.data)
                res.json({
                    "status": "error",
                    "result": "ไม่พบผู้ใช้งานหรือผู้ใช้งานยังไม่ยืนยันตัวตน"
                });
            });

        } else {
            res.json({
                "status": "error",
                "result": "ไม่พบผู้ใช้งานหรือผู้ใช้งานยังไม่ยืนยันตัวตน"
            });
        }

    }
    else {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer d9l2hDLkxy9OJs15ZrxPtuHyptFUih6NKFKX9s1oQq+Xf3REW56gnZkI9feWAX13/FSGIEtT8Wu4kYor3ESYJd2ZziYYNxRs078nXiduYinY6RLuo9xSd2D1T2Nq43jIaHTq2jp6P2B6oU7ptpxRoAdB04t89/1O/w1cDnyilFU='
        }

        const notifyId = nanoid();

        const msg = getMessageBroadcast(order_id, message, imageUrl, order, notifyId);

        const flex_msg = {
            "messages": [
                msg
            ]
        }

        axios.post('https://api.line.me/v2/bot/message/broadcast', flex_msg, {
            headers: headers
        }).then(async (resp) => {
            const notify = await addNotify(order_id, null, message, notifyId, "broadcast", "")
            res.json({
                "status": "success",
                "result": "ดำเนินการสำเร็จ"
            });
        }).catch((error) => {
            console.log(error.response.data)
            res.json({
                "status": "error",
                "result": "ไม่สามารถดำเนินการได้"
            });
        });
    }
})

function getMessage(order_id, message, image, order, notifyId) {
    return {
        "type": "flex",
        "altText": message ? message : "แจ้งติดตามงาน",
        "contents": {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": image == null ? "https://via.placeholder.com/600x400?text=No+images" : "https://order.phamaiintrend.co/storage/upload/" + image,
                "size": "full",
                "aspectRatio": "2:3",
                "aspectMode": "fit",
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "weight": "bold",
                                "text": "แจ้งติดตามงาน"
                            }
                        ]
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "รายละเอียด",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": order[0].detail,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    },
                                    {
                                        "type": "text",
                                        "text": "คุณ" + order[0].customer_name != null ? order[0].customer_name : order[0].facebook_name,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    },
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "หมายเหตุ",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": message ? message : "-",
                                        "wrap": true,
                                        "color": "#E00000",
                                        "size": "sm",
                                        "flex": 5,
                                        "weight": "bold"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "button",
                        "style": "primary",
                        "height": "sm",
                        "action": {
                            "type": "uri",
                            "label": "เสร็จสิ้น",
                            "uri": "https://customer-api.phamaiintrend.co/notify/mark/" + notifyId
                        }
                    }
                ],
                "flex": 0
            }
        }
    }
}

function getMessageBroadcast(order_id, message, image, order, notifyId) {
    return {
        "type": "flex",
        "altText": message ? message : "แจ้งติดตามงาน",
        "contents": {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": image == null ? "https://via.placeholder.com/600x400?text=No+images" : "https://order.phamaiintrend.co/storage/upload/" + image,
                "size": "full",
                "aspectRatio": "2:3",
                "aspectMode": "fit",
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "weight": "bold",
                                "text": "แจ้งติดตามงาน"
                            }
                        ]
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "รายละเอียด",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": order[0].detail,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    },
                                    {
                                        "type": "text",
                                        "text": "คุณ" + order[0].customer_name != null ? order[0].customer_name : order[0].facebook_name,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    },
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "หมายเหตุ",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": message ? message : "-",
                                        "wrap": true,
                                        "color": "#E00000",
                                        "size": "sm",
                                        "flex": 5,
                                        "weight": "bold"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
}

async function getEmployeeBranch1(userId, employeeName) {
    return new Promise((resolve, reject) => {
        branch1.query(`SELECT * FROM users WHERE id = ${userId} and name = "${employeeName}"`, function (err, result, fields) {
            if (err) reject(err);
            resolve(result)
        });
    })
}

async function getEmployeeBranch2(userId, employeeName) {
    return new Promise((resolve, reject) => {
        branch2.query(`SELECT * FROM users WHERE id = ${userId} and name = "${employeeName}"`, function (err, result, fields) {
            if (err) reject(err);
            resolve(result)
        });
    })
}


async function doJob() {

    console.log("scheduleJob started.")

    const j = schedule.scheduleJob({ hour: 8, minute: 30 }, async () => {
        const notifies = await getAllPendingNotify()
        //console.log(notifies)

        notifies.forEach(async (n, index) => {


            const order_id = n.order_id;
            const message = n.message;
            const notifyId = n.notify_id;

            const recentStatus = await getRecentTracking(parseInt(order_id));
            const order = await getOrderById(order_id);
            const orderImage = await getProductOneImageByProductCode(order[0].product_code)

            const imageUrl = orderImage[0]?.image_url;

            if (n.status == 'pending' && n.type == 'private') {


                if (recentStatus.length > 0) {

                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer d9l2hDLkxy9OJs15ZrxPtuHyptFUih6NKFKX9s1oQq+Xf3REW56gnZkI9feWAX13/FSGIEtT8Wu4kYor3ESYJd2ZziYYNxRs078nXiduYinY6RLuo9xSd2D1T2Nq43jIaHTq2jp6P2B6oU7ptpxRoAdB04t89/1O/w1cDnyilFU='
                    }

                    const msg = getMessage(order_id, message, imageUrl, order, notifyId);

                    const flex_msg = {
                        "to": n.line_id,
                        "messages": [
                            msg
                        ]
                    }

                    axios.post('https://api.line.me/v2/bot/message/push', flex_msg, {
                        headers: headers
                    }).then(async (resp) => {
                        console.log("Sent a notify order id", order_id)
                    }).catch((error) => {
                        console.log(error.response.data)
                    });

                }
            }
            if (n.status == 'pending' && n.type == 'broadcast') {

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer d9l2hDLkxy9OJs15ZrxPtuHyptFUih6NKFKX9s1oQq+Xf3REW56gnZkI9feWAX13/FSGIEtT8Wu4kYor3ESYJd2ZziYYNxRs078nXiduYinY6RLuo9xSd2D1T2Nq43jIaHTq2jp6P2B6oU7ptpxRoAdB04t89/1O/w1cDnyilFU='
                }

                const notifyId = nanoid();

                const msg = getMessageBroadcast(order_id, message, imageUrl, order, notifyId);

                const flex_msg = {
                    "messages": [
                        msg
                    ]
                }

                axios.post('https://api.line.me/v2/bot/message/broadcast', flex_msg, {
                    headers: headers
                }).then(async (resp) => {
                    console.log("Broadcast a notify order id", order_id)
                }).catch((error) => {
                    console.log(error.response.data)
                });
            }
        })
    });



}

doJob()