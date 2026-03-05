'use client';

import React from 'react';

const Receipts = () => {
  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
        Receipts
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Package</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 15, 2024</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Spanish Grammar Basics</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$49.99</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-paid px-3 py-1 rounded-full text-xs font-medium">Paid</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">INV-2024-001</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="btn-mint px-4 py-2 rounded-lg text-sm font-medium">
                  Download
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 10, 2024</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Conversation Practice Pack</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$29.99</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-pending px-3 py-1 rounded-full text-xs font-medium">Pending</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">INV-2024-002</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="btn-ochre px-4 py-2 rounded-lg text-sm font-medium">
                  Download
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;