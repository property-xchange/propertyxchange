import SingleProductCard from '../common/page-components/SingleProductCard';

const PropertyList = ({ properties }) => {
  console.log('PropertyList properties:', properties);
  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {properties?.map((property) => (
        <SingleProductCard key={property.id} {...property} />
      ))}
    </div>
  );
};

export default PropertyList;
