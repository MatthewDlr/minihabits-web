import { useRef, useEffect, useState } from "react";
import { useHabits } from "../contexts/HabitContext";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import JSConfetti from "js-confetti";
import { HabitType } from "../types/habit";
import { BooleanHabitCard } from "../components/habits/boolean-habit-card";
import { CounterHabitCard } from "../components/habits/counter-habit-card";
import { TaskHabitCard } from "../components/habits/task-habit-card";
import { Separator } from "../components/ui/separator";
import { AddNewButtons } from "../components/add-new-buttons";

export function HabitList() {
  const {
    habits,
    isLoading,
    trackHabit,
    untrackHabit,
    incrementHabit,
    decrementHabit,
  } = useHabits();
  const navigate = useNavigate();
  const jsConfettiRef = useRef<JSConfetti | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [localCompletionStatus, setLocalCompletionStatus] = useState<
    Record<string, Record<string, number>>
  >({});

  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLast5Days = () => {
    const dates = [];
    const maxDays = isMobile ? 1 : 5;
    for (let i = maxDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const visibleHabits = habits.filter(
    (habit) =>
      habit.type !== HabitType.TASK ||
      !habit.completedDates[new Date().toISOString().split("T")[0]]
  );

  // Separate habits and tasks
  const regularHabits = visibleHabits.filter(
    (habit) => habit.type !== HabitType.TASK
  );
  const tasks = visibleHabits.filter((habit) => habit.type === HabitType.TASK);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-8">
                  <div className="min-w-[200px]">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex gap-6">
                    {[...Array(isMobile ? 1 : 5)].map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-end mb-4">
          <AddNewButtons />
        </div>
        <div className="space-y-4 habit-list">
          {/* Regular Habits Section */}
          {regularHabits.map((habit) => {
            if (!localCompletionStatus[habit._id]) {
              setLocalCompletionStatus((prev) => ({
                ...prev,
                [habit._id]: { ...habit.completedDates },
              }));
            }

            const commonProps = {
              habit,
              localCompletionStatus,
              setLocalCompletionStatus,
              jsConfettiRef,
              onClick: () => navigate(`/stats/${habit._id}`),
            };

            switch (habit.type) {
              case HabitType.BOOLEAN:
                return (
                  <BooleanHabitCard
                    key={habit._id}
                    {...commonProps}
                    dates={getLast5Days()}
                    formatDate={formatDate}
                    onTrack={trackHabit}
                    onUntrack={untrackHabit}
                  />
                );
              case HabitType.COUNTER:
                return (
                  <CounterHabitCard
                    key={habit._id}
                    {...commonProps}
                    dates={getLast5Days()}
                    formatDate={formatDate}
                    onIncrement={incrementHabit}
                    onDecrement={decrementHabit}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Separator and Tasks Section */}
          {tasks.length > 0 && regularHabits.length > 0 && (
            <div className="py-4">
              <Separator className="my-4" />
            </div>
          )}

          {/* Tasks Section */}
          {tasks.map((habit) => {
            if (!localCompletionStatus[habit._id]) {
              setLocalCompletionStatus((prev) => ({
                ...prev,
                [habit._id]: { ...habit.completedDates },
              }));
            }

            const commonProps = {
              habit,
              localCompletionStatus,
              setLocalCompletionStatus,
              jsConfettiRef,
              onClick: () => {},
            };

            return (
              <TaskHabitCard
                key={habit._id}
                {...commonProps}
                onTrack={trackHabit}
                onUntrack={untrackHabit}
                titleStyle={{
                  textDecoration: habit.completedDates[
                    new Date().toISOString().split("T")[0]
                  ]
                    ? "line-through"
                    : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
