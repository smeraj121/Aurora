class TimeHelper {
  static toDb(time) {
    const [value, period] = time.split(" ");
    let [hour, minute] = value.split(":").map(Number);

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  }

  static toDisplay(time) {
    let [hour, minute] = time.split(":").map(Number);

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
  }

  static addMinutes(time, minutesToAdd) {
    const [hour, minute] = time.split(":").map(Number);

    const totalMinutes = hour * 60 + minute + minutesToAdd;

    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;

    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;
  }
}

module.exports = TimeHelper;