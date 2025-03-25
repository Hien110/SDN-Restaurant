const TakeCare = require('../models/TakeCare');
const Table = require('../models/Table');
const User = require('../models/User');

exports.renderCreateTakeCare = async (req, res) => {
    try {
        const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
        const tables = await Table.find({}, 'idTable'); 

        res.render('createTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Tạo lịch làm",
            staffs,
            tables,
            errorMessage: null 
        });
    } catch (error) {
        console.error("❌ Lỗi khi tải form tạo TakeCare:", error);
        res.status(500).send("Lỗi khi tải form tạo TakeCare");
    }
};

exports.createTakeCare = async (req, res) => {
    try {
        let { tableIds, staffId, date, startTime, endTime } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!staffId || !date || !startTime || !endTime) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Vui lòng điền đầy đủ thông tin (nhân viên, ngày, giờ bắt đầu, giờ kết thúc)."
            });
        }

        // Xử lý tableIds: Nếu không có tableIds (cho KITCHENSTAFF hoặc RESMANAGER), gán mảng rỗng
        if (!tableIds) {
            tableIds = [];
        } else {
            // Chuyển tableIds thành array nếu nó là string (trường hợp chỉ chọn 1 bàn)
            if (!Array.isArray(tableIds)) {
                try {
                    tableIds = JSON.parse(tableIds);
                } catch (error) {
                    tableIds = [tableIds]; // Nếu JSON.parse lỗi thì ép nó thành mảng
                }
            }
        }

        // Kiểm tra nhân viên có tồn tại không và vai trò hợp lệ
        const staffMember = await User.findById(staffId);
        if (!staffMember || !["WAITER", "KITCHENSTAFF", "RESMANAGER"].includes(staffMember.role)) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Nhân viên không hợp lệ hoặc không thuộc vai trò WAITER, KITCHENSTAFF, hoặc RESMANAGER."
            });
        }

        // Kiểm tra nếu vai trò là WAITER thì phải chọn ít nhất một bàn
        if (staffMember.role === "WAITER" && tableIds.length === 0) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Nhân viên phục vụ (WAITER) phải chọn ít nhất một bàn."
            });
        }

        // Kiểm tra xem tất cả các bàn có tồn tại không (nếu có bàn được chọn)
        if (tableIds.length > 0) {
            const tables = await Table.find({ idTable: { $in: tableIds } });
            if (tables.length !== tableIds.length) {
                return res.render('createTakeCare', {
                    layout: "layouts/mainAdmin",
                    title: "Tạo TakeCare",
                    staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
                    tables: await Table.find({}, 'idTable'),
                    errorMessage: "Một hoặc nhiều bàn không tồn tại. Vui lòng kiểm tra lại."
                });
            }
        }

        const newTakeCare = new TakeCare({
            table: tableIds, // Cập nhật danh sách bàn (có thể là mảng rỗng nếu không chọn bàn)
            staff: staffMember._id,
            date,
            startTime,
            endTime,
        });

        await newTakeCare.save();
        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("❌ Lỗi khi tạo TakeCare:", error);
        return res.render('createTakeCare', {
            layout: "layouts/mainAdmin",
            title: "Tạo TakeCare",
            staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
            tables: await Table.find({}, 'idTable'),
            errorMessage: "Lỗi máy chủ. Vui lòng thử lại sau."
        });
    }
};

exports.getTakeCares = async (req, res) => {
    try {
        console.log("🔄 Đang lấy danh sách TakeCare...");

        // Lấy danh sách TakeCare
        const takeCares = await TakeCare.find()
            .populate('staff'); // Chỉ populate staff vì table là array string

        // Lấy danh sách tất cả các bàn để map idTable
        const tables = await Table.find({}, 'idTable'); // Lấy danh sách tất cả bàn
        const tableMap = new Map(tables.map(table => [table.idTable, table.idTable]));

        // Cập nhật thông tin bàn để hiển thị đúng
        takeCares.forEach(tc => {
            tc.tableNames = tc.table.map(tId => tableMap.get(tId) || "Không có thông tin bàn");
        });

        // Hiển thị danh sách lấy được
        console.log("✅ Lấy thành công danh sách TakeCare:");
        takeCares.forEach(tc => {
            console.log(`🆔 ID: ${tc._id}, Bàn: ${tc.tableNames.join(", ")}, Nhân viên: ${tc.staff ? tc.staff.firstName + " " + tc.staff.lastName : "Không có nhân viên"}`);
        });

        res.render('viewTakeCare', { 
            layout: "layouts/mainAdmin", 
            title: "Danh sách lịch làm",
            takeCares
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách TakeCare:", error);
        res.status(500).send("Lỗi khi lấy danh sách TakeCare.");
    }
};



exports.renderUpdateTakeCare = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin lịch làm cần cập nhật
        const takeCare = await TakeCare.findById(id)
            .populate('staff'); // Không populate 'table' vì nó là mảng string

        if (!takeCare) {
            console.warn(`⚠️ Cảnh báo: Lịch làm với ID ${id} không tồn tại.`);
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại.",
                layout: "layouts/mainAdmin",
            });
        }

        // Lấy danh sách nhân viên thuộc 3 vai trò: WAITER, KITCHENSTAFF, RESMANAGER
        const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });

        // Lấy danh sách tất cả các bàn để hiển thị dropdown chọn bàn
        const tables = await Table.find({}, 'idTable');

        console.log(`✅ Đang cập nhật lịch làm: ID ${id}`);
        console.log(`📌 Nhân viên: ${takeCare.staff ? takeCare.staff.firstName + " " + takeCare.staff.lastName : "Không có nhân viên"}`);
        console.log(`📌 Bàn hiện tại: ${takeCare.table ? takeCare.table.join(", ") : "Không có bàn"}`);

        res.render('updateTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Chỉnh sửa lịch làm",
            takeCare,
            staffs,
            tables, // Truyền danh sách bàn vào form
            errorMessage: null 
        });
    } catch (error) {
        console.error("❌ Lỗi khi tải form chỉnh sửa TakeCare:", error);
        res.status(500).send("Lỗi khi tải form chỉnh sửa TakeCare.");
    }
};


// Hàm xử lý cập nhật TakeCare
exports.updateTakeCare = async (req, res) => {
    try {
        const { id } = req.params;
        let { tableIds, staffId, date, startTime, endTime } = req.body;

        // Đảm bảo `tableIds` là một mảng nếu có nhiều bàn, hoặc gán mảng rỗng nếu không có
        if (!tableIds) {
            tableIds = []; // Gán mảng rỗng nếu tableIds không được gửi
        } else if (!Array.isArray(tableIds)) {
            tableIds = [tableIds]; // Chuyển thành mảng nếu chỉ có một bàn
        }

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!staffId || !date || !startTime || !endTime) {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
            const tables = await Table.find({}, 'idTable'); // Lấy danh sách bàn
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables,
                errorMessage: "Vui lòng điền đầy đủ thông tin (ngày, giờ bắt đầu, giờ kết thúc, nhân viên)."
            });
        }

        // Kiểm tra nhân viên tồn tại và vai trò
        const staffMember = await User.findById(staffId);
        if (!staffMember || !["WAITER", "KITCHENSTAFF", "RESMANAGER"].includes(staffMember.role)) {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
            const allTables = await Table.find({}, 'idTable');
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables: allTables,
                errorMessage: "Nhân viên không hợp lệ hoặc không thuộc vai trò WAITER, KITCHENSTAFF, hoặc RESMANAGER."
            });
        }

        // Kiểm tra nếu vai trò là WAITER thì phải chọn ít nhất một bàn
        if (staffMember.role === "WAITER" && tableIds.length === 0) {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
            const tables = await Table.find({}, 'idTable');
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables,
                errorMessage: "Nhân viên phục vụ (WAITER) phải chọn ít nhất một bàn."
            });
        }

        // Kiểm tra tất cả bàn tồn tại (nếu có bàn được chọn)
        if (tableIds.length > 0) {
            const tables = await Table.find({ idTable: { $in: tableIds } });
            if (tables.length !== tableIds.length) {
                const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
                const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
                const allTables = await Table.find({}, 'idTable');
                return res.render('updateTakeCare', {
                    layout: "layouts/mainAdmin",
                    title: "Chỉnh sửa lịch làm",
                    takeCare,
                    staffs,
                    tables: allTables,
                    errorMessage: "Một hoặc nhiều bàn không tồn tại. Vui lòng nhập ID bàn hợp lệ."
                });
            }
        }

        // Cập nhật TakeCare
        const updatedTakeCare = await TakeCare.findByIdAndUpdate(
            id,
            {
                table: tableIds, // Cập nhật danh sách bàn (có thể là mảng rỗng nếu không chọn bàn)
                staff: staffMember._id,
                date,
                startTime,
                endTime,
            },
            { new: true } // Trả về document đã cập nhật
        );

        if (!updatedTakeCare) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại.",
                layout: "layouts/mainAdmin",
            });
        }

        console.log(`✅ Cập nhật thành công lịch làm với ID: ${id}`);
        console.log(`📌 Bàn mới: ${tableIds.length > 0 ? tableIds.join(", ") : "Không có bàn"}`);
        console.log(`📌 Nhân viên: ${staffMember.firstName} ${staffMember.lastName} (${staffMember.role})`);
        console.log(`📌 Ngày: ${date}`);
        console.log(`📌 Thời gian: ${startTime} - ${endTime}`);

        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật TakeCare:", error);
        const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
        const staffs = await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } });
        const tables = await Table.find({}, 'idTable'); // Lấy danh sách bàn
        return res.render('updateTakeCare', {
            layout: "layouts/mainAdmin",
            title: "Chỉnh sửa lịch làm",
            takeCare,
            staffs,
            tables,
            errorMessage: "Lỗi máy chủ. Vui lòng thử lại sau."
        });
    }
};



exports.deleteTakeCare = async (req, res) => {
    try {
        const { id } = req.params;
        const takeCare = await TakeCare.findById(id);

        if (!takeCare) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại.",
                layout: "layouts/mainAdmin",
            });
        }

        await TakeCare.findByIdAndDelete(id);
        console.log(`✅ Xóa thành công lịch làm với ID: ${id}`);

        // Redirect to the takeCare list page without flash
        return res.redirect("/admin/takeCare");
    } catch (error) {
        console.error("❌ Lỗi khi xóa lịch làm:", error);
        return res.render("errorpage", {
            message: "Lỗi máy chủ, không thể xóa lịch làm.",
            layout: "layouts/mainAdmin",
        });
    }
};

exports.getStaffSchedule = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ params

        // Kiểm tra xem nhân viên có tồn tại không
        const staff = await User.findById(userId);
        if (!staff) {
            console.log("❌ Nhân viên không tồn tại:", userId);
            return res.render("errorpage", {
                message: "Nhân viên không tồn tại",
                layout: "layouts/mainAdmin",
            });
        }

        // Lấy danh sách lịch làm của nhân viên
        const takeCares = await TakeCare.find({ staff: userId })
            .populate('staff'); // Populate thông tin nhân viên

        // Lấy danh sách tất cả các bàn để map idTable
        const tables = await Table.find({}, 'idTable');
        const tableMap = new Map(tables.map(table => [table.idTable, table.idTable]));

        // Cập nhật thông tin bàn để hiển thị
        takeCares.forEach(tc => {
            tc.tableNames = tc.table.map(tId => tableMap.get(tId) || "Không có thông tin bàn");
        });

        console.log(`✅ Lấy thành công lịch làm của nhân viên: ${staff.firstName} ${staff.lastName}`);
        takeCares.forEach(tc => {
            console.log(`🆔 ID: ${tc._id}, Bàn: ${tc.tableNames.join(", ")}, Ngày: ${tc.date}, Thời gian: ${tc.startTime} - ${tc.endTime}`);
        });

        res.render('viewStaffSchedule', {
            layout: "layouts/mainAdmin",
            title: "Lịch làm của nhân viên",
            takeCares,
            staff // Truyền thông tin nhân viên để hiển thị tên
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy lịch làm của nhân viên:", error);
        return res.render("errorpage", {
            message: "Lỗi hệ thống, vui lòng thử lại",
            layout: "layouts/mainAdmin",
        });
    }
};

exports.renderDetailTakeCare = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin lịch làm cần xem chi tiết
        const takeCare = await TakeCare.findById(id)
            .populate('staff'); 

        if (!takeCare) {
            console.warn(`⚠️ Cảnh báo: Lịch làm với ID ${id} không tồn tại.`);
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại.",
                layout: "layouts/mainAdmin",
            });
        }

        console.log(`✅ Đang xem chi tiết lịch làm: ID ${id}`);
        console.log(`📌 Nhân viên: ${takeCare.staff ? takeCare.staff.firstName + " " + takeCare.staff.lastName : "Không có nhân viên"}`);
        console.log(`📌 Bàn: ${takeCare.table ? takeCare.table.join(", ") : "Không có bàn"}`);

        res.render('detailTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Chi tiết lịch làm",
            takeCare
        });
    } catch (error) {
        console.error("❌ Lỗi khi tải trang chi tiết TakeCare:", error);
        res.status(500).send("Lỗi khi tải trang chi tiết TakeCare.");
    }
};


