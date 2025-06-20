import React, { useState, useMemo } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock })
      if (data.success) {
        fetchProducts()
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  // ✅ Export to Excel
  const exportToExcel = () => {
    const data = filteredProducts.map(p => ({
      Name: p.name,
      Category: p.category,
      Price: `${currency}${p.offerPrice}`,
      Stock: p.inStock ? 'In Stock' : 'Out of Stock',
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    XLSX.writeFile(workbook, 'products.xlsx')
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>

        {/* Search + Filter + Export Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-2/3">
            <input
              type="text"
              placeholder="Search product..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-1/2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Export Excel
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {filteredProducts.map(product => (
                <tr
                  key={product._id}
                  className={`border-t border-gray-500/20 ${!product.inStock ? 'bg-red-50' : 'bg-white'}`}
                >
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img src={product.image[0]} alt="Product" className="w-16" />
                    </div>
                    <span className="truncate max-sm:hidden w-full">{product.name}</span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                        <input
                          onClick={() => toggleStock(product._id, !product.inStock)}
                          checked={product.inStock}
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                        <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                      </label>
                      <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <p className="p-6 text-gray-400">No products found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList
