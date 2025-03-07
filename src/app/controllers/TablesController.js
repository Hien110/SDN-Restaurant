const Table = require("../models/Table");
const mongoose = require("mongoose");

const cloudinary = require("../config/cloudinary/index.js");
const multer = require("multe");
const fs = require("fs");
const stream = require("stream");
const { table } = require("console");
const storage = multer.memoryStorage();

exports.upload = multer({ storage: storage });
exports.getTables = async (req, res) => {
    try {
        const searchQuery = req.query.search ? req.query.search.trim() : "";
        const typeFilter = req.query.type ? req.query.type.trim() : "";
        
        let queryCondition = {};
        if (searchQuery) {
            queryCondition.$or = [
                { idTable: { $regex: new RegExp(searchQuery, "i") } },
                { description: { $regex: new RegExp(searchQuery, "i") } }
            ];
        }
        if (typeFilter) {
            queryCondition.type = typeFilter;
        }
        
        const tables = await Table.find(queryCondition);
        return res.render("viewTables", {
            layout: "layouts/mainAdmin",
            title: "Danh sách bàn",
            tables,
            searchQuery,
            selectedType: typeFilter,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách bàn:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};


exports.getTableDetail = async (req, res) => {
    const { tableId } = req.params;
    try {
        const table = await Table.findById(tableId);
        if (!table) {
            return res.render("errorpage", { message: "Bàn không tồn tại" });
        }
        return res.render("viewDetailTable", {
            layout: "layouts/mainAdmin",
            title: "Chi tiết bàn",
            table,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin bàn:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};


exports.updateTable = async (req, res) => {
    const { tableId } = req.params;
    const { seatNumber, description, imageUrl, depositPrice, status, type } = req.body;
    try {
        const table = await Table.findById(tableId);
        if (!table) {
            return res.render("errorpage", { message: "Bàn không tồn tại" });
        }
        table.seatNumber = seatNumber;
        table.description = description;
        table.imageUrl = imageUrl;
        table.depositPrice = depositPrice;
        table.status = status;
        table.type = type;
        table.updatedAt = Date.now();
        
        await table.save();
        return res.redirect(`/tables/${tableId}`);
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật bàn:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};


exports.createTables = async (req, res) => {
  try {
    const { idTable, seatNumber, description, imageUrl, depositPrice, status, type } = req.body;

    const newTable = new Table({
      idTable,
      seatNumber,
      description,
      imageUrl,
      depositPrice,
      status,
      type
    });

    await newTable.save(); // Lưu vào database

    res.render("createTables", { success: "Thêm bàn thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi tạo bàn:", error);
    res.render("createTables", { error: "Có lỗi xảy ra khi thêm bàn." });
  }
};



exports.deleteTable = async (req, res) => {
    const { tableId } = req.params;
    try {
        await Table.findByIdAndDelete(tableId);
        return res.redirect("/tables");
    } catch (error) {
        console.error("❌ Lỗi khi xóa bàn:", error);
        return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};

exports.getEditTableForm = async (req, res) => {
  try {
      const table = await Table.findById(req.params.tableId);
      if (!table) {
          return res.render("errorpage", { message: "Bàn không tồn tại" });
      }
      res.render("editTable", { table });
  } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin bàn:", error);
      return res.render("errorpage", { message: "Lỗi hệ thống, vui lòng thử lại" });
  }
};

exports.addTables = (req, res) => {
  res.render("addTable", { 
      layout: "layouts/mainAdmin",
      title: "Thêm Bàn Mới",
  });
};

exports.updateImage = async (req, res) => {
    try {
        const idTable = req.params.id;

        const table = await Table.findById(idTable);
        if (!table) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
        }

        let imageUrl = table.imageUrl; 

        
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'tables',
                public_id: `table_${Date.now()}`,
                overwrite: true,
            });

            imageUrl = result.secure_url; 
        }

        
        table.imageUrl = imageUrl;
        table.updatedAt = Date.now();
        await table.save();

        return res.status(200).json({ message: 'Cập nhật ảnh thành công', table });
    } catch (error) {
        console.error('Lỗi khi cập nhật ảnh:', error);
        return res.status(500).json({ message: 'Lỗi server', error });
    }
};