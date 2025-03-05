require("dotenv").config();
const apiGetPaid = process.env.API_GET_BANK;
exports.checkPaid = async (req, res) => {
  try {
    const response = await fetch(apiGetPaid);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dataJson = await response.json();

    const hasHihiDescription = dataJson.some(
      (item) => item["Mô tả"] === "hihi"
    );

    res.status(200).json({ success: true, hasHihiDescription });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
