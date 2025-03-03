    const Table = require('../models/Table');

    class TablesController  {
        
        async create(req, res) {
          try {
            const { idTable, seatNumber, description, imageUrl, depositPrice, createdAt, updatedAt,status } = req.body;
            const newTable = new Table({ idTable, seatNumber, description, imageUrl, depositPrice, createdAt, updatedAt,status });
            await newTable.save();
            res.status(201).json({ message: "Table created successfully", table: newTable });
          } catch (error) {
            res.status(500).json({ message: "Error creating table", error: error.message });
          }
        }
      
        
        async getAll(req, res) {
          try {
            const tables = await Table.find();
            res.status(200).json(tables);
          } catch (error) {
            res.status(500).json({ message: "Error fetching tables", error: error.message });
          }
        }
      
        
        async getById(req, res) {
          try {
            const table = await Table.findById(req.params.id);
            if (!table) return res.status(404).json({ message: "Table not found" });
            res.status(200).json(table);
          } catch (error) {
            res.status(500).json({ message: "Error fetching table", error: error.message });
          }
        }
      
        
        async update(req, res) {
          try {
            const { idTable, seatNumber, description, imageUrl, depositPrice, createdAt, updatedAt,status } = req.body;
            const updatedTable = await Table.findByIdAndUpdate(
              req.params.id,
              { idTable, seatNumber, description, imageUrl, depositPrice, createdAt, updatedAt,status },
              { new: true }
            );
            if (!updatedTable) return res.status(404).json({ message: "Table not found" });
            res.status(200).json({ message: "Table updated successfully", table: updatedTable });
          } catch (error) {
            res.status(500).json({ message: "Error updating table", error: error.message });
          }
        }
      
        // Delete a table
        async delete(req, res) {
          try {
            const deletedTable = await Table.findByIdAndDelete(req.params.id);
            if (!deletedTable) return res.status(404).json({ message: "Table not found" });
            res.status(200).json({ message: "Table deleted successfully" });
          } catch (error) {
            res.status(500).json({ message: "Error deleting table", error: error.message });
          }
        }
      };

    module.exports = new TablesController();


      
