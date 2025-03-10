document.addEventListener("DOMContentLoaded", function () {
    const bookings = window.bookings || [];
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    const tablesContainer = document.querySelector(".table-list");
    const selectedTableInput = document.getElementById("selectedTableId");
    /** 🕒 Không cho chọn ngày trong quá khứ */
    let today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);

    console.log(bookings);
    /** 🕒 Cập nhật min cho giờ khi chọn ngày */
    dateInput.addEventListener("change", function () {
        const selectedDate = new Date(dateInput.value);
        const now = new Date();
        const timeInput = document.getElementById("time");
        // Trừ 3 tiếng
        let minTime = new Date();
        minTime.setHours(now.getHours() + 1);
    
        // Nếu giờ sau khi trừ < 00:00 thì đặt về 00:00
        if (minTime.getHours() < 0) {
            minTime.setHours(0, 0);
        }
        if (selectedDate.toDateString() === now.toDateString()) {
            timeInput.setAttribute("min", minTime.toTimeString().slice(0, 5));
        } else {
            timeInput.removeAttribute("min");
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
        
        document.querySelectorAll(".table-card").forEach(table => {
            const tableId = table.getAttribute("data-table-id");
            const statusDiv = table.querySelector(".table-status");

            const isReserved = bookings.some(booking => {
                if (booking.table.toString() !== tableId) return false;
                
                const bookedDateTime = new Date(booking.orderDate);
                console.log("test1 ", booking.orderDate);
                
                // Trừ đi 7 giờ bằng cách sử dụng getTime()
                const adjustedBookedDateTime = new Date(bookedDateTime.getTime() - 7 * 60 * 60 * 1000);
                
                console.log("test2 ", adjustedBookedDateTime);

                const timeDiff = Math.abs((selectedDateTime - adjustedBookedDateTime) / (1000 * 60 * 60));
                console.log(selectedDateTime);
                
                console.log(timeDiff);
                
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

        document.querySelectorAll(".table-card").forEach(table => {
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
