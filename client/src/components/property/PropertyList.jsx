// PropertyList.jsx
import SingleProductCard from '../common/page-components/SingleProductCard';

const PropertyList = ({ properties = [] }) => {
  console.log('PropertyList properties:', properties);

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No properties available
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {properties.map((property) => (
        <SingleProductCard key={property.id} {...property} />
      ))}
    </div>
  );
};

export default PropertyList;
