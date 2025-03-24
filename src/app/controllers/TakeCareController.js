const TakeCare = require('../models/TakeCare');
const Table = require('../models/Table');
const User = require('../models/User');

exports.renderCreateTakeCare = async (req, res) => {
    try {
        const staffs = await User.find({ role: "WAITER" });
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

        // Kiểm tra dữ liệu đầu vào có đầy đủ không
        if (!tableIds || !staffId || !date || !startTime || !endTime) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Vui lòng điền đầy đủ thông tin."
            });
        }

        // Chuyển tableIds thành array nếu nó là string (trường hợp chỉ chọn 1 bàn)
        if (!Array.isArray(tableIds)) {
            try {
                tableIds = JSON.parse(tableIds);
            } catch (error) {
                tableIds = [tableIds]; // Nếu JSON.parse lỗi thì ép nó thành mảng
            }
        }

        // Kiểm tra xem tất cả các bàn có tồn tại không
        const tables = await Table.find({ idTable: { $in: tableIds } });
        if (tables.length !== tableIds.length) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Một hoặc nhiều bàn không tồn tại. Vui lòng kiểm tra lại."
            });
        }

        // Kiểm tra nhân viên có tồn tại không
        const staffMember = await User.findById(staffId);
        if (!staffMember || staffMember.role !== "WAITER") {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: "WAITER" }),
                tables: await Table.find({}, 'idTable'),
                errorMessage: "Nhân viên không hợp lệ hoặc không phải phục vụ (WAITER)."
            });
        }

        
        const newTakeCare = new TakeCare({
            table: tableIds,  
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
            staffs: await User.find({ role: "WAITER" }),
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

        // Lấy danh sách nhân viên phục vụ
        const staffs = await User.find({ role: "WAITER" });

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

        // Đảm bảo `tableIds` là một mảng nếu có nhiều bàn
        if (!Array.isArray(tableIds)) {
            tableIds = [tableIds]; // Chuyển thành mảng nếu chỉ có một bàn
        }

        // Kiểm tra dữ liệu đầu vào
        if (!tableIds.length || !staffId || !date || !startTime || !endTime) {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: "WAITER" });
            const tables = await Table.find({}, 'idTable'); // Lấy danh sách bàn
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables,
                errorMessage: "Vui lòng điền đầy đủ thông tin."
            });
        }

        // Kiểm tra tất cả bàn tồn tại
        const tables = await Table.find({ idTable: { $in: tableIds } });
        if (tables.length !== tableIds.length) {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: "WAITER" });
            const allTables = await Table.find({}, 'idTable'); // Lấy danh sách bàn
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables: allTables,
                errorMessage: "Một hoặc nhiều bàn không tồn tại. Vui lòng nhập ID bàn hợp lệ."
            });
        }

        // Kiểm tra nhân viên tồn tại và vai trò
        const staffMember = await User.findById(staffId);
        if (!staffMember || staffMember.role !== "WAITER") {
            const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
            const staffs = await User.find({ role: "WAITER" });
            const allTables = await Table.find({}, 'idTable');
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                tables: allTables,
                errorMessage: "Nhân viên không hợp lệ hoặc không phải phục vụ (WAITER)."
            });
        }

        // Cập nhật TakeCare
        const updatedTakeCare = await TakeCare.findByIdAndUpdate(
            id,
            {
                table: tableIds, // Cập nhật danh sách bàn
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
        console.log(`📌 Bàn mới: ${tableIds.join(", ")}`);
        console.log(`📌 Nhân viên: ${staffMember.firstName} ${staffMember.lastName}`);
        console.log(`📌 Ngày: ${date}`);
        console.log(`📌 Thời gian: ${startTime} - ${endTime}`);

        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật TakeCare:", error);
        const takeCare = await TakeCare.findById(id).populate('table').populate('staff');
        const staffs = await User.find({ role: "WAITER" });
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


