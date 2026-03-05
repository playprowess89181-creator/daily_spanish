'use client';

export default function PaymentTrendsChart() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Trends (Last 12 Months)</h3>
      <div className="relative h-96">
        <canvas id="paymentChart"></canvas>
      </div>
    </div>
  );
}

