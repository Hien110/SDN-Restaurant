const TakeCare = require('../models/TakeCare');
const Table = require('../models/Table');
const User = require('../models/User');

exports.renderCreateTakeCare = async (req, res) => {
    try {
        const staffs = await User.find({ role: "WAITER" });
        res.render('createTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Tạo lịch làm",
            staffs,
            errorMessage: null 
        });
    } catch (error) {
        console.error("Lỗi khi tải form tạo TakeCare:", error);
        res.status(500).send("Lỗi khi tải form tạo TakeCare");
    }
};


exports.createTakeCare = async (req, res) => {
    try {
        const { tableId, staffId, date, startTime, endTime } = req.body;

        if (!tableId || !staffId || !date || !startTime || !endTime) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                errorMessage: "Vui lòng điền đầy đủ thông tin."
            });
        }

        const table = await Table.findOne({ idTable: tableId });
        if (!table) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                errorMessage: "Bàn không tồn tại. Vui lòng nhập ID bàn hợp lệ."
            });
        }

        const staffMember = await User.findById(staffId);
        if (!staffMember) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                errorMessage: "Nhân viên không tồn tại."
            });
        }

        if (staffMember.role !== "WAITER") {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                errorMessage: "Chỉ nhân viên phục vụ (WAITER) mới có thể tạo TakeCare."
            });
        }

        const newTakeCare = new TakeCare({
            table: table._id,
            staff: staffMember._id,
            date,
            startTime,
            endTime,
        });

        await newTakeCare.save();
        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("Lỗi khi tạo TakeCare:", error);
        return res.render('createTakeCare', {
            layout: "layouts/mainAdmin",
            title: "Tạo TakeCare",
            staffs: await User.find({ role: "WAITER" }),
            errorMessage: "Lỗi máy chủ. Vui lòng thử lại sau."
        });
    }
};


exports.getTakeCares = async (req, res) => {
    try {
        console.log("Đang lấy danh sách TakeCare...");

        // FIX: Đổi `staffId` thành `staff` để populate chính xác
        const takeCares = await TakeCare.find()
            .populate('table')
            .populate('staff');

        console.log("Danh sách TakeCare:", takeCares);

        res.render('viewTakeCare', { 
            layout: "layouts/mainAdmin", 
            title: "Danh sách lịch làm",
            takeCares 
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách TakeCare:", error);
        res.status(500).send("Lỗi khi lấy danh sách TakeCare.");
    }
};

