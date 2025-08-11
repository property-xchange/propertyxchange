import SingleProductCardFullWidth from '../../common/page-components/SingleProductCardFullWidth';

const PropertyFullWidth = ({ properties = [] }) => {
  console.log('PropertyFullWidth properties:', properties);

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
    <div>
      {properties.map((property) => (
        <SingleProductCardFullWidth key={property.id} {...property} />
      ))}
    </div>
  );
};

export default PropertyFullWidth;
