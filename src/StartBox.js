import React from 'react';

export default function StartBox({
  title,
  icon,
  description,
  href,
  onClick,
  children,
}) {
  return (
    <a className="start-box" tabIndex="0" href={href} onClick={onClick}>
      <div className="start-box-top">
        {icon}
        <h2>{title}</h2>
      </div>
      <div className="start-box-bottom">
        <p>{description}</p>
      </div>
    </a>
  );
}
