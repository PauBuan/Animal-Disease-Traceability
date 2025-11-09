import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";



export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    animalID: '',
    species: '',
    healthStatus: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    try {
      const response = await fetch('/api/transactions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add transaction');
      }

      const result = await response.json();
      setSubmitMessage(`Success: Transaction ${result.transactionId || 'added'}!`);
      setFormData({ animalID: '', species: '', healthStatus: '' });
      fetchTransactions();
    } catch (err) {
      setSubmitMessage(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">
          Animal Health Transactions
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Transaction Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-emerald-700 mb-6">Add New Record</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="animalID"
                value={formData.animalID}
                onChange={handleChange}
                placeholder="Animal ID (e.g., A001)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="Species (e.g., Elephant)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                placeholder="Health Status (e.g., Healthy)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3.5 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg shadow-md"
              >
                Submit Transaction
              </button>
            </form>

            {submitMessage && (
              <p
                className={`mt-6 text-center font-semibold text-lg ${
                  submitMessage.includes('Success')
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {submitMessage}
              </p>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-emerald-700 mb-6">Transaction History</h2>

            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg animate-pulse">Loading transactions...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 font-semibold text-lg">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="mt-4 text-emerald-600 underline hover:text-emerald-700 font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <p className="text-center text-gray-500 py-12 text-lg">
                No transactions recorded yet.
              </p>
            )}

            {!loading && !error && transactions.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Tx ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Initiator
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx, index) => (
                      <tr
                        key={tx.id || index}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.id || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.function || 'addAnimal'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.timestamp
                            ? new Date(tx.timestamp).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.initiator || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              tx.status === 'Success' || tx.status === 'success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tx.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}