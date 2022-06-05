import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import toTitleCase from "../toTitleCase";

const allHaveBeenSelected = (selected) => {
    if (
        selected.week !== "none" &&
        selected.day !== "none" &&
        selected.period !== "none"
    ) {
        return true;
    }
    return false;
};

const AttendanceIndex = () => {
    const [schedule, setSchedule] = useGetDataOnMount({
        url: "/api/weeks",
        useToken: true,
        initialState: [],
    });
    const navigate = useNavigate();
    const [selected, setSelected] = useState({
        week: "none",
        day: "none",
        period: "none",
        activity: "none",
    });
    const selectWeek = (week) => {
        setSelected({ ...selected, week });
    };
    const selectDay = (day) => {
        setSelected({ ...selected, day });
    };
    const selectPeriod = (period) => {
        setSelected({ ...selected, period });
    };
    useEffect(() => {
        if (selected.period !== "none") {
            const selectedPeriodId =
                schedule[selected.week].days[selected.day].periods[
                    selected.period
                ].id;
            navigate(`/schedule/attendance/${selectedPeriodId}`);
        }
    }, [selected.period]);

    const getSelectedPeriodId = () => {
        const period =
            schedule[selected.week].days[selected.day].periods[selected.period];
        return period.id;
    };
    const urls = ["/api/weeks"];
    return (
        <>
            <h1>select week</h1>
            <ul>
                {schedule.map((week, weekIndex) => (
                    <li>
                        <button onClick={() => selectWeek(weekIndex)}>
                            {week.number}
                        </button>
                    </li>
                ))}
            </ul>
            <h1>Select Day</h1>
            {selected.week !== "none" &&
                schedule[selected.week].days.map((day, dayIndex) => (
                    <li>
                        <button
                            onClick={() => {
                                selectDay(dayIndex);
                            }}
                        >
                            {toTitleCase(day.dayName)}
                        </button>
                    </li>
                ))}
            <h1>Select Period</h1>
            {selected.day !== "none" &&
                schedule[selected.week].days[selected.day].periods.map(
                    (period, periodIndex) => (
                        <li>
                            <button
                                onClick={() => {
                                    selectPeriod(periodIndex);
                                }}
                            >
                                {period.periodNumber}
                            </button>
                        </li>
                    )
                )}
        </>
    );
};

export default AttendanceIndex;
