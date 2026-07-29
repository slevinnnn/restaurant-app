import { useState } from 'react'
import MenuItem from '../../components/MenuItem'
import './styles.css'

export default function ClientMenu({ items = [], onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Agrupar items por categoría
  const categories = Array.from(
    new Set(items.map((item) => item.category))
  ).sort()

  const filteredItems =
    selectedCategory === null
      ? items
      : items.filter((item) => item.category === selectedCategory)

  return (
    <div className="client-menu">
      <div className="menu-categories">
        <button
          className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            onAdd={() => onAddToCart(item)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-items">No hay items disponibles en esta categoría</div>
      )}
    </div>
  )
}

function getCategoryLabel(category) {
  const labels = {
    appetizers: '🥗 Entradas',
    main_course: '🍽️ Platos Principales',
    desserts: '🍰 Postres',
    beverages: '🥤 Bebidas',
    alcoholic: '🍷 Bebidas Alcohólicas',
  }
  return labels[category] || category
}
