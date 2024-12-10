import { useState, useEffect, Suspense } from 'react';
import { FiDelete } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Await, useLoaderData } from 'react-router-dom';
import {
  AdvancedSearch,
  CTA,
  HeadeFilters,
  Map,
  Pagination,
  PropertyFullWidth,
  Type,
} from '../components/common/page-components';
import { closeFilterMenu, uiStore } from '../redux/features/uiSlice';
import PropertyLoader from '../components/common/PropertyLoader';
import { CgUnavailable } from 'react-icons/cg';
import PropertyList from '../components/property/PropertyList';

const Property = () => {
  const { propertyResponse } = useLoaderData();

  const pageNumber = 18;
  const { isFilterMenuOpen } = useSelector(uiStore);
  const dispatch = useDispatch();

  const handleCloseFiltermenu = (e) => {
    if (e.target.classList.contains('filter-modal')) {
      dispatch(closeFilterMenu());
    }
  };

  const [layout, setLayout] = useState('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageProperties, setCurrentPageProperties] = useState([]);

  useEffect(() => {
    if (propertyResponse && Array.isArray(propertyResponse)) {
      setCurrentPageProperties(propertyResponse.slice(0, pageNumber));
    }
  }, [propertyResponse]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
    const startIndex = selected * pageNumber;
    const endIndex = Math.min(startIndex + pageNumber, propertyResponse.length);
    if (propertyResponse && Array.isArray(propertyResponse)) {
      setCurrentPageProperties(propertyResponse.slice(startIndex, endIndex));
    }
  };

  return (
    <div className="pt-20 px-[3%] md:px-[6%]">
      <Suspense fallback={<PropertyLoader />}>
        <Await resolve={propertyResponse}>
          {(currentPageProperties) => {
            if (
              !currentPageProperties ||
              !Array.isArray(currentPageProperties)
            ) {
              return <div>Error: No properties found.</div>;
            }
            return (
              <>
                <HeadeFilters
                  layout={layout}
                  setLayout={setLayout}
                  currentPage={currentPage}
                  itemsPerPage={pageNumber}
                  totalItems={currentPageProperties.length}
                />
                <div className="grid md:grid-cols-3 gap-x-4 mt-5">
                  <div className="md:col-span-2 mt-5 md:mt-0 h-fit md:sticky top-0">
                    {currentPageProperties.length > 0 ? (
                      <>
                        {layout === 'grid' ? (
                          <PropertyList properties={currentPageProperties} />
                        ) : (
                          <PropertyFullWidth
                            properties={currentPageProperties}
                          />
                        )}
                        <Pagination
                          itemsPerPage={pageNumber}
                          pageData={currentPageProperties}
                          onPageChange={handlePageChange}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-7">
                        <span className="text-2xl">
                          Oops!
                          <CgUnavailable className="inline" />
                        </span>
                        <p className="text-2xl">No property available</p>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1 row-start-3 md:row-start-auto h-fit md:sticky top-0">
                    <div
                      className={`filter-modal ${isFilterMenuOpen && 'open'}`}
                      onClick={handleCloseFiltermenu}
                    >
                      <div
                        className={`filter-dialog ${
                          isFilterMenuOpen && 'open'
                        }`}
                      >
                        <div className="flex-center-between border-b dark:border-dark md:hidden">
                          <div
                            className="icon-box md:hidden"
                            onClick={() => dispatch(closeFilterMenu())}
                          >
                            <FiDelete />
                          </div>
                          <p className="uppercase">Filters</p>
                        </div>
                        <Suspense fallback={<p>Loading map...</p>}>
                          <Await resolve={propertyResponse}>
                            {(property) => <Map listings={property} />}
                          </Await>
                        </Suspense>
                        <AdvancedSearch />
                        <Type />
                        <CTA />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
};

export default Property;
