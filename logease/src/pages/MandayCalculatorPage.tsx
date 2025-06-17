import React, { useState } from "react";
import { Link } from "@tanstack/react-router";

const logVolumeOptions = [
  { label: "10G", value: "10G", manday: 15 },
  { label: "20G", value: "20G", manday: 20 },
  { label: "30G", value: "30G", manday: 25 },
  { label: "50G", value: "50G", manday: 30 },
  { label: "300G", value: "300G", manday: 80 },
  { label: "1.5T", value: "1.5T", manday: 120 },
];

// Define the table data structure
const initialTableData = [
  {
    category: "Log Platform",
    items: [
      { name: "Deployment (3 nodes)", quantity: 1, min: 2, max: 3 },
      { name: "Configuration (floating)", quantity: 1, min: 1, max: 1 },
      { name: "Log Ingestion", quantity: 5, min: 0.5, max: 0.5 },
      { name: "Log Parsing", quantity: 5, min: 0.5, max: 0.5 },
      { name: "Dashboard", quantity: 1, min: 1, max: 3 },
      { name: "Report", quantity: 1, min: 1, max: 2 },
      { name: "Alert", quantity: 2, min: 1, max: 1 },
      { name: "User Permission", quantity: 1, min: 1, max: 1 },
      { name: "UAT", quantity: 1, min: 1, max: 1 },
    ],
  },
  {
    category: "SIEM",
    items: [
      { name: "Threat Intelligence", quantity: 1, min: 1, max: 1 },
      { name: "Alert Rule", quantity: 1, min: 0.5, max: 0.5 },
    ],
  },
  {
    category: "SOAR",
    items: [
      { name: "Built-in Playbook Optimization", quantity: 1, min: 1, max: 2 },
      { name: "New Playbook", quantity: 1, min: 3, max: 5 },
      { name: "Integration with Third-party Devices", quantity: 1, min: 3, max: 5 },
    ],
  },
];

export function MandayCalculatorPage() {
  const [tableData, setTableData] = useState(initialTableData);
  const [selectedLogVolume, setSelectedLogVolume] = useState(logVolumeOptions[0].value);

  // Calculate per-category and total min/max
  const categoryTotals = tableData.map(cat => {
    return cat.items.reduce(
      (acc, item) => {
        acc.min += item.quantity * item.min;
        acc.max += item.quantity * item.max;
        return acc;
      },
      { min: 0, max: 0 }
    );
  });

  const total = categoryTotals.reduce(
    (acc, cat) => {
      acc.min += cat.min;
      acc.max += cat.max;
      return acc;
    },
    { min: 0, max: 0 }
  );

  // Handle quantity change
  const handleQuantityChange = (catIdx, itemIdx, value) => {
    const newTableData = tableData.map((cat, cIdx) => {
      if (cIdx !== catIdx) return cat;
      return {
        ...cat,
        items: cat.items.map((item, iIdx) =>
          iIdx === itemIdx ? { ...item, quantity: Number(value) } : item
        ),
      };
    });
    setTableData(newTableData);
  };

  const selectedManday = logVolumeOptions.find(opt => opt.value === selectedLogVolume)?.manday || "-";

  return (
    <div className="min-h-screen bg-gradient-to-br flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl p-8 mt-4">
        <div className="flex items-center mb-6">
          <Link to="/" className="logease-button mr-4 !bg-blue-700 !text-white !px-4 !py-2 !rounded-lg !shadow">
            ← Back
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide">Manday Estimation Table</h2>
        </div>
        {/* Log Volume Estimation Section */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl shadow">
          <div className="font-semibold text-green-900 text-lg">Estimate by Daily Log Volume:</div>
          <select
            className="border border-green-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-green-900 font-semibold"
            value={selectedLogVolume}
            onChange={e => setSelectedLogVolume(e.target.value)}
          >
            {logVolumeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="ml-0 md:ml-4 text-green-800 text-base md:text-lg font-bold">
            Estimated Manday: <span className="text-green-700">{selectedManday}</span>
          </div>
        </div>
        {/* Summary Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {tableData.map((cat, idx) => (
            <div key={cat.category} className="rounded-xl bg-blue-50 border border-blue-200 shadow p-4 flex flex-col items-center">
              <div className="font-semibold text-blue-900 text-lg mb-1">{cat.category}</div>
              <div className="flex gap-2 text-sm md:text-base">
                <span className="text-green-700 font-bold">Min: {categoryTotals[idx].min.toFixed(2)}</span>
                <span className="text-red-700 font-bold">Max: {categoryTotals[idx].max.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 shadow p-4 flex flex-col items-center">
            <div className="font-semibold text-yellow-900 text-lg mb-1">Total</div>
            <div className="flex gap-2 text-sm md:text-base">
              <span className="text-green-700 font-bold">Min: {total.min.toFixed(2)}</span>
              <span className="text-red-700 font-bold">Max: {total.max.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden text-sm md:text-base">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Task</th>
                <th className="p-3 font-semibold">Quantity</th>
                <th className="p-3 font-semibold">Min</th>
                <th className="p-3 font-semibold">Max</th>
                <th className="p-3 font-semibold">Min Days</th>
                <th className="p-3 font-semibold">Max Days</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((cat, catIdx) =>
                cat.items.map((item, itemIdx) => (
                  <tr
                    key={cat.category + item.name}
                    className={
                      (itemIdx % 2 === 0 ? "bg-blue-50" : "bg-white") +
                      " hover:bg-blue-100 transition-colors"
                    }
                  >
                    {itemIdx === 0 ? (
                      <td
                        className="p-3 text-center font-bold text-blue-900 border-b border-blue-200"
                        rowSpan={cat.items.length}
                        style={{ background: "#e0e7ff" }}
                      >
                        {cat.category}
                      </td>
                    ) : null}
                    <td className="p-3 border-b border-blue-100">{item.name}</td>
                    <td className="p-3 border-b border-blue-100">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(catIdx, itemIdx, e.target.value)
                        }
                        className="w-16 border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center bg-blue-50 hover:bg-blue-100 transition"
                      />
                    </td>
                    <td className="p-3 border-b border-blue-100 text-blue-700">{item.min}</td>
                    <td className="p-3 border-b border-blue-100 text-blue-700">{item.max}</td>
                    <td className="p-3 border-b border-blue-100 font-semibold text-green-700">{(item.quantity * item.min).toFixed(2)}</td>
                    <td className="p-3 border-b border-blue-100 font-semibold text-red-700">{(item.quantity * item.max).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-blue-100">
                <td className="p-3 font-bold text-right text-blue-900" colSpan={5}>
                  Total
                </td>
                <td className="p-3 font-bold text-green-700 text-lg">{total.min.toFixed(2)}</td>
                <td className="p-3 font-bold text-red-700 text-lg">{total.max.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-6 text-gray-600 text-xs md:text-sm text-center">
          <span className="inline-block bg-blue-50 px-3 py-1 rounded-full shadow-sm">
            You can adjust the quantity for each item, and the total man-days will be calculated automatically.
          </span>
        </div>
      </div>
    </div>
  );
}