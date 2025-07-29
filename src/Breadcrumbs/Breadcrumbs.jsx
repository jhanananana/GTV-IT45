const Breadcrumbs = ({ links }) => {
  return (
    <nav className="flex items-center w-full text-[16px] font-medium my-2">
      {links.map((link, index) => (
        <span key={index} className="flex items-center">
          {index < links.length - 1 ? (
            <a
              href={link.path}
              className="text-gray-500 px-1 hover:underline"
            >
              {link.label}
            </a>
          ) : (
            <span className="text-gray-700 px-1">{link.label}</span>
          )}
          {index < links.length - 1 && (
            <span className="mx-3 text-gray-400 text-lg">›</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
