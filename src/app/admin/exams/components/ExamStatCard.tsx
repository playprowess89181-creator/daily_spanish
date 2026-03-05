interface ExamStatCardProps {
  icon: string;
  iconColor: string;
  title: string;
  value: string;
  bgColor: string;
}

export default function ExamStatCard({ icon, iconColor, title, value, bgColor }: ExamStatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}