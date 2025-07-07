import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Main component to manage deliveries
export default function DeliveryManager() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // === Form states ===
  // User info state
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    role: '',
  });
// Delivery info state
  const [delivery, setDelivery] = useState({
    rfqId: '',
    poNumber: '',
    deliveryProvider: '',
    assignedTo: '',
    deliveryDate: '',
    dueDate: '',
    location: '',
    type: 'Private',
    description: '',
    status: '',
  });
 // List of products in the delivery
  const [products, setProducts] = useState([]);

  // Product input for adding/editing products
  const [currentProduct, setCurrentProduct] = useState({
    item: '',
    quantity: '',
    targetPrice: '',
    spec: '',
  });
 // Index of product being edited (null if adding new)
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // List of deliveries loaded from backend
  const [deliveries, setDeliveries] = useState([]);

  // Editing state: null if creating new, else delivery id being edited
  const [editingDeliveryId, setEditingDeliveryId] = useState(null);

  // Load deliveries on mount
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Fetch deliveries from backend
  async function fetchDeliveries() {
    try {
      const res = await axios.get(`${API_BASE}/api/delivery`);
      setDeliveries(res.data);
    } catch (err) {
      alert('Error loading deliveries: ' + err.message);
    }
  }

  // Add or update a product in the product list
  function addOrUpdateProduct() {
    if (!currentProduct.item.trim()) {
      alert('Product item is required');
      return;
    }

    if (editingProductIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editingProductIndex] = currentProduct;
      setProducts(updatedProducts);
      setEditingProductIndex(null);
    } else {
      setProducts([...products, currentProduct]);
    }
    setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
  }

  // Edit a product from the list
  function editProduct(index) {
    setCurrentProduct(products[index]);
    setEditingProductIndex(index);
  }

  // Delete a product from the list
  function deleteProduct(index) {
    setProducts(products.filter((_, i) => i !== index));
    if (editingProductIndex === index) {
      setEditingProductIndex(null);
      setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
    }
  }

  // Fill form with existing delivery info to edit
  function startEditingDelivery(deliveryToEdit) {
    setEditingDeliveryId(deliveryToEdit.id);

    setUser({
      firstName: deliveryToEdit.User?.firstName || '',
      lastName: deliveryToEdit.User?.lastName || '',
      phone: deliveryToEdit.User?.phone || '',
      email: deliveryToEdit.User?.email || '',
      company: deliveryToEdit.User?.company || '',
      role: deliveryToEdit.User?.role || '',
    });

    setDelivery({
      rfqId: deliveryToEdit.rfqId || '',
      poNumber: deliveryToEdit.poNumber || '',
      deliveryProvider: deliveryToEdit.deliveryProvider || '',
      assignedTo: deliveryToEdit.assignedTo || '',
      deliveryDate: deliveryToEdit.deliveryDate ? deliveryToEdit.deliveryDate.slice(0, 10) : '',
      dueDate: deliveryToEdit.dueDate ? deliveryToEdit.dueDate.slice(0, 10) : '',
      location: deliveryToEdit.location || '',
      type: deliveryToEdit.type || 'Private',
      description: deliveryToEdit.description || '',
      status: deliveryToEdit.status || '',
    });

    setProducts(
      deliveryToEdit.Products?.map(p => ({
        item: p.item || '',
        quantity: p.quantity || '',
        targetPrice: p.targetPrice || '',
        spec: p.spec || '',
      })) || []
    );

    // Reset product editing state
    setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
    setEditingProductIndex(null);
  }

  // Cancel editing and clear form
  function cancelEditing() {
    setEditingDeliveryId(null);
    clearForm();
  }

  // Clear all form states
  function clearForm() {
    setUser({ firstName: '', lastName: '', phone: '', email: '', company: '', role: '' });
    setDelivery({
      rfqId: '',
      poNumber: '',
      deliveryProvider: '',
      assignedTo: '',
      deliveryDate: '',
      dueDate: '',
      location: '',
      type: 'Private',
      description: '',
      status: '',
    });
    setProducts([]);
    setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
    setEditingProductIndex(null);
  }

  // Submit new delivery or update existing one
  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation (you can add more)
    if (!user.firstName || !user.lastName || !user.phone || !user.email) {
      alert('Please fill in all required user fields');
      return;
    }
    if (!delivery.rfqId || !delivery.poNumber || !delivery.deliveryProvider || !delivery.location) {
      alert('Please fill in all required delivery fields');
      return;
    }

    const payload = {
      user,
      delivery,
      products: products.map(p => ({
        ...p,
        quantity: p.quantity ? Number(p.quantity) : null,
        targetPrice: p.targetPrice ? Number(p.targetPrice) : null,
      })),
    };

    try {
      if (editingDeliveryId) {
        // Update delivery and products:
        // 1) Update delivery info only (backend route you gave updates only Delivery)
        // 2) You may need additional backend routes to update User and Products (not included here)
        // For now, just update delivery fields:
        await axios.put(`${API_BASE}/api/delivery/${editingDeliveryId}`, delivery);

        // Ideally, update user info & products too (you'll need to build those backend endpoints).
        // For now, show success and refresh deliveries.

        alert('Delivery updated! (Note: User and Products updates need backend API)');

        setEditingDeliveryId(null);
        clearForm();
        fetchDeliveries();
      } else {
        // Create new delivery
        await axios.post(`${API_BASE}/api/delivery`, payload);
        alert('Delivery created!');
        clearForm();
        fetchDeliveries();
      }
    } catch (err) {
      alert('Error saving delivery: ' + err.message);
    }
  }

  // Delete a delivery
  async function deleteDelivery(id) {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;

    try {
      await axios.delete(`${API_BASE}/api/delivery/${id}`);
      alert('Delivery deleted!');
      if (editingDeliveryId === id) cancelEditing();
      fetchDeliveries();
    } catch (err) {
      alert('Failed to delete delivery: ' + err.message);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-green-700">
        {editingDeliveryId ? 'Edit Delivery' : 'Add Delivery'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
        {/* User Info */}
        <fieldset className="border border-gray-300 rounded-lg p-4">
          <legend className="text-xl font-semibold mb-4 px-2">User Info</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="First Name *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              required
            />
            <input
              placeholder="Last Name *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              required
            />
            <input
              placeholder="Phone *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
            <input
              placeholder="Company"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.company}
              onChange={(e) => setUser({ ...user, company: e.target.value })}
            />
            <input
              placeholder="Role"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            />
          </div>
        </fieldset>

        {/* Delivery Info */}
        <fieldset className="border border-gray-300 rounded-lg p-4">
          <legend className="text-xl font-semibold mb-4 px-2">Delivery Info</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="RFQ ID *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.rfqId}
              onChange={(e) => setDelivery({ ...delivery, rfqId: e.target.value })}
              required
            />
            <input
              placeholder="PO Number *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.poNumber}
              onChange={(e) => setDelivery({ ...delivery, poNumber: e.target.value })}
              required
            />
            <input
              placeholder="Delivery Provider *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.deliveryProvider}
              onChange={(e) => setDelivery({ ...delivery, deliveryProvider: e.target.value })}
              required
            />
            <input
              placeholder="Assigned To"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.assignedTo}
              onChange={(e) => setDelivery({ ...delivery, assignedTo: e.target.value })}
            />
            <input
              type="date"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.deliveryDate}
              onChange={(e) => setDelivery({ ...delivery, deliveryDate: e.target.value })}
            />
            <input
              type="date"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.dueDate}
              onChange={(e) => setDelivery({ ...delivery, dueDate: e.target.value })}
            />
            <input
              placeholder="Location *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.location}
              onChange={(e) => setDelivery({ ...delivery, location: e.target.value })}
              required
            />
            <select
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={delivery.type}
              onChange={(e) => setDelivery({ ...delivery, type: e.target.value })}
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
            <textarea
              placeholder="Description"
              className="col-span-full border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              rows={3}
              value={delivery.description}
              onChange={(e) => setDelivery({ ...delivery, description: e.target.value })}
            />
          </div>
        </fieldset>

        {/* Products */}
        <fieldset className="border border-gray-300 rounded-lg p-4">
          <legend className="text-xl font-semibold mb-4 px-2">Products</legend>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Item *"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={currentProduct.item}
              onChange={(e) => setCurrentProduct({ ...currentProduct, item: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={currentProduct.quantity}
              onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
            />
            <input
              type="number"
              placeholder="Target Price"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={currentProduct.targetPrice}
              onChange={(e) => setCurrentProduct({ ...currentProduct, targetPrice: e.target.value })}
            />
            <input
              placeholder="Specification"
              className="border px-3 py-2 rounded focus:ring-green-400 focus:outline-none focus:ring-2"
              value={currentProduct.spec}
              onChange={(e) => setCurrentProduct({ ...currentProduct, spec: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            onClick={addOrUpdateProduct}
          >
            {editingProductIndex !== null ? 'Update Product' : 'Add Product'}
          </button>

          {products.length > 0 && (
            <ul className="mt-4 space-y-2 max-h-48 overflow-auto border border-gray-200 rounded p-3 bg-gray-50">
              {products.map((p, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>
                    <strong>{p.item}</strong> | Qty: {p.quantity || '-'} | Price: {p.targetPrice || '-'} | Spec: {p.spec || '-'}
                  </span>
                  <span>
                    <button
                      type="button"
                      className="text-blue-600 mr-4 hover:underline"
                      onClick={() => editProduct(i)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => deleteProduct(i)}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div className="flex justify-between">
          {editingDeliveryId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className={`ml-auto bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition`}
          >
            {editingDeliveryId ? 'Update Delivery' : 'Submit Delivery'}
          </button>
        </div>
      </form>

      {/* Existing Deliveries */}
      <section className="mt-16">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-green-700">Existing Deliveries</h2>
        {deliveries.length === 0 ? (
          <p className="text-center text-gray-500">No deliveries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 border-b text-left">User Info</th>
                  <th className="px-6 py-3 border-b text-left">Delivery Info</th>
                  <th className="px-6 py-3 border-b text-left max-w-sm">Products</th>
                  <th className="px-6 py-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="even:bg-gray-50 align-top">
                    <td className="border-b px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {d.User?.firstName} {d.User?.lastName}
                      <br />
                      <small className="text-gray-600">Phone: {d.User?.phone || '-'}</small>
                      <br />
                      <small className="text-gray-600">Email: {d.User?.email || '-'}</small>
                      <br />
                      <small className="text-gray-600">Company: {d.User?.company || '-'}</small>
                      <br />
                      <small className="text-gray-600">Role: {d.User?.role || '-'}</small>
                    </td>
                    <td className="border-b px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-xs">
                      RFQ: {d.rfqId} <br />
                      PO: {d.poNumber} <br />
                      Provider: {d.deliveryProvider} <br />
                      Assigned To: {d.assignedTo || '-'} <br />
                      Delivery Date: {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : '-'} <br />
                      Due Date: {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '-'} <br />
                      Location: {d.location} <br />
                      Type: {d.type} <br />
                      Description: {d.description || '-'} <br />
                      Status: {d.status || '-'}
                    </td>
                    <td className="border-b px-6 py-4 max-w-sm text-sm text-gray-700">
                      {d.Products && d.Products.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {d.Products.map((p, i) => (
                            <li key={i}>
                              <strong>{p.item}</strong> - Qty: {p.quantity || '-'}, Price: {p.targetPrice || '-'}, Spec: {p.spec || '-'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>No products</span>
                      )}
                    </td>
                    <td className="border-b px-6 py-4 text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => startEditingDelivery(d)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-4 py-2 rounded shadow transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDelivery(d.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
