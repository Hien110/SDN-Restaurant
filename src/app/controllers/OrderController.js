const Table = require('../models/Table')
const Menu = require("../models/Menu");
const Order = require("../models/OrderFood");
exports.viewAllTables = async (req, resp) => {
    const tables = await Table.find()
    resp.render('order/tables', { tables, layout: 'layouts/order' });
}
exports.viewATable = async (req, resp) => {
    const tableId = req.params.tableId;
    const table = await Table.findOne({ idTable: tableId });
    if (!table) {
        return resp.status(404).send('Table not found');
    }
    const menus = await Menu.find().populate('category');
    resp.render('order/view1Table', { table, menus, layout: 'layouts/order' });
}
exports.addDishes2Table = async (req, resp) => {
    const {tableId, dishes} = req.body;
    const countMap = dishes.reduce((acc, dishId) => {
        acc[dishId] = (acc[dishId] || 0) + 1;
        return acc;
    }, {});

    const uniqueDishId = Object.keys(countMap);
    const counts = Object.values(countMap);
    const addDishes = await Menu.find({ _id: { $in: uniqueDishId } });
    const sortedDishes = uniqueDishId.map(id => addDishes.find(dish => dish._id.toString() === id));
    const table = await Table.findOne({ _id: tableId });
    if (!table) {
        return resp.status(404).send('Table not found with id: ' + tableId);
    }
    if (!addDishes.length) {
        return resp.status(404).json({ message: "No dishes found" });
    }
    const dishes2Add = [];
    for (let i = 0; i < sortedDishes.length; i++) {
        dishes2Add.push({
            menuItem: sortedDishes[i],
            quantity: counts[i],
            statusOrder: 'Pending',
            typeOrder: 'Offline',
        });
    }
    try {
        const order = await Order.findOne({ table: tableId , statusPayment: 'Pending'})
            .populate("dishes.menuItem")
            .populate("table")
            .populate("bookingTable");
        if (!order){
            const newOrder = new Order({
                table: table,
                dishes: dishes2Add,
                statusPayment: 'Pending',
                paymentMethod: 'Cash',
            });
            await newOrder.save();
        } else {
            for (let i = 0; i < dishes2Add.length; i++) {
                let mark = false;
                for (let j = 0; j < order.dishes.length; j++) {
                    if (dishes2Add[i].menuItem._id.toString() === order.dishes[j].menuItem._id.toString()) {
                        order.dishes[j].quantity += dishes2Add[i].quantity;
                        mark = true;
                    }
                }
                if (!mark){
                    order.dishes.push(dishes2Add[i]);
                }
            }
            await order.save();
        }
    } catch (error) {
        const newOrder = new Order({
            table: table,
            dishes: dishes2Add,
            statusPayment: 'Pending',
            paymentMethod: 'Cash',
        });
        await newOrder.save();
    }
    resp.json({ message: "Thêm món ăn thành công." });
}
exports.getOrderOfTableID = async (req, resp) => {
    const tableId = req.params.tableId;
    const orders = await Order.find({ table: tableId, statusPayment: 'Pending' })
        .populate("dishes.menuItem")
        .populate("table")
        .populate("bookingTable");
    if (orders.length > 1) {
        return resp.status(500).json({ error: "Lỗi hệ thống, tìm thấy nhiều hơn 1 order cho bàn này." });
    }
    if (orders.length === 0) {
        return resp.json(null);
    }
    return resp.json(orders[0]);

}
exports.chefViewDishes = async (req, resp) => {
    console.log('this func run')
}