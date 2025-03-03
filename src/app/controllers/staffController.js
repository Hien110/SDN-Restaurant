const User = require("../models/User");
const bcrypt = require("bcrypt");
const StaffInfor = require("../models/StaffInfor");
const { sendMail } = require("../../config/email");
const { genarateResetToken } = require("../../util");
const mongoose = require("mongoose");

exports.getStaffs = async (req, res) => {
    try {
        const searchQuery = req.query.search ? req.query.search.trim() : ""; 
        const roleFilter = req.query.role ? req.query.role.trim() : ""; 

        let queryCondition = { role: { $ne: "CUSTOMER" } };

        if (searchQuery) {
            queryCondition.$or = [
                { firstName: { $regex: new RegExp(searchQuery, "i") } }, 
                { lastName: { $regex: new RegExp(searchQuery, "i") } }
            ];
        }

        if (roleFilter) {
            queryCondition.role = roleFilter;
        }

        const staffs = await User.find(queryCondition);

        return res.render("viewStaffInformation", {
            layout: "layouts/mainAdmin",
            title: "Danh sách nhân viên",
            staffs,
            searchQuery,
            selectedRole: roleFilter,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách nhân viên:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};


exports.getStaffDetail = async (req, res) => {
    const { userId } = req.params;
    try {
        // Tìm nhân viên theo userId
        const staff = await User.findById(userId);
        if (!staff) {
            console.log("❌ Nhân viên không tồn tại:", userId);
            return res.render("errorpage", { message: "Nhân viên không tồn tại" });
        }

        // Tìm thông tin salary từ StaffInfor
        const staffDetails = await StaffInfor.findOne({ staff: userId });

        // Kiểm tra nếu nhân viên có `createdAt`, format lại ngày, nếu không thì trả về "Không có dữ liệu"
        const createdAt = staff.createdAt ? new Date(staff.createdAt).toLocaleDateString("vi-VN") : "Không có dữ liệu";

        console.log("✅ Nhân viên tìm thấy:", staff);
        console.log("✅ createdAt:", createdAt);

        return res.render("viewDetailStaff", {
            layout: "layouts/mainAdmin",
            title: "Chi tiết nhân viên",
            staff,
            salary: staffDetails ? staffDetails.salary : "Chưa cập nhật",
            createdAt // ✅ Đảm bảo truyền `createdAt` vào EJS
        });
    } catch (error) {
        console.error("❌ Lỗi trong getStaffDetail:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};



exports.updateStaff = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, role, salary, rate } = req.body;

    try {
        // Tìm nhân viên theo userId
        const staff = await User.findById(userId);
        if (!staff) {
            return res.render("errorpage", { message: "Nhân viên không tồn tại" });
        }

        // Cập nhật thông tin nhân viên
        staff.firstName = firstName;
        staff.lastName = lastName;
        staff.email = email;
        staff.phoneNumber = phoneNumber;
        staff.role = role;
        await staff.save();

        // Lấy thông tin salary và rate trong StaffInfor
        let staffDetails = await StaffInfor.findOne({ staff: userId });
        if (!staffDetails) {
            staffDetails = new StaffInfor({ staff: userId, salary, rate: rate || 0 }); // Mặc định rate = 0 nếu không nhập
        } else {
            staffDetails.salary = salary;
            staffDetails.rate = rate || staffDetails.rate; // Nếu rate không nhập, giữ nguyên giá trị cũ
        }

        await staffDetails.save();

        // ✅ Truyền `createdAt` để tránh lỗi
        const createdAt = staff.createdAt ? new Date(staff.createdAt).toLocaleDateString("vi-VN") : "Không có dữ liệu";

        return res.render("viewDetailStaff", {
            layout: "layouts/mainAdmin",
            title: "Chi tiết nhân viên",
            staff,
            salary: staffDetails.salary,
            createdAt, // ✅ Truyền `createdAt` vào template
            successMessage: "Cập nhật thành công!",
        });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật nhân viên:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};



exports.create = async (req, res) => {
    res.render("createStaff", { layout: "layouts/mainAdmin", title: "Create Staff" });
};

exports.update = async (req, res) => {
    const { userId } = req.params;

    try {
        // Tìm nhân viên theo userId
        const staff = await User.findById(userId);
        if (!staff) {
            console.log("❌ Nhân viên không tồn tại:", userId);
            return res.render("errorpage", { message: "Nhân viên không tồn tại" });
        }

        // Lấy thông tin salary từ StaffInfor
        const staffDetails = await StaffInfor.findOne({ staff: userId });

        console.log("✅ Nhân viên tìm thấy:", staff);
        console.log("✅ staffDetails:", staffDetails);

        return res.render("updateInfoStaff", {
            layout: "layouts/mainAdmin",
            title: "Cập nhật thông tin nhân viên",
            staff,  // ✅ Truyền staff vào EJS
            salary: staffDetails ? staffDetails.salary : "Chưa cập nhật",
        });
    } catch (error) {
        console.error("❌ Lỗi khi tải form cập nhật nhân viên:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};

exports.createStaff = async (req, res) => {
    const { firstName, lastName, email, password, phone, confirmPassword, salary } = req.body;

    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("createStaff", {
                layout: "layouts/mainAdmin",
                title: "Create Staff",
                errorMessage: "Tài khoản đã tồn tại",
                successMessage: null,
            });
        }

        // 2️⃣ Kiểm tra mật khẩu có khớp không
        if (password !== confirmPassword) {
            return res.render("createStaff", {
                layout: "layouts/mainAdmin",
                title: "Create Staff",
                errorMessage: "Mật khẩu xác nhận không khớp",
                successMessage: null,
            });
        }

        // 3️⃣ Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4️⃣ Tạo tài khoản nhân viên
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber: phone,
            role: "WAITER",
            status: "ACTIVE",
        });

        // 5️⃣ Lưu nhân viên vào database
        await newUser.save();

        // 6️⃣ Thêm mức lương vào `StaffInfor`
        const newStaffInfor = new StaffInfor({
            staff: newUser._id,
            salary: salary,
            rate: 0, // Mặc định rate là 0
        });

        await newStaffInfor.save();

        // 7️⃣ Gửi email kích hoạt tài khoản (nếu cần)
        try {
            const resetToken = await genarateResetToken();
            newUser.resetToken = resetToken;
            newUser.resetTokenExpiration = Date.now() + 3600000;
            await sendMail(req.body.email, resetToken, true);
            await newUser.save();
        } catch (err) {
            console.error("Lỗi gửi email:", err);
        }

        return res.render("viewStaffInformation", {
            layout: "layouts/mainAdmin",
            title: "View Staff Information",
            staffs: await User.find({ role: "WAITER" }),
            successMessage: "Tạo tài khoản thành công!",
            errorMessage: null,
        });

    } catch (error) {
        console.error("Lỗi khi tạo nhân viên:", error);
        return res.render("createStaff", {
            layout: "layouts/mainAdmin",
            title: "Create Staff",
            errorMessage: "Có lỗi xảy ra, vui lòng thử lại",
            successMessage: null,
        });
    }
};



exports.lockStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.render("errorpage", { message: "Nhân viên không tồn tại" });
        }

        user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        await user.save();

        return res.redirect("/staffs"); 
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }  
};
