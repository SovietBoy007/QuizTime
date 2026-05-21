type QuizProgressProps = {
  current: number;
  total: number;
};

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        <span>
          Question {current} of {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
