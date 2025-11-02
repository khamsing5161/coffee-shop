import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from '../searctbox/SearchBox';

function CardSearch({ result }) {
  return (
    <Link to={`/products/${result.product_id}`}>
      <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-105 transition-transform duration-200 text-center">
        <img
          src={`http://localhost:5000${result.image}`}
          alt={result.name}
          className="rounded-md mx-auto mb-3"
        />
        <h3 className="text-lg font-semibold text-amber-900">
          {result.name}
        </h3>
        <p className="text-amber-700">{result.price} THB</p>
      </div>
    </Link>
  );
}

export default CardSearch;