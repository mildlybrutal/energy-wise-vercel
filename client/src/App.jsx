import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [unitsUsed, setUnitsUsed] = useState("");
    const [perUnitCost, setPerUnitCost] = useState("");
    const [totalBill, setTotalBill] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState("checking");

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                await axios.get("http://localhost:5000/health");
                setServerStatus("online");
            } catch (err) {
                setServerStatus("offline");
            }
        };

        checkServerStatus();
    }, []);

    const parseSuggestions = (suggestionsData) => {
        // Handle both string and array responses from the server
        if (typeof suggestionsData === "string") {
            // Split by newlines and clean up each tip
            return suggestionsData
                .split(/\n/)
                .filter((line) => line.trim() !== "")
                .map((line) => {
                    // Remove numbering (1., 2., etc.) if present
                    return line.trim().replace(/^\d+\.\s*/, "");
                });
        } else if (Array.isArray(suggestionsData)) {
            // Already an array, just make sure items are clean strings
            return suggestionsData
                .map((tip) =>
                    typeof tip === "string"
                        ? tip.trim().replace(/^\d+\.\s*/, "")
                        : ""
                )
                .filter((tip) => tip !== "");
        }

        // Fallback to empty array if we can't parse suggestions
        return [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const response = await axios.post(
                "http://localhost:5000/suggestions",
                {
                    unitsUsed: Number(unitsUsed),
                    perUnitCost: Number(perUnitCost),
                    totalBill: Number(totalBill),
                }
            );

            // Handle the response data safely
            if (response.data && response.data.suggestions) {
                const parsedSuggestions = parseSuggestions(
                    response.data.suggestions
                );

                if (parsedSuggestions.length > 0) {
                    setSuggestions(parsedSuggestions);
                } else {
                    setError("No valid suggestions received from server.");
                }
            } else {
                setError("Invalid response format from the server.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError(
                err.response?.data?.error ||
                    err.message ||
                    "An error occurred while fetching suggestions"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUnitsOrCostChange = () => {
        if (unitsUsed && perUnitCost) {
            const calculated = (
                Number(unitsUsed) * Number(perUnitCost)
            ).toFixed(2);
            setTotalBill(calculated);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-gray-100">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                        EnergyWise
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Get personalized energy-saving suggestions based on your
                        usage
                    </p>

                    {serverStatus === "offline" && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-300 border border-red-800">
                            <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full"></span>
                            Server offline
                        </div>
                    )}

                    {serverStatus === "online" && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300 border border-green-800">
                            <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
                            Server online
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-6 border border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Units Used
                            </label>
                            <input
                                type="number"
                                value={unitsUsed}
                                onChange={(e) => {
                                    setUnitsUsed(e.target.value);
                                    handleUnitsOrCostChange();
                                }}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition duration-200"
                                placeholder="Enter units consumed"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Cost per Unit
                            </label>
                            <input
                                type="number"
                                value={perUnitCost}
                                onChange={(e) => {
                                    setPerUnitCost(e.target.value);
                                    handleUnitsOrCostChange();
                                }}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition duration-200"
                                placeholder="Enter cost per unit"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Total Bill
                            </label>
                            <input
                                type="number"
                                value={totalBill}
                                onChange={(e) => setTotalBill(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition duration-200"
                                placeholder="Enter total bill amount"
                                step="0.01"
                                min="0"
                                required
                            />
                            {unitsUsed && perUnitCost && (
                                <p className="text-xs text-blue-400 mt-1">
                                    Auto-calculated from units and cost per unit
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || serverStatus === "offline"}
                                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium transition duration-200 ${
                                    serverStatus === "offline"
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : serverStatus === "offline" ? (
                                    "Server Offline"
                                ) : (
                                    "Get Suggestions"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="mt-6 bg-red-900/40 border border-red-800 rounded-lg p-4">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {suggestions.length > 0 && (
                    <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-6 border border-slate-700 animate-fade-in">
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4">
                            Energy Saving Suggestions
                        </h2>
                        <ul className="space-y-3 list-none">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 text-sm flex items-start"
                                >
                                    <span className="text-teal-400 font-semibold mr-2 mt-0.5 flex-shrink-0">
                                        {index + 1}.
                                    </span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 pt-4 border-t border-slate-600/50">
                            <p className="text-xs text-gray-400 italic">
                                Based on your consumption of {unitsUsed} units
                                at {perUnitCost} per unit (total bill: $
                                {totalBill})
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
