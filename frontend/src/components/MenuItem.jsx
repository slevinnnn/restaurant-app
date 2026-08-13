import './styles/common.css'

export default function MenuItem({ item, onAdd }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'

  return (
    <div className="menu-item">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="item-image"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = fallbackImg
          }}
        />
      )}

      <div className="item-body">
        <h3>{item.name}</h3>

        {item.description && (
          <p className="description">{item.description}</p>
        )}

        <div className="item-footer">
          <span className="price">${item.price.toFixed(2)}</span>
          {item.preparation_time && (
            <span className="time">⏱️ {item.preparation_time}min</span>
          )}
        </div>

        <button
          className="add-btn"
          onClick={onAdd}
          disabled={!item.available}
          title={item.available ? 'Agregar al carrito' : 'No disponible'}
        >
          {item.available ? '+ Agregar' : 'No disponible'}
        </button>
      </div>

      {!item.available && <div className="unavailable-overlay" />}
    </div>
  )
}
