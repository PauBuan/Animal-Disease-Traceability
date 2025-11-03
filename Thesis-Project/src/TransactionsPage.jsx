import { useState, useEffect } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ animalID: '', species: '', healthStatus: '' });
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      const result = await response.json();
      setSubmitMessage(`Success: Transaction ${result.transactionId} committed`);
      setFormData({ animalID: '', species: '', healthStatus: '' });
      fetchTransactions(); // Refresh table
    } catch (err) {
      setSubmitMessage(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Sample Smart Contract Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Transaction Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="animalID"
                value={formData.animalID}
                onChange={handleChange}
                placeholder="Animal ID"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="Species"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                placeholder="Health Status"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Submit Transaction
              </button>
            </form>
            {submitMessage && <p className="mt-4 text-sm text-gray-700">{submitMessage}</p>}
          </div>

          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Transaction History</h2>
            {/* Transaction History Card 
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left">Transaction ID</th>
                      <th className="px-4 py-2 text-left">Function Name</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Initiator</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={tx.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2">{tx.id}</td>
                        <td className="px-4 py-2">{tx.function}</td>
                        <td className="px-4 py-2">{tx.timestamp}</td>
                        <td className="px-4 py-2">{tx.initiator}</td>
                        <td className="px-4 py-2">{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}*/}
          </div>
        </div>
      </div>
    </div>
  );
}
