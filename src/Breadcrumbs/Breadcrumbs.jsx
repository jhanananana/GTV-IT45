import React from "react";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ links }) => {
    return (
        <nav className="gtv_breadcrumbs">
            {links.map((link, index) => (
                <span key={index} className="gtv_breadcrumb-item">
                    {index < links.length - 1 ? (
                        <a href={link.path}>{link.label}</a>
                    ) : (
                        <span>{link.label}</span>
                    )}
                    {index < links.length - 1 && <span className="gtv_breadcrumb-separator">›</span>}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
