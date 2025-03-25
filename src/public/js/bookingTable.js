document.addEventListener("DOMContentLoaded", function () {
  const bookings = window.bookings || [];
  const restaurantInfor = window.restaurantInfor || [];
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const tablesContainer = document.querySelector(".table-list");
  const selectedTableInput = document.getElementById("selectedTableId");
  /** 🕒 Không cho chọn ngày trong quá khứ */
  let today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  console.log(bookings);
  console.log(restaurantInfor);
  const openingHours = new Date(restaurantInfor.openingHours); // Chuyển thành đối tượng Date

  // Cộng thêm 7 giờ để chuyển sang múi giờ Việt Nam
  openingHours.setHours(openingHours.getUTCHours() + 7);

  const hours = String(openingHours.getHours()).padStart(2, "0"); // Giờ VN
  const minutes = String(openingHours.getMinutes()).padStart(2, "0"); // Phút VN

  const timeOpening = `${hours}:${minutes}`;
  
  const closingHours = new Date(restaurantInfor.closingHours); // Chuyển thành đối tượng Date

  // Cộng thêm 7 giờ để chuyển sang múi giờ Việt Nam
  closingHours.setHours(closingHours.getUTCHours() + 7 - 3);

  const hoursClose = String(closingHours.getHours()).padStart(2, "0"); // Giờ VN
  const minutesClose = String(closingHours.getMinutes()).padStart(2, "0"); // Phút VN

  const timeClosing = `${hoursClose}:${minutesClose}`;


  /** 🕒 Cập nhật min cho giờ khi chọn ngày */
  dateInput.addEventListener("change", function () {
    const selectedDate = new Date(dateInput.value);
    console.log(selectedDate.toDateString())
    const now = new Date();
    console.log(now.toDateString())
console.log(selectedDate.toDateString() === now.toDateString());

    const timeInput = document.getElementById("time");
    // Trừ 3 tiếng
    let minTime = new Date();
    minTime.setHours(now.getHours() + 1);

    // Nếu giờ sau khi trừ < 00:00 thì đặt về 00:00
    if (minTime.getHours() < 0) {
      minTime.setHours(0, 0);
    }
    console.log( minTime.toTimeString().slice(0, 5));
    
    if (selectedDate.toDateString() === now.toDateString()) {
        const minValue = minTime < openingHours ? minTime.toTimeString().slice(0, 5) : timeOpening;
        timeInput.setAttribute("min", minValue);
        timeInput.setAttribute("max", timeClosing);
    } else {
        timeInput.setAttribute("min", timeOpening);
        timeInput.setAttribute("max", timeClosing);
    }

    updateTableStatus();
  });

  /** 🏷️ Cập nhật trạng thái bàn dựa trên ngày & giờ đã chọn */
  function updateTableStatus() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (!selectedDate || !selectedTime) return;

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    console.log(selectedDateTime);

    document.querySelectorAll(".table-card").forEach((table) => {
      const tableId = table.getAttribute("data-table-id");
      const statusDiv = table.querySelector(".table-status");

      const isReserved = bookings.some((booking) => {
        if (booking.table.toString() !== tableId) return false;

        const bookedDateTime = new Date(booking.orderDate);

        // Trừ đi 7 giờ bằng cách sử dụng getTime()
        const adjustedBookedDateTime = new Date(
          bookedDateTime.getTime() - 7 * 60 * 60 * 1000
        );

        const timeDiff = Math.abs(
          (selectedDateTime - adjustedBookedDateTime) / (1000 * 60 * 60)
        );

        return timeDiff < 3; // Nếu chênh lệch dưới 3 giờ thì bàn đã đặt
      });

      if (isReserved) {
        statusDiv.textContent = "Đã đặt trước";
        statusDiv.className = "table-status reserved";
        table.classList.add("disabled");
      } else {
        statusDiv.textContent = "Có sẵn";
        statusDiv.className = "table-status available";
        table.classList.remove("disabled");
      }
    });
  }

  /** 🎯 Xử lý chọn bàn */
  function selectTable(selectedTable) {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (!selectedDate || !selectedTime) {
      alert("Vui lòng chọn ngày và giờ trước khi chọn bàn!");
      return;
    }

    document.querySelectorAll(".table-card").forEach((table) => {
      table.classList.remove("selected");
    });

    selectedTable.classList.add("selected");
    selectedTableInput.value = selectedTable.getAttribute("data-table-id");
    console.log("Bàn được chọn:", selectedTableInput.value);
  }

  /** 🖱️ Xử lý chọn bàn (Event Delegation) */
  tablesContainer.addEventListener("click", function (event) {
    const selectedTable = event.target.closest(".table-card");
    if (selectedTable && !selectedTable.classList.contains("disabled")) {
      selectTable(selectedTable);
    }
  });

  // Gán sự kiện onchange cho input ngày & giờ
  dateInput.addEventListener("change", updateTableStatus);
  timeInput.addEventListener("change", updateTableStatus);

  // Gọi lần đầu khi trang load để disable bàn nếu cần
  updateTableStatus();
});
