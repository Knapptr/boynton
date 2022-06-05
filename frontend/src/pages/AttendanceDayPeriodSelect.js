import { useParams } from "react-router-dom";
const AttendanceDayPeriodSelect = ({ schedule, selectedWeek }) => {
    return (
        <>
            <h1>Select Day</h1>
            {schedule[selectedWeek].days.map((day, dayIndex) => (
                <li>
                    <Link
                        onClick={() => {
                            selectDay(dayIndex);
                        }}
                    >
                        {toTitleCase(day.dayName)}
                    </Link>
                </li>
            ))}
        </>
    );
};

export default AttendanceDayPeriodSelect;
