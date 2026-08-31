"use client";

import { useState, useMemo } from "react";
import { CalendarClock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ScheduleDay } from "@/lib/scheduling";

interface ScheduleTimePickerProps {
  days: ScheduleDay[];
  value: { date: string; time: string } | null;
  onChange: (value: { date: string; time: string } | null) => void;
}

function format12Hour(hour: number): string {
  if (hour === 0) return "12 ص";
  if (hour < 12) return `${hour} ص`;
  if (hour === 12) return "12 م";
  return `${hour - 12} م`;
}

function getHour24Format(hour12: string): string {
  const [h, period] = hour12.split(" ");
  let h24 = parseInt(h);
  if (period === "ص" && h24 === 12) h24 = 0;
  if (period === "م" && h24 !== 12) h24 += 12;
  return h24.toString().padStart(2, "0");
}

/** Date + time picker with day select and time in 12-hour format with AM/PM.
 *  Hour/minute options come from each day's actual bookable slots
 *  (`ScheduleDay.slots`), which for today already start 30min from now — so
 *  picking today never offers a time that has already passed. */
export default function ScheduleTimePicker({
  days,
  value,
  onChange,
}: ScheduleTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(value?.date || days[0]?.date || "");

  const activeDay = useMemo(
    () => days.find((d) => d.date === selectedDate) ?? days[0],
    [days, selectedDate]
  );

  // Every distinct hour (12h label) available for the selected day, in order.
  const hoursForDay = useMemo(() => {
    if (!activeDay) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const slot of activeDay.slots) {
      const label = format12Hour(parseInt(slot.split(":")[0]));
      if (!seen.has(label)) {
        seen.add(label);
        result.push(label);
      }
    }
    return result;
  }, [activeDay]);

  const [selectedHour12, setSelectedHour12] = useState<string>(
    value ? format12Hour(parseInt(value.time.split(":")[0])) : hoursForDay[0] ?? "11 ص"
  );

  // Minutes available for the selected day + hour combination.
  const minutesForHour = useMemo(() => {
    if (!activeDay) return [];
    const hour24 = getHour24Format(selectedHour12);
    return activeDay.slots
      .filter((slot) => slot.split(":")[0] === hour24)
      .map((slot) => slot.split(":")[1]);
  }, [activeDay, selectedHour12]);

  const [selectedMinute, setSelectedMinute] = useState<string>(
    value?.time.split(":")[1] || minutesForHour[0] || "00"
  );

  function commit(date: string, hour12: string, minute: string) {
    const hour24 = getHour24Format(hour12);
    onChange({ date, time: `${hour24}:${minute}` });
  }

  const handleDateChange = (date: string | null) => {
    if (!date) return;
    const day = days.find((d) => d.date === date);
    if (!day) return;
    const firstHour = format12Hour(parseInt(day.slots[0].split(":")[0]));
    const firstMinute = day.slots[0].split(":")[1];
    setSelectedDate(date);
    setSelectedHour12(firstHour);
    setSelectedMinute(firstMinute);
    commit(date, firstHour, firstMinute);
  };

  const handleHourChange = (hour: string | null) => {
    if (!hour || !activeDay) return;
    const hour24 = getHour24Format(hour);
    const firstMinute =
      activeDay.slots.find((slot) => slot.split(":")[0] === hour24)?.split(":")[1] ?? "00";
    setSelectedHour12(hour);
    setSelectedMinute(firstMinute);
    commit(selectedDate, hour, firstMinute);
  };

  const handleMinuteChange = (minute: string | null) => {
    if (!minute) return;
    setSelectedMinute(minute);
    commit(selectedDate, selectedHour12, minute);
  };

  return (
    <div className="flex items-center gap-3 bg-white/8 border border-white/15 rounded-[16px] p-4">
      <span className="flex items-center justify-center bg-glace-yellow/15 text-glace-yellow rounded-full size-10 shrink-0">
        <CalendarClock size={20} />
      </span>

      <div className="flex flex-1 gap-2.5 min-w-0">
        {/* Day select */}
        <Select value={selectedDate || ""} onValueChange={handleDateChange}>
          <SelectTrigger className="flex-1 min-w-0 bg-white/10 hover:bg-white/15 border-0 text-white rounded-[14px] py-5 text-[14px] font-bold focus:ring-0 focus:ring-offset-0 [&_svg]:size-4 [&_svg]:text-white/60 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2d8aaa] backdrop-blur-[20px] border-0 rounded-[20px] text-white shadow-lg ring-1 ring-white/20 p-2 [&_[data-slot=select-scroll-up-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-down-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-up-button]]:text-white [&_[data-slot=select-scroll-down-button]]:text-white">
            {days.map((day) => (
              <SelectItem key={day.date} value={day.date} className="rounded-[14px] text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer py-3 px-3 my-0.5 text-[14px]">
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Hour select */}
        <Select value={selectedHour12 || ""} onValueChange={handleHourChange}>
          <SelectTrigger className="w-24 bg-white/10 hover:bg-white/15 border-0 text-white rounded-[14px] py-5 text-[14px] font-bold focus:ring-0 focus:ring-offset-0 [&_svg]:size-4 [&_svg]:text-white/60 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2d8aaa] backdrop-blur-[20px] border-0 rounded-[20px] text-white shadow-lg ring-1 ring-white/20 p-2 [&_[data-slot=select-scroll-up-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-down-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-up-button]]:text-white [&_[data-slot=select-scroll-down-button]]:text-white">
            {hoursForDay.map((hour) => (
              <SelectItem key={hour} value={hour} className="rounded-[14px] text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer py-3 px-3 my-0.5 text-[14px] justify-center">
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Minute select */}
        <Select value={selectedMinute || ""} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-20 bg-white/10 hover:bg-white/15 border-0 text-white rounded-[14px] py-5 text-[14px] font-bold focus:ring-0 focus:ring-offset-0 [&_svg]:size-4 [&_svg]:text-white/60 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2d8aaa] backdrop-blur-[20px] border-0 rounded-[20px] text-white shadow-lg ring-1 ring-white/20 p-2 [&_[data-slot=select-scroll-up-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-down-button]]:bg-[#2d8aaa] [&_[data-slot=select-scroll-up-button]]:text-white [&_[data-slot=select-scroll-down-button]]:text-white">
            {minutesForHour.map((minute) => (
              <SelectItem key={minute} value={minute} className="rounded-[14px] text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer py-3 px-3 my-0.5 text-[14px] justify-center">
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
