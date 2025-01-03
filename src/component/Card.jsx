import React from 'react';
import './Card.css';

const Card = ({image, title, location, rating, description}) => {
    return (
        <div className="Card">
            <img src={image} alt={title} className="card-image"/>
            <div className="card-content">
                <h4 className="card-title">{title}</h4>
                <p className="card-location">{location}</p>
                <p className="card-rating">⭐ {rating}</p>
                <p className="card-description">{description}</p>
            </div>
        </div>
    );
};

export default Card;
